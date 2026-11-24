import prisma from '../../../prisma/prisma.js';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/token.util.js';

/**
 * Service untuk registrasi user baru dengan password yang di-hash (Bcrypt)
 */
export const registerService = async ({ username, password }) => {
  // 1. Cek apakah username sudah terdaftar
  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    const error = new Error('Username sudah digunakan');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password menggunakan bcrypt dengan salt 10 rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Simpan ke database Supabase
  const newUser = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      created_at: true,
      updated_at: true,
    },
  });

  return newUser;
};

/**
 * Service untuk proses login
 */
export const loginService = async ({ username, password }) => {
  // 1. Cari user berdasarkan username
  const user = await prisma.users.findUnique({
    where: { username },
  });

  if (!user) {
    const error = new Error('Username atau password salah');
    error.statusCode = 401;
    throw error;
  }

  // 2. Verifikasi password dengan bcrypt
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    const error = new Error('Username atau password salah');
    error.statusCode = 401;
    throw error;
  }

  // 3. Buat payload token
  const tokenPayload = {
    id: user.id.toString(),
    username: user.username,
  };

  // 4. Generate Access Token & Refresh Token
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 5. Simpan refresh token ke database
  await prisma.users.update({
    where: { id: user.id },
    data: { refresh_token: refreshToken },
  });

  return {
    user: {
      id: user.id.toString(),
      username: user.username,
      created_at: user.created_at,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Service untuk memperbarui Access Token menggunakan Refresh Token
 */
export const refreshTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const error = new Error('Refresh token diperlukan');
    error.statusCode = 401;
    throw error;
  }

  // 1. Verifikasi tanda tangan JWT dari Refresh Token
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    const error = new Error('Refresh token kedaluwarsa atau tidak valid. Silakan login kembali.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Cek apakah user ada dan refresh token cocok dengan yang di database
  const user = await prisma.users.findUnique({
    where: { id: BigInt(decoded.id) },
  });

  if (!user || user.refresh_token !== incomingRefreshToken) {
    const error = new Error('Refresh token tidak sah atau telah dicabut (revoked).');
    error.statusCode = 403;
    throw error;
  }

  // 3. Refresh Token Rotation: Buat Access Token & Refresh Token baru
  const tokenPayload = {
    id: user.id.toString(),
    username: user.username,
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // 4. Update database dengan refresh token baru
  await prisma.users.update({
    where: { id: user.id },
    data: { refresh_token: newRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Service untuk logout (menghapus refresh token di DB)
 */
export const logoutService = async (userId) => {
  if (!userId) return;

  await prisma.users.update({
    where: { id: BigInt(userId) },
    data: { refresh_token: null },
  });
};
