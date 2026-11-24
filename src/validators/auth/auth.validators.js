import Joi from 'joi';
import { validate } from '../../middlewares/validate.middleware.js';

// Schema validasi login
export const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Username harus berupa teks',
      'string.empty': 'Username tidak boleh kosong',
      'any.required': 'Username wajib diisi',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.base': 'Password harus berupa teks',
      'string.empty': 'Password tidak boleh kosong',
      'any.required': 'Password wajib diisi',
    }),
});

// Middleware siap pakai untuk router auth
export const loginValidator = validate(loginSchema, 'body');