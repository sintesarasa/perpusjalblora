import { rateLimit } from 'express-rate-limit';

/**
 * General auth endpoints rate limiter (15 requests per 15 minutes per IP)
 */
export const authGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak permintaan dari perangkat ini. Silakan tunggu beberapa saat.',
    },
  },
});

/**
 * Strict login rate limiter (Anti Brute-Force: max 8 attempts per 15 minutes per IP)
 */
export const loginBruteForceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 8, // max 8 login attempts per IP per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed logins towards the rate limit
  message: {
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Terlalu banyak percobaan masuk yang gagal dari jaringan ini. Demi keamanan, silakan tunggu 15 menit sebelum mencoba kembali.',
    },
  },
});

/**
 * Registration rate limiter (Anti Spam/Sybil: max 5 registrations per hour per IP)
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'REGISTRATION_LIMIT_EXCEEDED',
      message: 'Batas pembuatan akun baru dari jaringan ini tercapai. Silakan coba lagi dalam 1 jam.',
    },
  },
});

/**
 * Password reset request rate limiter (Anti Enumeration/Flooding: max 4 requests per hour per IP)
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 4,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RESET_LIMIT_EXCEEDED',
      message: 'Permintaan reset password terlalu sering. Silakan tunggu 1 jam sebelum mengajukan kembali.',
    },
  },
});

/**
 * Catalog & Article search rate limiter (Anti Scraping / DB Flooding: 60 requests per minute per IP)
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: 'Pencarian terlalu cepat. Mohon tunggu beberapa detik sebelum mencari kembali.',
    },
  },
});

/**
 * Loan submission rate limiter (Anti Bot / Fast Hold: 10 requests per 10 minutes per IP)
 */
export const loanRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'LOAN_RATE_LIMIT_EXCEEDED',
      message: 'Pengajuan peminjaman terlalu sering dari perangkat ini. Silakan tunggu beberapa menit.',
    },
  },
});

/**
 * Health check rate limiter (Anti DB-Flooding: max 60 requests per minute per IP)
 */
export const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'rate_limited',
    service: 'perpusjal-api',
    error: {
      code: 'HEALTH_RATE_LIMIT_EXCEEDED',
      message: 'Pemeriksaan kesehatan sistem terlalu sering. Silakan coba lagi sebentar lagi.',
    },
  },
});

/**
 * Comment submission rate limiter (Anti Spam / Flooding: max 15 comments per 10 minutes per IP)
 */
export const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'COMMENT_RATE_LIMIT_EXCEEDED',
      message: 'Pengiriman tanggapan komentar terlalu cepat. Silakan tunggu beberapa saat.',
    },
  },
});

/**
 * Reader Letter submission rate limiter (Anti Spam: max 5 letters per 30 minutes per IP)
 */
export const letterLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'LETTER_RATE_LIMIT_EXCEEDED',
      message: 'Pengiriman surat pembaca terlalu sering. Silakan tunggu beberapa waktu sebelum mengirim kembali.',
    },
  },
});


