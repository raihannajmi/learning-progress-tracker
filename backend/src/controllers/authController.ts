import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  static async verifyGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential } = req.body;
      const result = await AuthService.verifyGoogleLogin(credential);
      sendSuccess(res, result, 'Login Google berhasil');
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.statusCode, error.code);
        return;
      }
      next(error);
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
