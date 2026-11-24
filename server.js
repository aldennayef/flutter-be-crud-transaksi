import 'dotenv/config';
import app from './src/app.js';
import { disconnectDB } from './prisma/prisma.js';
import logger from './src/utils/logger.util.js';

// Serialisasi BigInt agar tidak error saat diubah ke JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const PORT = process.env.PORT || 8899;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
});

// Fungsi penanganan Graceful Shutdown
let isShuttingDown = false;

const handleGracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`🛑 Menerima sinyal ${signal}. Memulai proses graceful shutdown...`);

  // Batas waktu toleransi 10 detik sebelum dipaksa berhenti
  const forceExitTimeout = setTimeout(() => {
    logger.error('⚠️ Shutdown timeout tercapai (10s). Memaksa server berhenti.');
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  try {
    // 1. Berhenti menerima koneksi HTTP baru dan tunggu request aktif selesai
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        logger.info('✅ HTTP Server berhasil ditutup.');
        resolve();
      });
    });

    // 2. Tutup koneksi database (Prisma & PG Connection Pool)
    await disconnectDB();
    logger.info('✅ Koneksi database berhasil ditutup.');

    logger.info('👋 Proses shutdown selesai. Server keluar dengan aman.');
    process.exit(0);
  } catch (error) {
    logger.error(error, '❌ Terjadi kesalahan saat proses shutdown:');
    process.exit(1);
  }
};

// Tangkap sinyal terminasi dari OS / terminal / Docker / PM2
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));   // Ctrl + C di terminal
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM')); // Sinyal kill / deploy

// Tangkap unhandled exception & rejection untuk mencegah zombie process
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, '💥 Unhandled Rejection terdeteksi:');
});

process.on('uncaughtException', (err) => {
  logger.fatal(err, '💥 Uncaught Exception terdeteksi:');
  handleGracefulShutdown('uncaughtException');
});