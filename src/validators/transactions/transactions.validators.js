import Joi from 'joi';
import { validate } from '../../middlewares/validate.middleware.js';

// Validasi parameter ID (harus angka positif / integer / bigint string)
export const transactionIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID transaksi harus berupa angka yang valid',
      'any.required': 'ID transaksi wajib dicantumkan',
    }),
});

// Validasi pembuatan transaksi baru
export const createTransactionSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.base': 'Judul transaksi harus berupa teks',
      'string.empty': 'Judul transaksi tidak boleh kosong',
      'string.max': 'Judul transaksi maksimal {#limit} karakter',
      'any.required': 'Judul transaksi wajib diisi',
    }),
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Nominal (amount) harus berupa angka',
      'number.positive': 'Nominal (amount) harus lebih dari 0',
      'any.required': 'Nominal (amount) wajib diisi',
    }),
  type: Joi.string()
    .trim()
    .uppercase()
    .valid('INCOME', 'EXPENSE')
    .required()
    .messages({
      'any.only': 'Tipe transaksi harus bernilai INCOME atau EXPENSE',
      'any.required': 'Tipe transaksi wajib diisi',
    }),
  category: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
    .default('General'),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('', null),
  date: Joi.date()
    .iso()
    .default(() => new Date()),
});

// Validasi perubahan / update transaksi
export const updateTransactionSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .messages({
      'string.base': 'Judul transaksi harus berupa teks',
      'string.empty': 'Judul transaksi tidak boleh kosong',
      'string.max': 'Judul transaksi maksimal {#limit} karakter',
    }),
  amount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      'number.base': 'Nominal (amount) harus berupa angka',
      'number.positive': 'Nominal (amount) harus lebih dari 0',
    }),
  type: Joi.string()
    .trim()
    .uppercase()
    .valid('INCOME', 'EXPENSE')
    .messages({
      'any.only': 'Tipe transaksi harus bernilai INCOME atau EXPENSE',
    }),
  category: Joi.string()
    .trim()
    .max(100)
    .allow('', null),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('', null),
  date: Joi.date()
    .iso(),
})
  .min(1)
  .messages({
    'object.min': 'Minimal salah satu kolom harus diisi untuk memperbarui data transaksi',
  });

// Validasi query parameter untuk filter dan pagination
export const getTransactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  type: Joi.string().trim().uppercase().valid('INCOME', 'EXPENSE'),
  category: Joi.string().trim().max(100),
  search: Joi.string().trim().max(100),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
});

// Export validator middleware
export const createTransactionValidator = validate(createTransactionSchema, 'body');
export const updateTransactionValidator = validate({
  params: transactionIdParamSchema,
  body: updateTransactionSchema,
});
export const getTransactionByIdValidator = validate(transactionIdParamSchema, 'params');
export const deleteTransactionValidator = validate(transactionIdParamSchema, 'params');
export const getTransactionsQueryValidator = validate(getTransactionsQuerySchema, 'query');
