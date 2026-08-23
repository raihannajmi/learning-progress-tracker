import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['STUDENT', 'ADMIN']);

export const checklistStatusEnum = pgEnum('checklist_status', [
  'NOT_STARTED',
  'LEARNING',
  'PRACTICING',
  'CAN_DO_INDEPENDENTLY',
]);

export const evidenceTypeEnum = pgEnum('evidence_type', [
  'GITHUB',
  'GITHUB_PAGES',
  'LOOM',
  'FIGMA',
  'LIVE_DEMO',
  'OTHER',
]);

// 1. Classes Table
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // e.g. "Kelas A", "Kelas B"
  academicTerm: varchar('academic_term', { length: 50 }).notNull(), // e.g. "2026/2027 Ganjil"
  startDate: timestamp('start_date'), // Tanggal mulai perkuliahan (e.g. 2026-08-19)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Users Table (No public registration; only whitelisted emails added by Admin or Seed)
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    nim: varchar('nim', { length: 50 }), // Unique for students, null for admin
    role: userRoleEnum('role').default('STUDENT').notNull(),
    classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }),
    githubRepoUrl: varchar('github_repo_url', { length: 500 }),
    githubPageUrl: varchar('github_page_url', { length: 500 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_class_id_idx').on(table.classId),
    index('users_role_idx').on(table.role),
  ]
);

// 3. Roadmap Weeks Table
export const roadmapWeeks = pgTable('roadmap_weeks', {
  id: uuid('id').defaultRandom().primaryKey(),
  weekNumber: integer('week_number').unique().notNull(), // 1..8
  title: varchar('title', { length: 255 }).notNull(), // e.g. "HTML & CSS Fundamentals"
  description: text('description'),
  isCurrent: boolean('is_current').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Topics Table
export const topics = pgTable(
  'topics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    weekId: uuid('week_id')
      .references(() => roadmapWeeks.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(), // e.g. "HTML Document Structure", "CSS Flexbox"
    category: varchar('category', { length: 50 }).notNull(), // e.g. "HTML", "CSS", "JAVASCRIPT", "BACKEND", "FULLSTACK"
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('topics_week_id_idx').on(table.weekId),
    index('topics_category_idx').on(table.category),
  ]
);

// 5. Checklist Items Table
export const checklistItems = pgTable(
  'checklist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    topicId: uuid('topic_id')
      .references(() => topics.id, { onDelete: 'cascade' })
      .notNull(),
    statement: text('statement').notNull(), // e.g. "Saya memahami selector dan box model"
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('checklist_items_topic_id_idx').on(table.topicId)]
);

// 6. Checklist Progress Table (Student self-assessment status)
export const checklistProgress = pgTable(
  'checklist_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    checklistItemId: uuid('checklist_item_id')
      .references(() => checklistItems.id, { onDelete: 'cascade' })
      .notNull(),
    status: checklistStatusEnum('status').default('NOT_STARTED').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_checklist_unique_idx').on(table.userId, table.checklistItemId),
    index('checklist_progress_user_id_idx').on(table.userId),
    index('checklist_progress_status_idx').on(table.status),
  ]
);

// 7. Learning Sprints Table (Habit logging: duration, reflections, evidence)
export const learningSprints = pgTable(
  'learning_sprints',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'set null' }),
    durationMinutes: integer('duration_minutes').notNull(), // Habit indicator: >= 25 min
    whatLearned: text('what_learned').notNull(),
    whatPracticed: text('what_practiced').notNull(),
    confusingParts: text('confusing_parts'), // Reflection on blockers/confusion
    evidenceUrl: varchar('evidence_url', { length: 500 }),
    evidenceType: evidenceTypeEnum('evidence_type').default('OTHER'),
    reviewStatus: varchar('review_status', { length: 50 }).default('PENDING').notNull(), // "PENDING", "REVIEWED"
    needsFeedback: boolean('needs_feedback').default(false).notNull(), // Student requested instructor assistance
    instructorFeedback: text('instructor_feedback'),
    reviewedById: uuid('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('learning_sprints_user_id_idx').on(table.userId),
    index('learning_sprints_topic_id_idx').on(table.topicId),
    index('learning_sprints_review_status_idx').on(table.reviewStatus),
    index('learning_sprints_needs_feedback_idx').on(table.needsFeedback),
    index('learning_sprints_created_at_idx').on(table.createdAt),
  ]
);

// 8. Peer Feedback Table (Constructive, non-grading feedback between classmates)
export const peerFeedback = pgTable(
  'peer_feedback',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sprintId: uuid('sprint_id')
      .references(() => learningSprints.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: uuid('author_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('peer_feedback_sprint_id_idx').on(table.sprintId),
    index('peer_feedback_author_id_idx').on(table.authorId),
  ]
);

// 9. External Milestones Table (e.g. freeCodeCamp cert, Client Project)
export const externalMilestones = pgTable(
  'external_milestones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    milestoneType: varchar('milestone_type', { length: 100 }).notNull(), // e.g. "FCC_RESPONSIVE_DESIGN", "CLIENT_PROJECT"
    status: varchar('status', { length: 50 }).default('NOT_STARTED').notNull(), // "NOT_STARTED", "IN_PROGRESS", "COMPLETED"
    certificateUrl: varchar('certificate_url', { length: 500 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('external_milestones_user_id_idx').on(table.userId)]
);

// ======================= RELATIONS =======================

export const classesRelations = relations(classes, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  class: one(classes, {
    fields: [users.classId],
    references: [classes.id],
  }),
  checklistProgress: many(checklistProgress),
  learningSprints: many(learningSprints),
  peerFeedbackGiven: many(peerFeedback),
  externalMilestones: many(externalMilestones),
}));

export const roadmapWeeksRelations = relations(roadmapWeeks, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  week: one(roadmapWeeks, {
    fields: [topics.weekId],
    references: [roadmapWeeks.id],
  }),
  checklistItems: many(checklistItems),
  learningSprints: many(learningSprints),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one, many }) => ({
  topic: one(topics, {
    fields: [checklistItems.topicId],
    references: [topics.id],
  }),
  progress: many(checklistProgress),
}));

export const checklistProgressRelations = relations(checklistProgress, ({ one }) => ({
  user: one(users, {
    fields: [checklistProgress.userId],
    references: [users.id],
  }),
  checklistItem: one(checklistItems, {
    fields: [checklistProgress.checklistItemId],
    references: [checklistItems.id],
  }),
}));

export const learningSprintsRelations = relations(learningSprints, ({ one, many }) => ({
  user: one(users, {
    fields: [learningSprints.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [learningSprints.topicId],
    references: [topics.id],
  }),
  feedbacks: many(peerFeedback),
}));

export const peerFeedbackRelations = relations(peerFeedback, ({ one }) => ({
  sprint: one(learningSprints, {
    fields: [peerFeedback.sprintId],
    references: [learningSprints.id],
  }),
  author: one(users, {
    fields: [peerFeedback.authorId],
    references: [users.id],
  }),
}));

export const externalMilestonesRelations = relations(externalMilestones, ({ one }) => ({
  user: one(users, {
    fields: [externalMilestones.userId],
    references: [users.id],
  }),
}));
