import { db } from '../db/index.js';
import { roadmapWeeks, topics, checklistItems, checklistProgress } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';

export class RoadmapAdminService {
  // === WEEKS ===
  static async createWeek(data: {
    weekNumber: number;
    title: string;
    description?: string | null;
    isCurrent?: boolean;
  }) {
    if (data.isCurrent) {
      await db.update(roadmapWeeks).set({ isCurrent: false });
    }

    const [created] = await db
      .insert(roadmapWeeks)
      .values({
        weekNumber: data.weekNumber,
        title: data.title,
        description: data.description || null,
        isCurrent: data.isCurrent ?? false,
      })
      .returning();

    return created;
  }

  static async updateWeek(
    id: string,
    data: {
      weekNumber?: number;
      title?: string;
      description?: string | null;
      isCurrent?: boolean;
    }
  ) {
    if (data.isCurrent) {
      await db.update(roadmapWeeks).set({ isCurrent: false });
    }

    const [updated] = await db
      .update(roadmapWeeks)
      .set({
        ...(data.weekNumber !== undefined && { weekNumber: data.weekNumber }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
      })
      .where(eq(roadmapWeeks.id, id))
      .returning();

    if (!updated) {
      const error: any = new Error('Minggu silabus tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  static async setCurrentWeek(id: string) {
    await db.update(roadmapWeeks).set({ isCurrent: false });
    const [updated] = await db
      .update(roadmapWeeks)
      .set({ isCurrent: true })
      .where(eq(roadmapWeeks.id, id))
      .returning();

    if (!updated) {
      const error: any = new Error('Minggu silabus tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  static async deleteWeek(id: string) {
    const [deleted] = await db
      .delete(roadmapWeeks)
      .where(eq(roadmapWeeks.id, id))
      .returning();

    if (!deleted) {
      const error: any = new Error('Minggu silabus tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  }

  // === TOPICS ===
  static async createTopic(data: {
    weekId: string;
    title: string;
    category: 'HTML' | 'CSS' | 'JAVASCRIPT' | 'BACKEND' | 'FULLSTACK';
    sortOrder?: number;
  }) {
    const [created] = await db
      .insert(topics)
      .values({
        weekId: data.weekId,
        title: data.title,
        category: data.category,
        sortOrder: data.sortOrder ?? 1,
      })
      .returning();

    return created;
  }

  static async updateTopic(
    id: string,
    data: {
      weekId?: string;
      title?: string;
      category?: 'HTML' | 'CSS' | 'JAVASCRIPT' | 'BACKEND' | 'FULLSTACK';
      sortOrder?: number;
    }
  ) {
    const [updated] = await db
      .update(topics)
      .set({
        ...(data.weekId !== undefined && { weekId: data.weekId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      })
      .where(eq(topics.id, id))
      .returning();

    if (!updated) {
      const error: any = new Error('Topik tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  static async deleteTopic(id: string) {
    const [deleted] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();

    if (!deleted) {
      const error: any = new Error('Topik tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  }

  // === CHECKLIST ITEMS ===
  static async createChecklist(data: {
    topicId: string;
    statement: string;
    sortOrder?: number;
  }) {
    const [created] = await db
      .insert(checklistItems)
      .values({
        topicId: data.topicId,
        statement: data.statement,
        sortOrder: data.sortOrder ?? 1,
      })
      .returning();

    return created;
  }

  static async updateChecklist(
    id: string,
    data: {
      topicId?: string;
      statement?: string;
      sortOrder?: number;
    }
  ) {
    const [updated] = await db
      .update(checklistItems)
      .set({
        ...(data.topicId !== undefined && { topicId: data.topicId }),
        ...(data.statement !== undefined && { statement: data.statement }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      })
      .where(eq(checklistItems.id, id))
      .returning();

    if (!updated) {
      const error: any = new Error('Checklist item tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  static async deleteChecklist(id: string) {
    const [deleted] = await db
      .delete(checklistItems)
      .where(eq(checklistItems.id, id))
      .returning();

    if (!deleted) {
      const error: any = new Error('Checklist item tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  }
}
