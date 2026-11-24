import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';

// Serialisasi BigInt agar otomatis diubah menjadi string saat JSON.stringify()
BigInt.prototype.toJSON = function () {
  return this.toString();
};

import logger from './utils/logger.util.js';
import apiRouter from './routes/router.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { keepAliveCheck } from './services/transactions/transactions.service.js';

const app = express();

// 1. HTTP Request Logger (Pino)
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
}));

// 2. Security Headers & Rate Limiting
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Memungkinkan frontend memuat gambar/file statis
  contentSecurityPolicy: false, // Memungkinkan Swagger UI memuat assets dan inline script
}));
app.use(globalLimiter); // Batasi request global (max 200 req / 15m per IP)

// 3. Cross-Origin Resource Sharing (CORS) dengan kredensial untuk HttpOnly Cookie
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 4. Response Compression (Gzip / Brotli)
app.use(compression());

// 5. Body & Cookie Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Static Files Handler (Melayani akses file hasil upload, misal: http://localhost:8899/uploads/images/xxx.webp)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// 7. Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Portfolio API!',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// Public Keep-Alive Route (ping database Supabase agar tidak idle / pause)
app.get('/keep-alive', async (req, res) => {
  try {
    const health = await keepAliveCheck();
    res.status(200).json({
      status: 'success',
      message: 'Keep-alive ping berhasil, server dan Supabase aktif.',
      data: health,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Keep-alive database gagal',
      error: error.message,
    });
  }
});

// 8. Swagger Interactive Documentation (Public)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 9. Mount Master API Router
app.use('/api', apiRouter);

// 9. 404 Handler untuk rute yang tidak terdaftar
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Rute '${req.originalUrl}' tidak ditemukan pada server ini.`,
  });
});

// 10. Centralized Global Error Handler (Express 5)
app.use((err, req, res, next) => {
  logger.error(err, '💥 Global error handler menangkap kesalahan:');

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server (Internal Server Error)';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
