import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter untuk seluruh request API
 * Membatasi setiap IP maksimal 200 request per 15 menit
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200, // Maksimal 200 request per IP dalam windowMs
  standardHeaders: true, // Mengembalikan info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header lama `X-RateLimit-*`
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Terlalu banyak request dari IP Anda. Silakan coba lagi setelah 15 menit.',
  },
});

/**
 * Strict Rate Limiter khusus untuk rute Auth (Login & Refresh)
 * Membatasi percobaan brute force maksimal 10 kali per 15 menit
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per IP dalam 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Terlalu banyak percobaan autentikasi. Demi keamanan, silakan coba lagi setelah 15 menit.',
  },
});
