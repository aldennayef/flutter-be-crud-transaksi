import prisma from '../../../prisma/prisma.js';

/**
 * Memformat output transaksi agar angka Decimal dikonversi ke Number (mudah dibaca oleh Flutter/Frontend)
 */
const formatTransaction = (trx) => {
  if (!trx) return null;
  return {
    ...trx,
    amount: trx.amount ? Number(trx.amount.toString()) : 0,
  };
};

/**
 * Cek koneksi server dan database (Supabase Keep-Alive)
 * Menjalankan query ringan untuk memastikan koneksi database tetap hidup dan tidak tersuspend
 */
export const keepAliveCheck = async () => {
  const startTime = Date.now();
  // Menjalankan query paling ringan pada PostgreSQL
  await prisma.$queryRawUnsafe('SELECT 1 as alive');
  const latencyMs = Date.now() - startTime;

  return {
    status: 'ok',
    database: 'connected',
    latency: `${latencyMs}ms`,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Mengambil daftar transaksi dengan pagination, filter type/kategori/pencarian, dan rentang tanggal
 */
export const getTransactions = async ({
  page = 1,
  limit = 10,
  type,
  category,
  search,
  startDate,
  endDate,
  userId,
} = {}) => {
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Filter dinamis
  const where = {};

  if (userId) {
    where.user_id = BigInt(userId);
  }

  if (type) {
    where.type = type.toUpperCase();
  }

  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive',
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [total, transactions] = await Promise.all([
    prisma.transactions.count({ where }),
    prisma.transactions.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        date: 'desc',
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    data: transactions.map(formatTransaction),
  };
};

/**
 * Mengambil 1 detail transaksi berdasarkan ID
 */
export const getTransactionById = async (id, userId = null) => {
  const where = { id: BigInt(id) };
  if (userId) {
    where.user_id = BigInt(userId);
  }

  const transaction = await prisma.transactions.findFirst({
    where,
    include: {
      users: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return formatTransaction(transaction);
};

/**
 * Membuat transaksi baru
 */
export const createTransaction = async (data, userId = null) => {
  const payload = {
    title: data.title,
    amount: data.amount,
    type: data.type.toUpperCase(),
    category: data.category || 'General',
    description: data.description || null,
    date: data.date ? new Date(data.date) : new Date(),
  };

  if (userId) {
    payload.user_id = BigInt(userId);
  }

  const newTransaction = await prisma.transactions.create({
    data: payload,
    include: {
      users: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return formatTransaction(newTransaction);
};

/**
 * Memperbarui transaksi yang sudah ada berdasarkan ID
 */
export const updateTransaction = async (id, data, userId = null) => {
  const where = { id: BigInt(id) };
  if (userId) {
    where.user_id = BigInt(userId);
  }

  // Pastikan data yang akan diupdate memang ada
  const existing = await prisma.transactions.findFirst({ where });
  if (!existing) {
    return null;
  }

  const updatePayload = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.amount !== undefined) updatePayload.amount = data.amount;
  if (data.type !== undefined) updatePayload.type = data.type.toUpperCase();
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.date !== undefined) updatePayload.date = new Date(data.date);
  updatePayload.updated_at = new Date();

  const updated = await prisma.transactions.update({
    where: { id: BigInt(id) },
    data: updatePayload,
    include: {
      users: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return formatTransaction(updated);
};

/**
 * Menghapus transaksi berdasarkan ID
 */
export const deleteTransaction = async (id, userId = null) => {
  const where = { id: BigInt(id) };
  if (userId) {
    where.user_id = BigInt(userId);
  }

  const existing = await prisma.transactions.findFirst({ where });
  if (!existing) {
    return null;
  }

  const deleted = await prisma.transactions.delete({
    where: { id: BigInt(id) },
    select: {
      id: true,
      title: true,
    },
  });

  return deleted;
};
