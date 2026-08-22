import { db } from '../db/index.js';
import {
  learningSprints,
  users,
  classes,
  topics,
  peerFeedback,
} from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';

export class SprintService {
  static async listSprints(filters?: {
    classId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(learningSprints.userId, filters.userId));
    }
    if (filters?.classId) {
      conditions.push(eq(users.classId, filters.classId));
    }

    const sprints = await db
      .select({
        id: learningSprints.id,
        durationMinutes: learningSprints.durationMinutes,
        whatLearned: learningSprints.whatLearned,
        whatPracticed: learningSprints.whatPracticed,
        confusingParts: learningSprints.confusingParts,
        evidenceUrl: learningSprints.evidenceUrl,
        evidenceType: learningSprints.evidenceType,
        createdAt: learningSprints.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          nim: users.nim,
          avatarUrl: users.avatarUrl,
          classId: users.classId,
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(learningSprints.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch feedbacks for these sprints
    const sprintIds = sprints.map((s) => s.id);
    let feedbackMap = new Map<string, any[]>();

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

    return sprints.map((s) => ({
      ...s,
      isHabitQualified: s.durationMinutes >= 25, // Habit indicator (>=25 min)
      feedbacks: feedbackMap.get(s.id) || [],
      feedbackCount: (feedbackMap.get(s.id) || []).length,
    }));
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
        evidenceType: learningSprints.evidenceType,
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
      evidenceType?: 'GITHUB' | 'GITHUB_PAGES' | 'LOOM' | 'FIGMA' | 'LIVE_DEMO' | 'OTHER';
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
        evidenceType: data.evidenceType || 'OTHER',
      })
      .returning();

    return {
      ...newSprint,
      isHabitQualified: newSprint.durationMinutes >= 25,
    };
  }

  static async addFeedback(sprintId: string, authorId: string, comment: string) {
    // Check if sprint exists
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

    const [fb] = await db
      .insert(peerFeedback)
      .values({
        sprintId,
        authorId,
        comment,
      })
      .returning();

    // Fetch author details
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
      ...fb,
      author,
    };
  }
}
