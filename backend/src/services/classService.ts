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
        createdAt: classes.createdAt,
        studentCount: sql<number>`count(${users.id})::int`,
      })
      .from(classes)
      .leftJoin(users, eq(classes.id, users.classId))
      .groupBy(classes.id)
      .orderBy(classes.name);

    return list;
  }

  static async createClass(name: string, academicTerm: string) {
    const [newClass] = await db
      .insert(classes)
      .values({ name, academicTerm })
      .returning();
    return newClass;
  }
}
