import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
} from '../../services/auth/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true, // Tidak bisa diakses oleh JavaScript di browser (aman dari XSS)
  secure: process.env.NODE_ENV === 'production', // Hanya HTTPS di production
  sameSite: 'strict', // Proteksi dari serangan CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari dalam milidetik
};

/**
 * Controller: Register User Baru (Password di-hash bcrypt)
 */
export const registerController = async (req, res) => {
  const { username, password } = req.body;
  const newUser = await registerService({ username, password });

  return res.status(201).json({
    status: 'success',
    message: 'User berhasil didaftarkan dengan password ter-hash',
    data: newUser,
  });
};

/**
 * Controller: Login
 */
export const loginController = async (req, res) => {
  const { username, password } = req.body;
  const result = await loginService({ username, password });

  // Simpan Refresh Token di HttpOnly Cookie
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    status: 'success',
    message: 'Login berhasil',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // Juga disertakan di body untuk client non-browser (misal: Postman / Flutter)
    },
  });
};

/**
 * Controller: Refresh Access Token
 */
export const refreshTokenController = async (req, res) => {
  // Ambil refresh token dari Cookie atau dari Request Body
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await refreshTokenService(incomingRefreshToken);

  // Perbarui cookie dengan refresh token yang baru (Rotation)
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    status: 'success',
    message: 'Access Token berhasil diperbarui',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
};

/**
 * Controller: Logout
 */
export const logoutController = async (req, res) => {
  const userId = req.user?.id;
  
  if (userId) {
    await logoutService(userId);
  }

  // Hapus cookie
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return res.status(200).json({
    status: 'success',
    message: 'Logout berhasil. Sesi telah diakhiri.',
  });
};

/**
 * Controller: Get Current User Profile (Endpoint Terproteksi)
 */
export const getMeController = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
