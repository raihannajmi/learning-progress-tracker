import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404, 'NOT_FOUND');
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('💥 Unhandled Exception:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  sendError(
    res,
    message,
    statusCode,
    code,
    process.env.NODE_ENV !== 'production' ? err.stack : undefined
  );
};
