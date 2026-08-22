import { db } from '../db/index.js';
import { checklistProgress, checklistItems } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export class ChecklistService {
  static async getMyProgress(userId: string) {
    const progress = await db
      .select({
        id: checklistProgress.id,
        checklistItemId: checklistProgress.checklistItemId,
        status: checklistProgress.status,
        updatedAt: checklistProgress.updatedAt,
        statement: checklistItems.statement,
        topicId: checklistItems.topicId,
      })
      .from(checklistProgress)
      .innerJoin(checklistItems, eq(checklistProgress.checklistItemId, checklistItems.id))
      .where(eq(checklistProgress.userId, userId));

    return progress;
  }

  static async updateProgress(
    userId: string,
    checklistItemId: string,
    status: 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'CAN_DO_INDEPENDENTLY'
  ) {
    const [result] = await db
      .insert(checklistProgress)
      .values({
        userId,
        checklistItemId,
        status,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [checklistProgress.userId, checklistProgress.checklistItemId],
        set: {
          status,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  }
}
