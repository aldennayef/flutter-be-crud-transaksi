import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup koneksi PostgreSQL dengan opsi connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);

// Inisialisasi Prisma dengan Adapter (Syarat Wajib Prisma 7)
const prisma = new PrismaClient({ adapter });

// Fungsi untuk menutup koneksi database secara bersih saat shutdown
export const disconnectDB = async () => {
  await prisma.$disconnect();
  await pool.end();
};

export default prisma;