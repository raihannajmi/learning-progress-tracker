import { db } from '../db/index.js';
import { roadmapWeeks, topics, checklistItems, checklistProgress } from '../db/schema.js';
import { eq, asc, inArray } from 'drizzle-orm';

export class RoadmapService {
  static async getFullRoadmap(userId?: string) {
    const weeks = await db
      .select()
      .from(roadmapWeeks)
      .orderBy(asc(roadmapWeeks.weekNumber));

    const topicList = await db
      .select()
      .from(topics)
      .orderBy(asc(topics.sortOrder));

    const itemList = await db
      .select()
      .from(checklistItems)
      .orderBy(asc(checklistItems.sortOrder));

    let userProgressMap = new Map<string, string>();
    if (userId) {
      const progress = await db
        .select()
        .from(checklistProgress)
        .where(eq(checklistProgress.userId, userId));

      for (const p of progress) {
        userProgressMap.set(p.checklistItemId, p.status);
      }
    }

    // Nesting structure
    return weeks.map((week) => {
      const weekTopics = topicList
        .filter((t) => t.weekId === week.id)
        .map((t) => {
          const tChecklists = itemList
            .filter((ci) => ci.topicId === t.id)
            .map((ci) => ({
              ...ci,
              status: userProgressMap.get(ci.id) || 'NOT_STARTED',
            }));
          return {
            ...t,
            checklists: tChecklists,
          };
        });

      return {
        ...week,
        topics: weekTopics,
      };
    });
  }
}
