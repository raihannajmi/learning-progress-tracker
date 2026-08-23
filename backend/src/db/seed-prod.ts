import fs from 'node:fs';
import path from 'node:path';
import { db, queryClient } from './index.js';
import {
  classes,
  users,
  roadmapWeeks,
  topics,
  checklistItems,
  checklistProgress,
  learningSprints,
  peerFeedback,
} from './schema.js';
import { initialClasses } from './data/classes.js';
import { initialStudents } from './data/students.js';
import { initialCurriculum } from './data/curriculum.js';

export async function seedProd() {
  console.log('🚀 [PRODUCTION SEED] Starting clean database initialization...');

  // 1. Clean existing tables (Cascading clean)
  console.log('🧹 Cleaning old data...');
  await db.delete(peerFeedback);
  await db.delete(learningSprints);
  await db.delete(checklistProgress);
  await db.delete(checklistItems);
  await db.delete(topics);
  await db.delete(roadmapWeeks);
  await db.delete(users);
  await db.delete(classes);

  // 2. Insert Academic Classes
  console.log('🏫 Seeding Academic Classes...');
  const insertedClasses = await db
    .insert(classes)
    .values(initialClasses)
    .returning();

  const classMap = new Map<string, string>();
  insertedClasses.forEach((c) => classMap.set(c.name, c.id));
  const defaultClassId = insertedClasses[0]?.id;

  // 3. Insert Admin / Lecturer / TA Whitelist
  console.log('👥 Seeding Instructor & Admin Whitelist...');
  const initialAdmins = [
    {
      name: 'Alif Najmi Raihan Putra Hidayat',
      email: 'najmiraihanworks@gmail.com',
      role: 'ADMIN' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      name: 'Dr. Dosen Pengampu',
      email: 'dosen@univ.ac.id',
      role: 'ADMIN' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Asisten Dosen (TA)',
      email: 'ta@univ.ac.id',
      role: 'ADMIN' as const,
    },
  ];

  await db.insert(users).values(initialAdmins);

  // 4. Insert Student Whitelists (Check for private real dataset first)
  let studentsData = initialStudents;
  const privateFilePath = path.join(process.cwd(), 'src/db/data/students.private.json');

  if (fs.existsSync(privateFilePath)) {
    try {
      const raw = fs.readFileSync(privateFilePath, 'utf-8');
      studentsData = JSON.parse(raw);
      console.log(`🔒 [PRIVATE DATA] Loaded ${studentsData.length} real student records from git-ignored students.private.json`);
    } catch {
      console.warn('⚠️ Could not parse students.private.json, using default dataset.');
    }
  } else {
    console.log(`ℹ️ [DEMO DATA] Seeding ${studentsData.length} public demo students (safe for public repository)`);
  }

  const studentRows = studentsData.map((st) => {
    const classId = classMap.get(st.className) || defaultClassId;
    const username = st.email.split('@')[0];
    return {
      name: st.name.trim(),
      email: st.email.trim().toLowerCase(),
      nim: st.nim.trim(),
      role: 'STUDENT' as const,
      classId,
      githubRepoUrl: `https://github.com/${username}/webdev-portfolio`,
      githubPageUrl: `https://${username}.github.io/webdev-portfolio`,
    };
  });

  const insertedStudents = await db.insert(users).values(studentRows).returning();

  // 5. Insert Official 8-Week Curriculum & Checklists
  console.log('🗺️ Seeding Official 8-Week Syllabus & Competency Checklists...');
  const insertedWeeks = [];

  for (const weekData of initialCurriculum) {
    const [week] = await db
      .insert(roadmapWeeks)
      .values({
        weekNumber: weekData.weekNumber,
        title: weekData.title,
        description: weekData.description,
        isCurrent: weekData.isCurrent,
      })
      .returning();

    for (const topicData of weekData.topics) {
      const [topic] = await db
        .insert(topics)
        .values({
          weekId: week.id,
          title: topicData.title,
          category: topicData.category,
          sortOrder: topicData.sortOrder,
        })
        .returning();

      for (let i = 0; i < topicData.checklists.length; i++) {
        await db.insert(checklistItems).values({
          topicId: topic.id,
          statement: topicData.checklists[i],
          sortOrder: i + 1,
        });
      }
    }

    insertedWeeks.push(week);
  }

  console.log('✅ [PRODUCTION SEED] Baseline database successfully seeded!');
  console.log(`   - ${insertedClasses.length} Academic Classes`);
  console.log(`   - ${initialAdmins.length} Instructors / Admins`);
  console.log(`   - ${insertedStudents.length} Whitelisted Students`);
  console.log(`   - ${insertedWeeks.length} Syllabus Weeks with all Topics & Checklists`);
  console.log('   - 0 Dummy Sprints / Dummy Feedback (Clean Slate)');

  return {
    classes: insertedClasses,
    students: insertedStudents,
    weeks: insertedWeeks,
  };
}

// Direct execution runner
if (process.argv[1]?.endsWith('seed-prod.ts') || process.argv[1]?.endsWith('seed-prod.js')) {
  seedProd()
    .then(async () => {
      await queryClient.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Production Seed failed:', err);
      await queryClient.end();
      process.exit(1);
    });
}
