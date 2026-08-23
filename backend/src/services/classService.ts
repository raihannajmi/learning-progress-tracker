import { db } from '../db/index.js';
import { classes, users } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export class ClassService {
  static async getAllClasses() {
    const list = await db
      .select({
        id: classes.id,
        name: classes.name,
        academicTerm: classes.academicTerm,
        startDate: classes.startDate,
        createdAt: classes.createdAt,
        studentCount: sql<number>`count(${users.id})::int`,
      })
      .from(classes)
      .leftJoin(users, eq(classes.id, users.classId))
      .groupBy(classes.id)
      .orderBy(classes.name);

    return list;
  }

  static async createClass(name: string, academicTerm: string, startDate?: Date) {
    const [newClass] = await db
      .insert(classes)
      .values({ name, academicTerm, startDate })
      .returning();
    return newClass;
  }

  static async updateClass(id: string, data: { name?: string; academicTerm?: string; startDate?: Date | null }) {
    const [updated] = await db
      .update(classes)
      .set(data)
      .where(eq(classes.id, id))
      .returning();
    return updated;
  }

  static async deleteClass(id: string) {
    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.classId, id));

    if ((countRes?.count || 0) > 0) {
      const err: any = new Error(
        `Tidak dapat menghapus kelas karena terdapat ${countRes.count} mahasiswa terdaftar di kelas ini.`
      );
      err.statusCode = 400;
      throw err;
    }

    const [deleted] = await db.delete(classes).where(eq(classes.id, id)).returning();
    return deleted;
  }
}
