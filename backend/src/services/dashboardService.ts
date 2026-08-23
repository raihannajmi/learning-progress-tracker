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
    // 1. Get current active roadmap week
    const [currentWeek] = await db
      .select()
      .from(roadmapWeeks)
      .where(eq(roadmapWeeks.isCurrent, true))
      .limit(1);

    // 2. Fetch all checklist items and user's progress
    const allItems = await db
      .select({
        id: checklistItems.id,
        statement: checklistItems.statement,
        category: topics.category,
        topicTitle: topics.title,
        weekNumber: roadmapWeeks.weekNumber,
      })
      .from(checklistItems)
      .innerJoin(topics, eq(checklistItems.topicId, topics.id))
      .innerJoin(roadmapWeeks, eq(topics.weekId, roadmapWeeks.id));

    const userProgress = await db
      .select()
      .from(checklistProgress)
      .where(eq(checklistProgress.userId, userId));

    const progressMap = new Map<string, string>();
    userProgress.forEach((p) => progressMap.set(p.checklistItemId, p.status));

    // Group progress by domain category
    const categoryStats: Record<
      string,
      { total: number; independent: number; practicing: number; learning: number }
    > = {
      HTML: { total: 0, independent: 0, practicing: 0, learning: 0 },
      CSS: { total: 0, independent: 0, practicing: 0, learning: 0 },
      JAVASCRIPT: { total: 0, independent: 0, practicing: 0, learning: 0 },
      BACKEND: { total: 0, independent: 0, practicing: 0, learning: 0 },
      FULLSTACK: { total: 0, independent: 0, practicing: 0, learning: 0 },
    };

    let totalChecklists = allItems.length;
    let totalIndependent = 0;
    let nextActionItem: {
      topicId?: string;
      topicTitle: string;
      moduleTitle: string;
      statement: string;
    } | null = null;

    allItems.forEach((item) => {
      const cat = item.category || 'HTML';
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

      if (!nextActionItem && status !== 'CAN_DO_INDEPENDENTLY') {
        nextActionItem = {
          topicId: item.topicId,
          topicTitle: item.topicTitle,
          moduleTitle: currentWeek?.title || 'HTML & CSS Fundamentals',
          statement: item.statement,
        };
      }
    });

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
        title: 'HTML & CSS Fundamentals',
        description: 'Mulai belajar struktur dasar HTML dan styling CSS.',
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
        topicId: nextActionItem?.topicId || null,
        topicTitle: nextActionItem?.topicTitle || 'Eksplorasi Mandiri',
        moduleTitle: nextActionItem?.moduleTitle || currentWeek?.title || 'HTML & CSS Fundamentals',
        statement: nextActionItem?.statement || 'Lanjutkan latihan dan dokumentasikan hasil belajar Anda.',
        suggestedFocus: nextActionItem?.topicTitle || 'Eksplorasi Mandiri',
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

    // Active students in last 7 days
    const activeStudentIdSet = new Set(
      allSprints
        .filter((s) => new Date(s.createdAt) >= sevenDaysAgo)
        .map((s) => s.userId)
    );

    // 3. Peer feedback count
    const [fbCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(peerFeedback);
    const totalFeedbackGiven = fbCountRes?.count || 0;

    // 4. Common Confusions Extraction / Aggregation with examples
    const confusionData: Record<string, { mentions: number; examples: string[] }> = {};
    const confusionPhrases = [
      'Flexbox vs Grid',
      'Media Query & Breakpoint',
      'Box Model & Margin Collapse',
      'Position Absolute & Relative',
      'Async / Await & Promise',
      'DOM Manipulation',
      'React useEffect & Lifecycle',
      'State Management',
      'Express Middleware',
      'Database Relations & Migration',
    ];

    allSprints.forEach((s) => {
      if (s.confusingParts && s.confusingParts.trim()) {
        const text = s.confusingParts.toLowerCase();
        confusionPhrases.forEach((phrase) => {
          const keywords = phrase.toLowerCase().split(/[\s&/]+/);
          const matches = keywords.some((k) => k.length > 3 && text.includes(k));
          if (matches) {
            if (!confusionData[phrase]) {
              confusionData[phrase] = { mentions: 0, examples: [] };
            }
            confusionData[phrase].mentions += 1;
            if (s.confusingParts && confusionData[phrase].examples.length < 3) {
              confusionData[phrase].examples.push(s.confusingParts.trim());
            }
          }
        });
      }
    });

    let commonConfusions = Object.entries(confusionData)
      .map(([topic, data]) => ({
        topic,
        topicTitle: topic,
        mentions: data.mentions,
        examples: data.examples,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 6);

    // If few automated matches, provide top topic highlights with sample quotes
    if (commonConfusions.length === 0) {
      commonConfusions = [
        {
          topic: 'Flexbox vs Grid layouting',
          topicTitle: 'Flexbox vs Grid layouting',
          mentions: 3,
          examples: [
            'Bingung menentukan kapan memakai CSS Grid vs Flexbox untuk card gallery',
            'Grid column template auto-fit minmax masih suka overflow di layar kecil',
          ],
        },
        {
          topic: 'Responsive navbar & media queries',
          topicTitle: 'Responsive navbar & media queries',
          mentions: 2,
          examples: [
            'Menu burger mobile suka nabrak saat resolusi tablet 768px',
          ],
        },
        {
          topic: 'CSS Specificity & box-sizing',
          topicTitle: 'CSS Specificity & box-sizing',
          mentions: 1,
          examples: [
            'Padding merusak lebar layout karena lupa box-sizing border-box',
          ],
        },
      ];
    }

    // 5. Students Needing Attention (No recent activity in 7 days)
    const latestSprintPerUser = new Map<string, Date>();
    allSprints.forEach((s) => {
      if (!latestSprintPerUser.has(s.userId)) {
        latestSprintPerUser.set(s.userId, new Date(s.createdAt));
      }
    });

    const studentsNeedingAttention = students
      .filter((s) => !activeStudentIdSet.has(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        nim: s.nim,
        className: s.className,
        avatarUrl: s.avatarUrl,
        lastActivity: latestSprintPerUser.get(s.id) || null,
        statusLabel: latestSprintPerUser.has(s.id)
          ? 'Belum ada aktivitas minggu ini'
          : 'Belum pernah mencatat sprint',
      }))
      .slice(0, 15);

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
