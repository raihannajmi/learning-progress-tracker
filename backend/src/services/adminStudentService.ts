import { db } from '../db/index.js';
import { users, classes, learningSprints, checklistProgress } from '../db/schema.js';
import { eq, and, sql, desc, or, ilike } from 'drizzle-orm';

export class AdminStudentService {
  static async listStudents(filters?: {
    classId?: string;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters?.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(users.role, 'STUDENT')];

    if (filters?.classId) {
      conditions.push(eq(users.classId, filters.classId));
    }
    if (filters?.status === 'active') {
      conditions.push(eq(users.isActive, true));
    } else if (filters?.status === 'inactive') {
      conditions.push(eq(users.isActive, false));
    }
    if (filters?.search && filters.search.trim()) {
      const s = `%${filters.search.trim()}%`;
      conditions.push(or(ilike(users.name, s), ilike(users.email, s), ilike(users.nim, s)));
    }

    const whereClause = and(...conditions);

    // 1. Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .where(whereClause);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // 2. Query paginated students
    const students = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        nim: users.nim,
        role: users.role,
        classId: users.classId,
        className: classes.name,
        githubRepoUrl: users.githubRepoUrl,
        githubPageUrl: users.githubPageUrl,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        sprintCount: sql<number>`count(distinct ${learningSprints.id})::int`,
        checkedCount: sql<number>`count(distinct case when ${checklistProgress.status} = 'CAN_DO_INDEPENDENTLY' then ${checklistProgress.id} end)::int`,
      })
      .from(users)
      .leftJoin(classes, eq(users.classId, classes.id))
      .leftJoin(learningSprints, eq(users.id, learningSprints.userId))
      .leftJoin(checklistProgress, eq(users.id, checklistProgress.userId))
      .where(whereClause)
      .groupBy(users.id, classes.name)
      .orderBy(users.name)
      .limit(limit)
      .offset(offset);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async addStudent(data: {
    name: string;
    email: string;
    nim: string;
    classId: string;
    githubRepoUrl?: string;
    githubPageUrl?: string;
  }) {
    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing) {
      const err: any = new Error(`Mahasiswa dengan email '${data.email}' sudah terdaftar.`);
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const [newStudent] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email.toLowerCase(),
        nim: data.nim,
        role: 'STUDENT',
        classId: data.classId,
        githubRepoUrl: data.githubRepoUrl || null,
        githubPageUrl: data.githubPageUrl || null,
      })
      .returning();

    return newStudent;
  }

  static async batchAddStudents(
    classId: string,
    studentList: Array<{
      name: string;
      email: string;
      nim: string;
      classId?: string;
      className?: string;
      githubRepoUrl?: string;
      githubPageUrl?: string;
    }>
  ) {
    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const dbClasses = await db.select().from(classes);
    const classMap = new Map<string, string>();
    dbClasses.forEach((c) => {
      classMap.set(c.name.trim().toLowerCase(), c.id);
      classMap.set(c.id, c.id);
    });

    for (const student of studentList) {
      try {
        const normClassName = student.className ? student.className.trim().toLowerCase() : '';
        const targetClassId =
          (normClassName ? classMap.get(normClassName) : undefined) ||
          student.classId ||
          classId ||
          dbClasses[0]?.id;

        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, student.email.toLowerCase()))
          .limit(1);

        if (existing) {
          // If already exists, update their classId to the correct targetClassId if different!
          if (existing.classId !== targetClassId) {
            await db
              .update(users)
              .set({ classId: targetClassId })
              .where(eq(users.id, existing.id));
            results.added++;
          } else {
            results.skipped++;
          }
          continue;
        }

        const username = student.email.split('@')[0];

        await db.insert(users).values({
          name: student.name.trim(),
          email: student.email.trim().toLowerCase(),
          nim: student.nim.trim(),
          role: 'STUDENT',
          classId: targetClassId,
          githubRepoUrl: student.githubRepoUrl || `https://github.com/${username}/webdev-portfolio`,
          githubPageUrl: student.githubPageUrl || `https://${username}.github.io/webdev-portfolio`,
        });

        results.added++;
      } catch (err: any) {
        results.skipped++;
        results.errors.push(`Gagal menambahkan ${student.email}: ${err.message}`);
      }
    }

    return results;
  }

  static async updateStudent(
    studentId: string,
    data: {
      name?: string;
      email?: string;
      nim?: string;
      classId?: string;
      githubRepoUrl?: string;
      githubPageUrl?: string;
      isActive?: boolean;
    }
  ) {
    const [updated] = await db
      .update(users)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.nim && { nim: data.nim }),
        ...(data.classId && { classId: data.classId }),
        ...(data.githubRepoUrl !== undefined && { githubRepoUrl: data.githubRepoUrl }),
        ...(data.githubPageUrl !== undefined && { githubPageUrl: data.githubPageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(users.id, studentId))
      .returning();

    if (!updated) {
      const err: any = new Error('Mahasiswa tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    return updated;
  }

  static async deleteStudent(studentId: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, studentId))
      .returning();

    if (!deleted) {
      const err: any = new Error('Mahasiswa tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    return deleted;
  }
}
