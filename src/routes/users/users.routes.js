import express from 'express';

// Import Validator dan Controller yang sudah Anda buat
import { getUserByUsernameValidator, createUserValidator } from '../../validators/users/users.validators.js';
import { getUserByUsernameController, createUserController } from '../../controllers/users/users.controllers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen Data Pengguna
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Buat User Baru (Password Otomatis Di-hash)
 *     tags: [Users]
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
 *         description: User berhasil dibuat.
 */
router.post('/', createUserValidator, createUserController);

// Rute untuk mencari user berdasarkan username
// Method GET, dengan parameter dinamis ':username'
// ALUR KERJA: Request -> Validator (Satpam) -> Controller (Penerima Tamu)
router.get('/:username', getUserByUsernameValidator, getUserByUsernameController);

export default router;