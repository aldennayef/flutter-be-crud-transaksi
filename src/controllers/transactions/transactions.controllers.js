import {
  keepAliveCheck,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../services/transactions/transactions.service.js';
import logger from '../../utils/logger.util.js';

/**
 * Controller untuk keep-alive endpoint (Public, tanpa JWT)
 * Berguna untuk cron job / ping agar database Supabase tidak masuk mode paused
 */
export const keepAliveController = async (req, res) => {
  try {
    const health = await keepAliveCheck();
    return res.status(200).json({
      status: 'success',
      message: 'Keep-alive ping berhasil, server dan database aktif.',
      data: health,
    });
  } catch (error) {
    logger.error(error, '❌ Gagal melakukan keep-alive database:');
    return res.status(503).json({
      status: 'error',
      message: 'Keep-alive gagal: Tidak dapat terhubung ke database Supabase.',
      error: error.message,
    });
  }
};

/**
 * Controller: Mendapatkan semua transaksi (Protected JWT)
 */
export const getTransactionsController = async (req, res) => {
  try {
    const { page, limit, type, category, search, startDate, endDate } = req.query;
    // Opsi: Jika ingin data transaksi difilter per user yang login, gunakan req.user?.id
    // const userId = req.user?.id;
    const result = await getTransactions({
      page,
      limit,
      type,
      category,
      search,
      startDate,
      endDate,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil daftar transaksi',
      ...result,
    });
  } catch (error) {
    logger.error(error, '❌ Error getTransactionsController:');
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat mengambil data transaksi',
    });
  }
};

/**
 * Controller: Mendapatkan 1 transaksi berdasarkan ID (Protected JWT)
 */
export const getTransactionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil detail transaksi',
      data: transaction,
    });
  } catch (error) {
    logger.error(error, '❌ Error getTransactionByIdController:');
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat mengambil detail transaksi',
    });
  }
};

/**
 * Controller: Menambahkan transaksi baru (Protected JWT)
 */
export const createTransactionController = async (req, res) => {
  try {
    const userId = req.user?.id; // Didapatkan dari payload token JWT
    const newTransaction = await createTransaction(req.body, userId);

    return res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat',
      data: newTransaction,
    });
  } catch (error) {
    logger.error(error, '❌ Error createTransactionController:');
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat membuat transaksi',
    });
  }
};

/**
 * Controller: Memperbarui transaksi berdasarkan ID (Protected JWT)
 */
export const updateTransactionController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransaction = await updateTransaction(id, req.body);

    if (!updatedTransaction) {
      return res.status(404).json({
        status: 'error',
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil diperbarui',
      data: updatedTransaction,
    });
  } catch (error) {
    logger.error(error, '❌ Error updateTransactionController:');
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat memperbarui transaksi',
    });
  }
};

/**
 * Controller: Menghapus transaksi berdasarkan ID (Protected JWT)
 */
export const deleteTransactionController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTransaction(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Transaksi '${deleted.title}' berhasil dihapus`,
      data: deleted,
    });
  } catch (error) {
    logger.error(error, '❌ Error deleteTransactionController:');
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat menghapus transaksi',
    });
  }
};
