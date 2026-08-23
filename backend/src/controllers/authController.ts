import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  static async verifyGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawToken =
        req.body?.credential ||
        req.body?.code ||
        req.body?.token ||
        req.body?.id_token ||
        (req.query?.credential as string) ||
        (req.query?.code as string);

      if (!rawToken) {
        sendError(
          res,
          'Google credential / code tidak ditemukan dalam request body maupun query params',
          400,
          'MISSING_TOKEN'
        );
        return;
      }

      console.log('🔑 Processing Google auth verification for token/code...');
      const result = await AuthService.verifyGoogleLogin(rawToken);

      // If requested via browser GET redirect, redirect to frontend with token
      if (req.method === 'GET' && req.accepts('html')) {
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?token=${result.token}`);
        return;
      }

      sendSuccess(res, result, 'Login Google berhasil');
    } catch (error: any) {
      console.error('❌ Google auth error:', error.message);
      if (error.statusCode) {
        sendError(res, error.message, error.statusCode, error.code);
        return;
      }
      sendError(res, error.message || 'Gagal memverifikasi login Google', 401, 'AUTH_FAILED');
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Tidak terotentikasi', 401);
        return;
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      sendSuccess(res, user, 'Data profil pengguna');
    } catch (error) {
      next(error);
    }
  }
}
