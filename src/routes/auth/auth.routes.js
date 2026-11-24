import express from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getMeController,
} from '../../controllers/auth/auth.controllers.js';
import { loginValidator } from '../../validators/auth/auth.validators.js';
import { createUserValidator } from '../../validators/users/users.validators.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi Pengguna & Manajemen Token JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi Pengguna Baru (Password Di-hash Bcrypt)
 *     description: Mendaftarkan akun user baru dengan password yang otomatis di-hash menggunakan algoritma Bcrypt sebelum disimpan ke Supabase.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: budi
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan dengan password ter-hash.
 *       400:
 *         description: Validasi input gagal.
 *       409:
 *         description: Username sudah digunakan.
 */
router.post('/register', authLimiter, createUserValidator, registerController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login Pengguna
 *     description: Mengautentikasi pengguna dan mengembalikan Access Token (JWT) untuk mengakses endpoint transaksi.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: budi
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Berhasil login dan mendapatkan token.
 *       401:
 *         description: Username atau password salah.
 */
router.post('/login', authLimiter, loginValidator, loginController);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Perbarui Access Token
 *     description: Memperbarui Access Token menggunakan Refresh Token dari cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access Token baru berhasil dibuat.
 *       401:
 *         description: Refresh token tidak valid atau kedaluwarsa.
 */
router.post('/refresh', authLimiter, refreshTokenController);

// ==========================================
// 🔒 PROTECTED ROUTES (Wajib Login)
// ==========================================
router.use(authenticateToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil Profil User yang Sedang Login
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', getMeController);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout Pengguna
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil logout.
 */
router.post('/logout', logoutController);

export default router;
