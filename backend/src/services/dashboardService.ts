import { db } from '../db/index.js';
import {
  users,
  classes,
  roadmapWeeks,
  topics,
  checklistItems,
  checklistProgress,
  learningSprints,
  peerFeedback,
} from '../db/schema.js';
import { eq, and, sql, desc, gte, isNotNull } from 'drizzle-orm';

export class DashboardService {
  static async getStudentDashboard(userId: string) {
    // 1. Get current active roadmap week (or first week in syllabus)
    let [currentWeek] = await db
      .select()
      .from(roadmapWeeks)
      .where(eq(roadmapWeeks.isCurrent, true))
      .limit(1);

    if (!currentWeek) {
      const [firstWeek] = await db
        .select()
        .from(roadmapWeeks)
        .orderBy(roadmapWeeks.weekNumber)
        .limit(1);
      currentWeek = firstWeek;
    }

    // 2. Fetch all checklist items with topic & week info directly from DB
    const allItems = await db
      .select({
        id: checklistItems.id,
        statement: checklistItems.statement,
        topicId: checklistItems.topicId,
        category: topics.category,
        topicTitle: topics.title,
        weekTitle: roadmapWeeks.title,
        weekNumber: roadmapWeeks.weekNumber,
      })
      .from(checklistItems)
      .innerJoin(topics, eq(checklistItems.topicId, topics.id))
      .innerJoin(roadmapWeeks, eq(topics.weekId, roadmapWeeks.id))
      .orderBy(roadmapWeeks.weekNumber, topics.sortOrder, checklistItems.sortOrder);

    const userProgress = await db
      .select()
      .from(checklistProgress)
      .where(eq(checklistProgress.userId, userId));

    const progressMap = new Map<string, string>();
    userProgress.forEach((p) => progressMap.set(p.checklistItemId, p.status));

    // Group progress by domain category dynamically from DB records
    const categoryStats: Record<
      string,
      { total: number; independent: number; practicing: number; learning: number }
    > = {};

    let totalChecklists = allItems.length;
    let totalIndependent = 0;

    allItems.forEach((item) => {
      const cat = item.category || 'OTHER';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, independent: 0, practicing: 0, learning: 0 };
      }
      categoryStats[cat].total++;

      const status = progressMap.get(item.id) || 'NOT_STARTED';
      if (status === 'CAN_DO_INDEPENDENTLY') {
        categoryStats[cat].independent++;
        totalIndependent++;
      } else if (status === 'PRACTICING') {
        categoryStats[cat].practicing++;
      } else if (status === 'LEARNING') {
        categoryStats[cat].learning++;
      }
    });

    // Find first incomplete item for next-action suggestion (separate from forEach to preserve TS narrowing)
    const nextRawItem = allItems.find(
      (item) => (progressMap.get(item.id) || 'NOT_STARTED') !== 'CAN_DO_INDEPENDENTLY'
    );
    const nextActionItem = nextRawItem
      ? {
          topicId: nextRawItem.topicId,
          topicTitle: nextRawItem.topicTitle,
          moduleTitle: nextRawItem.weekTitle || currentWeek?.title || '',
          statement: nextRawItem.statement,
        }
      : null;

    // 3. User Sprint stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sprints = await db
      .select()
      .from(learningSprints)
      .where(eq(learningSprints.userId, userId))
      .orderBy(desc(learningSprints.createdAt));

    const totalMinutes = sprints.reduce((acc, s) => acc + s.durationMinutes, 0);
    const habitSprintsCount = sprints.filter((s) => s.durationMinutes >= 25).length;
    const sprintsThisWeek = sprints.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;

    const recentSprints = sprints.slice(0, 5);

    return {
      currentWeek: currentWeek || {
        weekNumber: 1,
        title: allItems[0]?.weekTitle || 'Web Development',
        description: null,
      },
      summary: {
        totalChecklists,
        completedChecklists: totalIndependent,
        overallPercentage:
          totalChecklists > 0 ? Math.round((totalIndependent / totalChecklists) * 100) : 0,
        totalSprints: sprints.length,
        totalMinutesLearned: totalMinutes,
        totalDurationMinutes: totalMinutes,
        habitReachedCount: habitSprintsCount,
        sprintsThisWeek,
        weeklySprintsCount: sprintsThisWeek,
      },
      categoryProgress: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        total: stats.total,
        independent: stats.independent,
        practicing: stats.practicing,
        learning: stats.learning,
        percentage: stats.total > 0 ? Math.round((stats.independent / stats.total) * 100) : 0,
      })),
      nextAction: {
        topicId: nextActionItem?.topicId || (allItems[0]?.topicId ?? null),
        topicTitle: nextActionItem?.topicTitle || (allItems[0]?.topicTitle ?? 'Eksplorasi Mandiri'),
        moduleTitle: nextActionItem?.moduleTitle || currentWeek?.title || '',
        statement: nextActionItem?.statement || 'Lanjutkan latihan dan dokumentasikan hasil belajar Anda.',
        suggestedFocus: nextActionItem?.topicTitle || (allItems[0]?.topicTitle ?? 'Eksplorasi Mandiri'),
        minimumTarget: '25 menit focused learning sprint',
      },
      recentSprints: recentSprints.map((s) => ({
        ...s,
        isHabitQualified: s.durationMinutes >= 25,
      })),
    };
  }

  static async getAdminDashboard(classId?: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Students in scope
    const studentConditions = [eq(users.role, 'STUDENT')];
    if (classId) {
      studentConditions.push(eq(users.classId, classId));
    }

    const students = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        nim: users.nim,
        classId: users.classId,
        className: classes.name,
        classStartDate: classes.startDate,
        avatarUrl: users.avatarUrl,
        githubRepoUrl: users.githubRepoUrl,
        githubPageUrl: users.githubPageUrl,
      })
      .from(users)
      .leftJoin(classes, eq(users.classId, classes.id))
      .where(and(...studentConditions));

    const studentIds = students.map((s) => s.id);

    if (studentIds.length === 0) {
      return {
        totalStudents: 0,
        activeStudentsThisWeek: 0,
        totalSprints: 0,
        totalFeedbackGiven: 0,
        categoryProgress: [],
        commonConfusions: [],
        studentsNeedingAttention: [],
        recentEvidences: [],
      };
    }

    // 2. Sprints in scope
    const allSprints = await db
      .select({
        id: learningSprints.id,
        userId: learningSprints.userId,
        durationMinutes: learningSprints.durationMinutes,
        confusingParts: learningSprints.confusingParts,
        evidenceUrl: learningSprints.evidenceUrl,
        evidenceType: learningSprints.evidenceType,
        whatLearned: learningSprints.whatLearned,
        createdAt: learningSprints.createdAt,
        studentName: users.name,
        className: classes.name,
      })
      .from(learningSprints)
      .innerJoin(users, eq(learningSprints.userId, users.id))
      .leftJoin(classes, eq(users.classId, classes.id))
      .where(studentConditions.length > 1 ? and(...studentConditions) : eq(users.role, 'STUDENT'))
      .orderBy(desc(learningSprints.createdAt));

    // 3. Peer feedback count
    const [fbCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(peerFeedback);
    const totalFeedbackGiven = fbCountRes?.count || 0;

    // 4. Common Confusions Extraction / Aggregation dynamically matched against DB topics
    const dbTopics = await db
      .select({ id: topics.id, title: topics.title, category: topics.category })
      .from(topics);

    const confusionData: Record<string, { mentions: number; examples: string[] }> = {};

    allSprints.forEach((s) => {
      if (s.confusingParts && s.confusingParts.trim()) {
        const text = s.confusingParts.toLowerCase();
        dbTopics.forEach((t) => {
          const keywords = t.title.toLowerCase().split(/[\s&/()\-–]+/);
          const matches = keywords.some((k) => k.length > 3 && text.includes(k));
          if (matches) {
            if (!confusionData[t.title]) {
              confusionData[t.title] = { mentions: 0, examples: [] };
            }
            confusionData[t.title].mentions += 1;
            if (s.confusingParts && confusionData[t.title].examples.length < 3) {
              confusionData[t.title].examples.push(s.confusingParts.trim());
            }
          }
        });
      }
    });

    const commonConfusions = Object.entries(confusionData)
      .map(([topic, data]) => ({
        topic,
        topicTitle: topic,
        mentions: data.mentions,
        examples: data.examples,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 8);

    // 5. Students Needing Attention (Calculated from Class Start Date & 7-Day Inactivity Window)
    const now = new Date();
    const defaultSevenDaysAgo = new Date();
    defaultSevenDaysAgo.setDate(defaultSevenDaysAgo.getDate() - 7);

    const latestSprintPerUser = new Map<string, Date>();
    allSprints.forEach((s) => {
      if (!latestSprintPerUser.has(s.userId)) {
        latestSprintPerUser.set(s.userId, new Date(s.createdAt));
      }
    });

    const activeStudentIdSet = new Set<string>();
    const studentsNeedingAttention: Array<{
      id: string;
      name: string;
      email: string;
      nim: string | null;
      className: string | null;
      avatarUrl: string | null;
      lastActivity: Date | null;
      statusLabel: string;
    }> = [];

    for (const s of students) {
      const lastActivity = latestSprintPerUser.get(s.id) || null;
      const classStartDate = s.classStartDate ? new Date(s.classStartDate) : null;

      // If class start date is in the future, the class hasn't started yet
      if (classStartDate && now < classStartDate) {
        if (lastActivity) {
          activeStudentIdSet.add(s.id);
        }
        continue;
      }

      // Threshold is the later of (7 days ago) or (class start date)
      const activeThreshold = classStartDate && classStartDate > defaultSevenDaysAgo
        ? classStartDate
        : defaultSevenDaysAgo;

      const hasRecentActivity = lastActivity && lastActivity >= activeThreshold;

      if (hasRecentActivity) {
        activeStudentIdSet.add(s.id);
      } else {
        let statusLabel = 'Belum pernah mencatat sprint';
        if (lastActivity) {
          statusLabel = 'Belum ada aktivitas minggu ini';
        } else if (classStartDate) {
          const formattedDate = new Intl.DateTimeFormat('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(classStartDate);
          statusLabel = `Belum ada sprint sejak perkuliahan dimulai (${formattedDate})`;
        }

        studentsNeedingAttention.push({
          id: s.id,
          name: s.name,
          email: s.email,
          nim: s.nim,
          className: s.className,
          avatarUrl: s.avatarUrl,
          lastActivity,
          statusLabel,
        });
      }
    }

    // 6. Recent Evidences
    const recentEvidences = allSprints
      .filter((s) => s.evidenceUrl && s.evidenceUrl.trim().length > 0)
      .slice(0, 8)
      .map((s) => ({
        id: s.id,
        studentName: s.studentName,
        className: s.className,
        evidenceUrl: s.evidenceUrl,
        evidenceType: s.evidenceType,
        whatLearned: s.whatLearned,
        createdAt: s.createdAt,
      }));

    return {
      totalStudents: students.length,
      activeStudentsThisWeek: activeStudentIdSet.size,
      totalSprints: allSprints.length,
      totalFeedbackGiven,
      commonConfusions,
      studentsNeedingAttention,
      recentEvidences,
    };
  }
}
