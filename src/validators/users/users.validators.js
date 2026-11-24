import Joi from 'joi';
import { validate } from '../../middlewares/validate.middleware.js';

// Schema validasi URL parameter: :username
export const getUserByUsernameSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(1)
    .max(32)
    .required()
    .messages({
      'string.base': 'Username harus berupa teks',
      'string.empty': 'Username tidak boleh kosong',
      'string.min': 'Username minimal {#limit} karakter',
      'string.max': 'Username maksimal {#limit} karakter',
      'any.required': 'Username wajib diisi',
    }),
});

// Schema validasi pembuatan user baru
export const createUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(32)
    .required()
    .messages({
      'string.base': 'Username harus berupa teks',
      'string.pattern.base': 'Username hanya boleh berisi huruf, angka, dan underscore (_)',
      'string.empty': 'Username tidak boleh kosong',
      'string.min': 'Username minimal {#limit} karakter',
      'string.max': 'Username maksimal {#limit} karakter',
      'any.required': 'Username wajib diisi',
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.base': 'Password harus berupa teks',
      'string.empty': 'Password tidak boleh kosong',
      'string.min': 'Password minimal {#limit} karakter',
      'string.max': 'Password maksimal {#limit} karakter',
      'any.required': 'Password wajib diisi',
    }),
});

// Middleware siap pakai untuk router
export const getUserByUsernameValidator = validate(getUserByUsernameSchema, 'params');
export const createUserValidator = validate(createUserSchema, 'body');