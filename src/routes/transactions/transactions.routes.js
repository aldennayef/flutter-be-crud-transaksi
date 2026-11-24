import express from 'express';
import {
  keepAliveController,
  getTransactionsController,
  getTransactionByIdController,
  createTransactionController,
  updateTransactionController,
  deleteTransactionController,
} from '../../controllers/transactions/transactions.controllers.js';
import {
  createTransactionValidator,
  updateTransactionValidator,
  getTransactionByIdValidator,
  deleteTransactionValidator,
  getTransactionsQueryValidator,
} from '../../validators/transactions/transactions.validators.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Modul CRUD Transaksi dan Keep-Alive Supabase
 */

/**
 * @swagger
 * /api/transactions/keep-alive:
 *   get:
 *     summary: Keep-Alive Server & Supabase Database (Public)
 *     description: Endpoint publik tanpa token JWT untuk melakukan ping ke database PostgreSQL Supabase agar tidak masuk mode idle/paused.
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Server dan koneksi Supabase aktif.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Keep-alive ping berhasil, server dan database aktif.
 *               data:
 *                 status: ok
 *                 database: connected
 *                 latency: 35ms
 *                 timestamp: 2026-11-24T17:35:00.000Z
 *       503:
 *         description: Gagal terhubung ke database Supabase.
 */
router.get('/keep-alive', keepAliveController);

// ==========================================
// 🔒 PROTECTED CRUD ROUTES (Wajib JWT)
// Semua rute di bawah baris ini mewajibkan header: Authorization: Bearer <token>
// ==========================================
router.use(authenticateToken);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Ambil Daftar Transaksi
 *     description: Mengambil seluruh data transaksi dengan dukungan pagination, pencarian teks, serta filter berdasarkan tipe, kategori, dan rentang tanggal.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter tipe transaksi (INCOME atau EXPENSE)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter kategori transaksi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian pada judul atau deskripsi
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal awal (ISO format, misal 2026-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (ISO format, misal 2026-12-31)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data transaksi.
 *       401:
 *         description: Token autentikasi tidak ditemukan atau kedaluwarsa.
 */
router.get('/', getTransactionsQueryValidator, getTransactionsController);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Ambil Detail Transaksi Berdasarkan ID
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Data transaksi ditemukan.
 *       404:
 *         description: Transaksi tidak ditemukan.
 *       401:
 *         description: Unauthorized.
 */
router.get('/:id', getTransactionByIdValidator, getTransactionByIdController);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Tambah Transaksi Baru
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionInput'
 *     responses:
 *       201:
 *         description: Transaksi berhasil ditambahkan.
 *       400:
 *         description: Validasi input gagal.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', createTransactionValidator, createTransactionController);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Perbarui Data Transaksi Berdasarkan ID
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi yang ingin diubah
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionInput'
 *     responses:
 *       200:
 *         description: Transaksi berhasil diperbarui.
 *       404:
 *         description: Transaksi tidak ditemukan.
 *       400:
 *         description: Validasi input gagal.
 *       401:
 *         description: Unauthorized.
 */
router.put('/:id', updateTransactionValidator, updateTransactionController);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Hapus Transaksi Berdasarkan ID
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi yang ingin dihapus
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus.
 *       404:
 *         description: Transaksi tidak ditemukan.
 *       401:
 *         description: Unauthorized.
 */
router.delete('/:id', deleteTransactionValidator, deleteTransactionController);

export default router;
