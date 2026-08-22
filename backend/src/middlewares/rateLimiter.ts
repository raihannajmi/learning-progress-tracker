import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
