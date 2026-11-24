import { verifyAccessToken } from '../utils/token.util.js';

/**
 * Middleware untuk memproteksi endpoint privat menggunakan Access Token
 * Header yang diharapkan: Authorization: Bearer <access_token>
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak: Token autentikasi tidak ditemukan.',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Menyimpan payload user (id, username) ke request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Access Token telah kedaluwarsa. Silakan refresh token Anda.',
      });
    }

    return res.status(403).json({
      status: 'error',
      message: 'Access Token tidak valid.',
    });
  }
};
