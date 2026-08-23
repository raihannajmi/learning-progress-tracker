import { db } from '../db/index.js';
import { users, learningSprints, peerFeedback } from '../db/schema.js';
import { eq, and, sql, or, ilike } from 'drizzle-orm';

export class AdminInstructorService {
  static async listInstructors(filters?: { search?: string }) {
    const conditions: any[] = [eq(users.role, 'ADMIN')];

    if (filters?.search && filters.search.trim()) {
      const s = `%${filters.search.trim()}%`;
      conditions.push(or(ilike(users.name, s), ilike(users.email, s)));
    }

    const whereClause = and(...conditions);

    const instructors = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        reviewedCount: sql<number>`count(distinct ${learningSprints.id})::int`,
        feedbackCount: sql<number>`count(distinct ${peerFeedback.id})::int`,
      })
      .from(users)
      .leftJoin(learningSprints, eq(users.id, learningSprints.reviewedById))
      .leftJoin(peerFeedback, eq(users.id, peerFeedback.authorId))
      .where(whereClause)
      .groupBy(users.id)
      .orderBy(users.name);

    return {
      data: instructors,
      total: instructors.length,
    };
  }

  static async addInstructor(data: { name: string; email: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      const err: any = new Error(
        `User dengan email '${normalizedEmail}' sudah terdaftar (${existing.role === 'ADMIN' ? 'Dosen/TA' : 'Mahasiswa'}).`
      );
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const [created] = await db
      .insert(users)
      .values({
        name: data.name.trim(),
        email: normalizedEmail,
        role: 'ADMIN',
        isActive: true,
      })
      .returning();

    return created;
  }

  static async updateInstructor(
    id: string,
    data: { name?: string; email?: string; isActive?: boolean },
    currentAdminId: string
  ) {
    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!target || target.role !== 'ADMIN') {
      const err: any = new Error('Data Dosen/Pengajar tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'INSTRUCTOR_NOT_FOUND';
      throw err;
    }

    if (data.isActive === false && id === currentAdminId) {
      const err: any = new Error('Anda tidak dapat menonaktifkan akun Dosen/Admin Anda sendiri.');
      err.statusCode = 400;
      err.code = 'CANNOT_DEACTIVATE_SELF';
      throw err;
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.email !== undefined) {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (normalizedEmail !== target.email) {
        // Check uniqueness
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (existing) {
          const err: any = new Error(`Email '${normalizedEmail}' sudah digunakan.`);
          err.statusCode = 409;
          err.code = 'EMAIL_ALREADY_EXISTS';
          throw err;
        }
        updatePayload.email = normalizedEmail;
      }
    }

    const [updated] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  static async deleteInstructor(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      const err: any = new Error('Anda tidak dapat menghapus akun Anda sendiri.');
      err.statusCode = 400;
      err.code = 'CANNOT_DELETE_SELF';
      throw err;
    }

    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!target || target.role !== 'ADMIN') {
      const err: any = new Error('Data Dosen/Pengajar tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'INSTRUCTOR_NOT_FOUND';
      throw err;
    }

    // Check total active admins remaining
    const [adminCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'ADMIN'));

    if ((adminCountResult?.count || 0) <= 1) {
      const err: any = new Error('Minimal harus ada 1 Dosen/Admin aktif pada sistem.');
      err.statusCode = 400;
      err.code = 'LAST_ADMIN';
      throw err;
    }

    await db.delete(users).where(eq(users.id, id));

    return { success: true, message: `Akun Dosen '${target.name}' berhasil dihapus.` };
  }
}
