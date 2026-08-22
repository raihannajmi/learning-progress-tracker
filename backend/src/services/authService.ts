import { db } from '../db/index.js';
import { users, classes } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyGoogleCredential } from '../utils/googleAuth.js';
import { signToken } from '../utils/jwt.js';

export class AuthService {
  static async verifyGoogleLogin(credential: string) {
    const profile = await verifyGoogleCredential(credential);

    // Look up user in database by whitelisted email
    const [userRecord] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        nim: users.nim,
        role: users.role,
        classId: users.classId,
        avatarUrl: users.avatarUrl,
        githubRepoUrl: users.githubRepoUrl,
        githubPageUrl: users.githubPageUrl,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, profile.email.toLowerCase()))
      .limit(1);

    if (!userRecord) {
      const error: any = new Error(
        `Email '${profile.email}' belum terdaftar di sistem. Silakan hubungi Dosen atau Asisten Dosen untuk didaftarkan ke kelas.`
      );
      error.statusCode = 403;
      error.code = 'NOT_WHITELISTED';
      throw error;
    }

    if (!userRecord.isActive) {
      const error: any = new Error(
        'Akun Anda saat ini dinonaktifkan. Silakan hubungi Dosen/Asisten Dosen.'
      );
      error.statusCode = 403;
      error.code = 'ACCOUNT_INACTIVE';
      throw error;
    }

    // Update avatar if provided and not yet set or changed
    if (profile.picture && profile.picture !== userRecord.avatarUrl) {
      await db
        .update(users)
        .set({ avatarUrl: profile.picture })
        .where(eq(users.id, userRecord.id));
      userRecord.avatarUrl = profile.picture;
    }

    // Sign JWT
    const token = signToken({
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      classId: userRecord.classId,
    });

    return {
      token,
      user: userRecord,
    };
  }

  static async getCurrentUser(userId: string) {
    const [userRecord] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        nim: users.nim,
        role: users.role,
        classId: users.classId,
        className: classes.name,
        classAcademicTerm: classes.academicTerm,
        avatarUrl: users.avatarUrl,
        githubRepoUrl: users.githubRepoUrl,
        githubPageUrl: users.githubPageUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(classes, eq(users.classId, classes.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord) {
      const error: any = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return userRecord;
  }
}
