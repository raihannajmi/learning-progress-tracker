import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: 'STUDENT' | 'ADMIN';
        nim?: string | null;
        classId?: string | null;
        avatarUrl?: string | null;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Akses ditolak. Token otentikasi tidak ditemukan.', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);

    // Fetch user from DB to ensure still active
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!userRecord || !userRecord.isActive) {
      sendError(
        res,
        'Akun tidak aktif atau tidak ditemukan.',
        403,
        'ACCOUNT_INACTIVE'
      );
      return;
    }

    req.user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      nim: userRecord.nim,
      classId: userRecord.classId,
      avatarUrl: userRecord.avatarUrl,
    };

    next();
  } catch (error) {
    sendError(res, 'Token tidak valid atau telah kedaluwarsa.', 401, 'INVALID_TOKEN');
  }
};

export const requireRole = (...allowedRoles: ('STUDENT' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Otentikasi diperlukan.', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'Anda tidak memiliki hak akses untuk tindakan ini.',
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};
