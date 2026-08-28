import { db } from '../db/index.js';
import {
  learningSprints,
  users,
  classes,
  topics,
  peerFeedback,
} from '../db/schema.js';
import { eq, desc, asc, and, sql, or, ilike, inArray } from 'drizzle-orm';

export class SprintService {
  static async listSprints(filters?: {
    classId?: string;
    userId?: string;
    needsFeedback?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters?.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(learningSprints.userId, filters.userId));
    }

    if (filters?.classId) {
      conditions.push(eq(users.classId, filters.classId));
    }

    if (filters?.needsFeedback !== undefined && filters?.needsFeedback !== null) {
      conditions.push(eq(learningSprints.needsFeedback, Boolean(filters.needsFeedback)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .where(whereClause);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Get paginated sprints with student & topic relations
    const sprints = await db
      .select({
        id: learningSprints.id,
        durationMinutes: learningSprints.durationMinutes,
        whatLearned: learningSprints.whatLearned,
        whatPracticed: learningSprints.whatPracticed,
        confusingParts: learningSprints.confusingParts,
        evidenceUrl: learningSprints.evidenceUrl,
        loomUrl: learningSprints.loomUrl,
        demoUrl: learningSprints.demoUrl,
        evidenceType: learningSprints.evidenceType,
        reviewStatus: learningSprints.reviewStatus,
        needsFeedback: learningSprints.needsFeedback,
        instructorFeedback: learningSprints.instructorFeedback,
        reviewedAt: learningSprints.reviewedAt,
        createdAt: learningSprints.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          role: users.role,
          className: classes.name,
          nim: users.nim,
        },
        topic: {
          id: topics.id,
          title: topics.title,
          category: topics.category,
        },
      })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .leftJoin(classes, eq(users.classId, classes.id))
      .leftJoin(topics, eq(learningSprints.topicId, topics.id))
      .where(whereClause)
      .orderBy(desc(learningSprints.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch peer feedbacks for these sprints in chronological order (chat thread: oldest -> newest at bottom)
    const sprintIds = sprints.map((s) => s.id);
    const feedbackMap = new Map<string, any[]>();

    if (sprintIds.length > 0) {
      const feedbacks = await db
        .select({
          id: peerFeedback.id,
          sprintId: peerFeedback.sprintId,
          comment: peerFeedback.comment,
          createdAt: peerFeedback.createdAt,
          author: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
            role: users.role,
          },
        })
        .from(peerFeedback)
        .innerJoin(users, eq(peerFeedback.authorId, users.id))
        .where(inArray(peerFeedback.sprintId, sprintIds))
        .orderBy(asc(peerFeedback.createdAt));

      for (const fb of feedbacks) {
        if (!feedbackMap.has(fb.sprintId)) {
          feedbackMap.set(fb.sprintId, []);
        }
        feedbackMap.get(fb.sprintId)!.push(fb);
      }
    }

    const data = sprints.map((s) => ({
      ...s,
      isHabitQualified: s.durationMinutes >= 25,
      feedbacks: feedbackMap.get(s.id) || [],
      feedbackCount: (feedbackMap.get(s.id) || []).length,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async listReviewQueue(filters?: {
    classId?: string;
    status?: 'ALL' | 'PENDING' | 'REVIEWED';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters?.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters?.classId) {
      conditions.push(eq(users.classId, filters.classId));
    }
    if (filters?.status && filters.status !== 'ALL') {
      conditions.push(eq(learningSprints.reviewStatus, filters.status));
    }
    if (filters?.search && filters.search.trim()) {
      const s = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(users.name, s),
          ilike(users.nim, s),
          ilike(learningSprints.whatLearned, s),
          ilike(topics.title, s)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .leftJoin(topics, eq(learningSprints.topicId, topics.id))
      .where(whereClause);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Query submissions
    const submissions = await db
      .select({
        id: learningSprints.id,
        durationMinutes: learningSprints.durationMinutes,
        whatLearned: learningSprints.whatLearned,
        whatPracticed: learningSprints.whatPracticed,
        confusingParts: learningSprints.confusingParts,
        evidenceUrl: learningSprints.evidenceUrl,
        loomUrl: learningSprints.loomUrl,
        demoUrl: learningSprints.demoUrl,
        evidenceType: learningSprints.evidenceType,
        reviewStatus: learningSprints.reviewStatus,
        instructorFeedback: learningSprints.instructorFeedback,
        reviewedAt: learningSprints.reviewedAt,
        createdAt: learningSprints.createdAt,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          nim: users.nim,
          avatarUrl: users.avatarUrl,
          className: classes.name,
          githubRepoUrl: users.githubRepoUrl,
          githubPageUrl: users.githubPageUrl,
        },
        topic: {
          id: topics.id,
          title: topics.title,
          category: topics.category,
        },
      })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .leftJoin(classes, eq(users.classId, classes.id))
      .leftJoin(topics, eq(learningSprints.topicId, topics.id))
      .where(whereClause)
      .orderBy(
        // Prioritize PENDING reviews first
        sql`CASE WHEN ${learningSprints.reviewStatus} = 'PENDING' THEN 0 ELSE 1 END`,
        desc(learningSprints.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // Fetch feedbacks count & items
    const sprintIds = submissions.map((s) => s.id);
    const feedbackMap = new Map<string, any[]>();

    if (sprintIds.length > 0) {
      const feedbacks = await db
        .select({
          id: peerFeedback.id,
          sprintId: peerFeedback.sprintId,
          comment: peerFeedback.comment,
          createdAt: peerFeedback.createdAt,
          author: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
            role: users.role,
          },
        })
        .from(peerFeedback)
        .innerJoin(users, eq(peerFeedback.authorId, users.id))
        .orderBy(desc(peerFeedback.createdAt));

      for (const fb of feedbacks) {
        if (!feedbackMap.has(fb.sprintId)) {
          feedbackMap.set(fb.sprintId, []);
        }
        feedbackMap.get(fb.sprintId)!.push(fb);
      }
    }

    const data = submissions.map((s) => ({
      ...s,
      isHabitQualified: s.durationMinutes >= 25,
      feedbacks: feedbackMap.get(s.id) || [],
      feedbackCount: (feedbackMap.get(s.id) || []).length,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async submitInstructorReview(
    sprintId: string,
    instructorId: string,
    data: {
      instructorFeedback: string;
      reviewStatus?: 'REVIEWED' | 'PENDING';
    }
  ) {
    const [sprint] = await db
      .select()
      .from(learningSprints)
      .where(eq(learningSprints.id, sprintId))
      .limit(1);

    if (!sprint) {
      const err: any = new Error('Learning sprint tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const [updated] = await db
      .update(learningSprints)
      .set({
        instructorFeedback: data.instructorFeedback.trim(),
        reviewStatus: data.reviewStatus || 'REVIEWED',
        reviewedById: instructorId,
        reviewedAt: new Date(),
      })
      .where(eq(learningSprints.id, sprintId))
      .returning();

    // Also add to peerFeedback as an official instructor entry
    const [instructor] = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, instructorId))
      .limit(1);

    return {
      ...updated,
      reviewer: instructor,
    };
  }

  static async getSprintById(sprintId: string) {
    const [sprint] = await db
      .select({
        id: learningSprints.id,
        durationMinutes: learningSprints.durationMinutes,
        whatLearned: learningSprints.whatLearned,
        whatPracticed: learningSprints.whatPracticed,
        confusingParts: learningSprints.confusingParts,
        evidenceUrl: learningSprints.evidenceUrl,
        loomUrl: learningSprints.loomUrl,
        demoUrl: learningSprints.demoUrl,
        evidenceType: learningSprints.evidenceType,
        reviewStatus: learningSprints.reviewStatus,
        instructorFeedback: learningSprints.instructorFeedback,
        reviewedAt: learningSprints.reviewedAt,
        createdAt: learningSprints.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          nim: users.nim,
          avatarUrl: users.avatarUrl,
          className: classes.name,
        },
        topic: {
          id: topics.id,
          title: topics.title,
          category: topics.category,
        },
      })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .leftJoin(classes, eq(users.classId, classes.id))
      .leftJoin(topics, eq(learningSprints.topicId, topics.id))
      .where(eq(learningSprints.id, sprintId))
      .limit(1);

    if (!sprint) {
      const err: any = new Error('Learning sprint tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const feedbacks = await db
      .select({
        id: peerFeedback.id,
        comment: peerFeedback.comment,
        createdAt: peerFeedback.createdAt,
        author: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
          role: users.role,
        },
      })
      .from(peerFeedback)
      .innerJoin(users, eq(peerFeedback.authorId, users.id))
      .where(eq(peerFeedback.sprintId, sprintId))
      .orderBy(desc(peerFeedback.createdAt));

    return {
      ...sprint,
      isHabitQualified: sprint.durationMinutes >= 25,
      feedbacks,
    };
  }

  static async createSprint(
    userId: string,
    data: {
      topicId?: string | null;
      durationMinutes: number;
      whatLearned: string;
      whatPracticed: string;
      confusingParts?: string | null;
      evidenceUrl?: string | null;
      loomUrl?: string | null;
      demoUrl?: string | null;
      evidenceType?: 'GITHUB' | 'GITHUB_PAGES' | 'LOOM' | 'FIGMA' | 'LIVE_DEMO' | 'OTHER';
      needsFeedback?: boolean;
    }
  ) {
    const [newSprint] = await db
      .insert(learningSprints)
      .values({
        userId,
        topicId: data.topicId || null,
        durationMinutes: data.durationMinutes,
        whatLearned: data.whatLearned,
        whatPracticed: data.whatPracticed,
        confusingParts: data.confusingParts || null,
        evidenceUrl: data.evidenceUrl || null,
        loomUrl: data.loomUrl || null,
        demoUrl: data.demoUrl || null,
        evidenceType: data.evidenceType || 'OTHER',
        reviewStatus: 'PENDING',
        needsFeedback: Boolean(data.needsFeedback),
      })
      .returning();

    return {
      ...newSprint,
      isHabitQualified: newSprint.durationMinutes >= 25,
    };
  }

  static async addFeedback(sprintId: string, authorId: string, comment: string) {
    const [sprint] = await db
      .select()
      .from(learningSprints)
      .where(eq(learningSprints.id, sprintId))
      .limit(1);

    if (!sprint) {
      const err: any = new Error('Learning sprint tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const [newFeedback] = await db
      .insert(peerFeedback)
      .values({
        sprintId,
        authorId,
        comment,
      })
      .returning();

    const [author] = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, authorId))
      .limit(1);

    return {
      ...newFeedback,
      author,
    };
  }

  static async updateFeedback(
    sprintId: string,
    feedbackId: string,
    userId: string,
    userRole: string,
    comment: string
  ) {
    const [feedback] = await db
      .select()
      .from(peerFeedback)
      .where(and(eq(peerFeedback.id, feedbackId), eq(peerFeedback.sprintId, sprintId)))
      .limit(1);

    if (!feedback) {
      const err: any = new Error('Komentar tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (feedback.authorId !== userId && userRole !== 'ADMIN') {
      const err: any = new Error('Anda tidak memiliki izin untuk mengedit komentar ini');
      err.statusCode = 403;
      throw err;
    }

    const [updatedFeedback] = await db
      .update(peerFeedback)
      .set({
        comment,
      })
      .where(eq(peerFeedback.id, feedbackId))
      .returning();

    const [author] = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, feedback.authorId))
      .limit(1);

    return {
      ...updatedFeedback,
      author,
    };
  }

  static async deleteFeedback(
    sprintId: string,
    feedbackId: string,
    userId: string,
    userRole: string
  ) {
    const [feedback] = await db
      .select()
      .from(peerFeedback)
      .where(and(eq(peerFeedback.id, feedbackId), eq(peerFeedback.sprintId, sprintId)))
      .limit(1);

    if (!feedback) {
      const err: any = new Error('Komentar tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (feedback.authorId !== userId && userRole !== 'ADMIN') {
      const err: any = new Error('Anda tidak memiliki izin untuk menghapus komentar ini');
      err.statusCode = 403;
      throw err;
    }

    await db.delete(peerFeedback).where(eq(peerFeedback.id, feedbackId));

    return {
      success: true,
      message: 'Komentar berhasil dihapus',
    };
  }

  static async updateSprint(
    sprintId: string,
    userId: string,
    userRole: string,
    data: {
      topicId?: string | null;
      durationMinutes?: number;
      whatLearned?: string;
      whatPracticed?: string;
      confusingParts?: string | null;
      evidenceUrl?: string | null;
      loomUrl?: string | null;
      demoUrl?: string | null;
      evidenceType?: 'GITHUB' | 'GITHUB_PAGES' | 'LOOM' | 'FIGMA' | 'LIVE_DEMO' | 'OTHER';
      needsFeedback?: boolean;
    }
  ) {
    const [sprint] = await db
      .select()
      .from(learningSprints)
      .where(eq(learningSprints.id, sprintId))
      .limit(1);

    if (!sprint) {
      const err: any = new Error('Learning sprint tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (sprint.userId !== userId && userRole !== 'ADMIN') {
      const err: any = new Error('Anda tidak memiliki izin untuk mengedit sesi belajar ini');
      err.statusCode = 403;
      throw err;
    }

    const updatePayload: Record<string, any> = {};

    if (data.topicId !== undefined) updatePayload.topicId = data.topicId;
    if (data.durationMinutes !== undefined) updatePayload.durationMinutes = data.durationMinutes;
    if (data.whatLearned !== undefined) updatePayload.whatLearned = data.whatLearned;
    if (data.whatPracticed !== undefined) updatePayload.whatPracticed = data.whatPracticed;
    if (data.confusingParts !== undefined) updatePayload.confusingParts = data.confusingParts;
    if (data.evidenceUrl !== undefined) updatePayload.evidenceUrl = data.evidenceUrl;
    if (data.loomUrl !== undefined) updatePayload.loomUrl = data.loomUrl;
    if (data.demoUrl !== undefined) updatePayload.demoUrl = data.demoUrl;
    if (data.evidenceType !== undefined) updatePayload.evidenceType = data.evidenceType;
    if (data.needsFeedback !== undefined) updatePayload.needsFeedback = Boolean(data.needsFeedback);

    const [updatedSprint] = await db
      .update(learningSprints)
      .set(updatePayload)
      .where(eq(learningSprints.id, sprintId))
      .returning();

    return {
      ...updatedSprint,
      isHabitQualified: updatedSprint.durationMinutes >= 25,
    };
  }

  static async deleteSprint(sprintId: string, userId: string, userRole: string) {
    const [sprint] = await db
      .select()
      .from(learningSprints)
      .where(eq(learningSprints.id, sprintId))
      .limit(1);

    if (!sprint) {
      const err: any = new Error('Learning sprint tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (sprint.userId !== userId && userRole !== 'ADMIN') {
      const err: any = new Error('Anda tidak memiliki izin untuk menghapus sesi belajar ini');
      err.statusCode = 403;
      throw err;
    }

    // Delete associated feedbacks first
    await db.delete(peerFeedback).where(eq(peerFeedback.sprintId, sprintId));
    // Delete sprint
    await db.delete(learningSprints).where(eq(learningSprints.id, sprintId));

    return {
      success: true,
      message: 'Learning sprint berhasil dihapus',
    };
  }
}

