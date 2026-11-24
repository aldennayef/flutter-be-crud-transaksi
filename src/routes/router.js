import express from 'express';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/users.routes.js';
import transactionRoutes from './transactions/transactions.routes.js';

const router = express.Router();

// Daftarkan semua modul rute di sini
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);

export default router;
