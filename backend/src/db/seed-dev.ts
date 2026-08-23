import { db, queryClient } from './index.js';
import {
  users,
  topics,
  checklistItems,
  checklistProgress,
  learningSprints,
  peerFeedback,
} from './schema.js';
import { eq } from 'drizzle-orm';
import { seedProd } from './seed-prod.js';

export async function seedDev() {
  console.log('🧪 [DEVELOPMENT SEED] Starting development database seeding...');

  // 1. Run baseline production seed first
  const { classes: dbClasses } = await seedProd();

  // In development, insert initial demo students for testing
  console.log('👨‍🎓 [DEVELOPMENT SEED] Seeding demo students for development testing...');
  const { initialStudents } = await import('./data/students.js');
  const classMap = new Map<string, string>();
  dbClasses.forEach((c) => classMap.set(c.name, c.id));
  const defaultClassId = dbClasses[0]?.id;

  const studentRows = initialStudents.map((st) => {
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

  const students = await db.insert(users).values(studentRows).returning();

  console.log('✨ [DEVELOPMENT SEED] Injecting realistic student activity, sprints, and discussions...');

  // Query topics and checklist items
  const allDbTopics = await db.select().from(topics);
  const allChecklists = await db.select().from(checklistItems);
  const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN'));
  const primaryAdmin = adminUsers.find((u) => u.email === 'najmiraihanworks@gmail.com') || adminUsers[0];

  // 2. Seed Checklist Progress for first 30 students
  console.log('📊 Seeding realistic student checklist progress...');
  const progressStatuses = ['LEARNING', 'PRACTICING', 'CAN_DO_INDEPENDENTLY'] as const;

  for (let i = 0; i < Math.min(35, students.length); i++) {
    const student = students[i];
    // Assign varying progress levels
    const itemsToProgress = allChecklists.slice(0, Math.floor(Math.random() * 8) + 3);

    for (const item of itemsToProgress) {
      const randomStatus =
        progressStatuses[Math.floor(Math.random() * progressStatuses.length)];

      await db.insert(checklistProgress).values({
        userId: student.id,
        checklistItemId: item.id,
        status: randomStatus,
      });
    }
  }

  // 3. Seed Realistic Learning Sprints & Reflections
  console.log('⏱️ Seeding learning sprints, reflections, and evidence links...');
  const sampleLearnings = [
    {
      what: 'Berhasil membuat layout card gallery responsif menggunakan CSS Grid repeat(auto-fit, minmax(280px, 1fr)) dan styling hover transition yang mulus.',
      confusing: 'Awalnya card image suka gepeng karena lupa setting object-fit: cover dan aspect-ratio.',
      duration: 30,
      evidenceUrl: 'https://github.com/muhammadzahi006/webdev-portfolio/tree/main/week-1',
      evidenceType: 'GITHUB' as const,
      needsFeedback: false,
    },
    {
      what: 'Menerapkan Semantic HTML5 (header, nav, main, section, footer) pada halaman artikel blog sederhana serta form contact lengkap dengan validasi required.',
      confusing: 'Masih agak bingung membedakan kapan paling tepat memakai section vs article pada hierarki konten.',
      duration: 25,
      evidenceUrl: 'https://github.com/yunamikanda06/webdev-portfolio',
      evidenceType: 'GITHUB' as const,
      needsFeedback: true,
    },
    {
      what: 'Membangun responsive mobile navbar dengan hamburger menu toggle menggunakan CSS Flexbox dan media queries pada breakpoint 768px.',
      confusing: 'Menu burger suka nabrak saat resolusi tablet 768px dan padding suka merusak lebar karena lupa box-sizing border-box.',
      duration: 35,
      evidenceUrl: 'https://loom.com/share/demo-navbar-responsive-slicing',
      evidenceType: 'LOOM' as const,
      needsFeedback: true,
    },
    {
      what: 'Menyusun CSS typography scale dengan modular font-size rem dan styling subtle button shadow dengan HSL Tailored colors.',
      confusing: null,
      duration: 25,
      evidenceUrl: 'https://github.com/rafakurnia2006/portfolio',
      evidenceType: 'LIVE_DEMO' as const,
      needsFeedback: false,
    },
    {
      what: 'Latihan Flexbox alignment: justify-content space-between vs center dan align-items center untuk dashboard widget navbar.',
      confusing: 'Flex-grow vs flex-basis saat items di dalam container menyusut di layar kecil.',
      duration: 28,
      evidenceUrl: 'https://github.com/efriskyla/webdev-portfolio',
      evidenceType: 'GITHUB' as const,
      needsFeedback: true,
    },
  ];

  const createdSprints = [];

  for (let i = 0; i < Math.min(25, students.length); i++) {
    const student = students[i];
    const sample = sampleLearnings[i % sampleLearnings.length];
    const topic = allDbTopics[i % allDbTopics.length];

    // Distribute timestamps (some today, some 2 days ago, some 5 days ago)
    const daysAgo = (i % 6);
    const sprintDate = new Date();
    sprintDate.setDate(sprintDate.getDate() - daysAgo);

    const [sprint] = await db
      .insert(learningSprints)
      .values({
        userId: student.id,
        topicId: topic?.id,
        durationMinutes: sample.duration,
        whatLearned: sample.what,
        whatPracticed: `Praktek langsung implementasi komponen dan styling fitur untuk topic: ${topic?.title || 'Web Development'}`,
        confusingParts: sample.confusing,
        evidenceUrl: sample.evidenceUrl,
        evidenceType: sample.evidenceType,
        needsFeedback: sample.needsFeedback,
        reviewStatus: sample.needsFeedback ? 'PENDING' : 'REVIEWED',
        createdAt: sprintDate,
      })
      .returning();

    createdSprints.push(sprint);
  }

  // 4. Seed Peer & Instructor Feedback
  console.log('💬 Seeding peer feedback and instructor assistance comments...');
  const sampleComments = [
    'Slicing grid gallery kamu sangat rapi dan responsive! Coba tambahkan loading placeholder saat fetch gambar nanti.',
    'Penggunaan semantic HTML-nya sudah tepat. Untuk section vs article, section dipakai untuk pengelompokan tematik umum, sedangkan article untuk konten independen yang bisa berdiri sendiri (seperti blog post/berita).',
    'Bagus sekali sudah konsisten pakai box-sizing: border-box di CSS reset!',
    'Struktur responsive navbar kamu di mobile sudah smooth. Great progress!',
  ];

  for (let i = 0; i < Math.min(6, createdSprints.length); i++) {
    const sprint = createdSprints[i];
    const comment = sampleComments[i % sampleComments.length];
    const isInstructor = i % 2 === 0;

    const author = isInstructor
      ? primaryAdmin
      : students[(i + 1) % students.length];

    if (author) {
      await db.insert(peerFeedback).values({
        sprintId: sprint.id,
        authorId: author.id,
        comment,
      });

      if (isInstructor) {
        await db
          .update(learningSprints)
          .set({ reviewStatus: 'REVIEWED' })
          .where(eq(learningSprints.id, sprint.id));
      }
    }
  }

  console.log('🎉 [DEVELOPMENT SEED] Full realistic dev database successfully populated!');
  console.log(`   - ${createdSprints.length} Learning Sprints logged`);
  console.log('   - Interactive Peer & Instructor discussions created');
  console.log('   - Dynamic metrics & common confusion aggregations active');
}

// Direct execution runner
if (process.argv[1]?.endsWith('seed-dev.ts') || process.argv[1]?.endsWith('seed-dev.js')) {
  seedDev()
    .then(async () => {
      await queryClient.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Development Seed failed:', err);
      await queryClient.end();
      process.exit(1);
    });
}
