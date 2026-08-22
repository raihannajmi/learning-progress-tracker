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
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed for Learning Progress Tracker...');

  // 1. Clean existing data in reverse order
  console.log('🧹 Cleaning old data...');
  await db.delete(peerFeedback);
  await db.delete(learningSprints);
  await db.delete(checklistProgress);
  await db.delete(checklistItems);
  await db.delete(topics);
  await db.delete(roadmapWeeks);
  await db.delete(users);
  await db.delete(classes);

  // 2. Insert Classes
  console.log('🏫 Seeding Classes...');
  const [classA] = await db
    .insert(classes)
    .values({
      name: 'Kelas A',
      academicTerm: '2026/2027 Ganjil',
    })
    .returning();

  const [classB] = await db
    .insert(classes)
    .values({
      name: 'Kelas B',
      academicTerm: '2026/2027 Ganjil',
    })
    .returning();

  // 3. Insert Admin & Whitelisted Students
  console.log('👥 Seeding Users (Admins & Students)...');
  const [adminDosen] = await db
    .insert(users)
    .values({
      name: 'Dr. Dosen Pengampu',
      email: 'dosen@univ.ac.id',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    })
    .returning();

  const [adminTA] = await db
    .insert(users)
    .values({
      name: 'Asisten Dosen WebDev',
      email: 'ta@univ.ac.id',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    })
    .returning();

  // Test admin email
  await db
    .insert(users)
    .values({
      name: 'Super Admin Test',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

  const [studentAndi] = await db
    .insert(users)
    .values({
      name: 'Andi Pratama',
      email: 'andi@student.univ.ac.id',
      nim: '2026001',
      role: 'STUDENT',
      classId: classA.id,
      githubRepoUrl: 'https://github.com/andipratama/webdev-portfolio',
      githubPageUrl: 'https://andipratama.github.io/webdev-portfolio',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    })
    .returning();

  const [studentBudi] = await db
    .insert(users)
    .values({
      name: 'Budi Santoso',
      email: 'budi@student.univ.ac.id',
      nim: '2026002',
      role: 'STUDENT',
      classId: classA.id,
      githubRepoUrl: 'https://github.com/budisantoso/learning-logs',
      githubPageUrl: 'https://budisantoso.github.io/learning-logs',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    })
    .returning();

  const [studentCitra] = await db
    .insert(users)
    .values({
      name: 'Citra Lestari',
      email: 'citra@student.univ.ac.id',
      nim: '2026003',
      role: 'STUDENT',
      classId: classB.id,
      githubRepoUrl: 'https://github.com/citralestari/my-web-journey',
      githubPageUrl: 'https://citralestari.github.io/my-web-journey',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    })
    .returning();

  const [studentDewi] = await db
    .insert(users)
    .values({
      name: 'Dewi Anggraini',
      email: 'dewi@student.univ.ac.id',
      nim: '2026004',
      role: 'STUDENT',
      classId: classB.id,
    })
    .returning();

  // 4. Insert Roadmap Weeks, Topics & Checklist Items
  console.log('🗺️ Seeding Roadmap Syllabus & Checklists...');

  const roadmapData = [
    {
      weekNumber: 1,
      title: 'HTML & CSS Fundamentals',
      description: 'Pengenalan struktur dokumen web, elemen semantik, selector dasar, dan CSS Box Model.',
      isCurrent: true,
      topics: [
        {
          title: 'Document Structure & Semantic HTML',
          category: 'HTML',
          sortOrder: 1,
          checklists: [
            'Saya memahami struktur dasar HTML5 (doctype, html, head, body, meta tags)',
            'Saya dapat menggunakan tag semantik (header, nav, main, section, article, footer)',
            'Saya dapat membuat form interaktif dengan label, input types, dan validasi dasar',
          ],
        },
        {
          title: 'CSS Selectors & Box Model',
          category: 'CSS',
          sortOrder: 2,
          checklists: [
            'Saya memahami hierarchy dan specificity selector CSS (class, id, attribute)',
            'Saya memahami cara kerja Box Model (content, padding, border, margin)',
            'Saya dapat menggunakan box-sizing: border-box secara konsisten',
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Modern CSS Layouts (Flexbox & Grid)',
      description: 'Membangun layout satu dan dua dimensi yang dinamis menggunakan CSS modern.',
      isCurrent: false,
      topics: [
        {
          title: 'CSS Flexbox Mastery',
          category: 'CSS',
          sortOrder: 1,
          checklists: [
            'Saya memahami peran flex container vs flex items',
            'Saya dapat menggunakan justify-content dan align-items untuk alignment',
            'Saya dapat membuat responsive navbar & card alignment menggunakan flexbox',
          ],
        },
        {
          title: 'CSS Grid Layout',
          category: 'CSS',
          sortOrder: 2,
          checklists: [
            'Saya memahami grid-template-columns dan grid-template-rows',
            'Saya dapat membuat dynamic responsive grid dengan repeat(auto-fit, minmax(...))',
            'Saya tahu kapan harus menggunakan CSS Grid dibanding Flexbox',
          ],
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Responsive Web Design & Mobile-First',
      description: 'Menjamin tampilan web sempurna di semua resolusi viewport tanpa horizontal scrollbar.',
      isCurrent: false,
      topics: [
        {
          title: 'Media Queries & Viewports',
          category: 'CSS',
          sortOrder: 1,
          checklists: [
            'Saya memahami prinsip Mobile-First approach (@media (min-width: ...))',
            'Saya dapat mengatur responsive typography (rem, clamp, fluid type)',
            'Saya dapat mengaudit dan mencegah layout horizontal overflow (overflow-x)',
          ],
        },
      ],
    },
    {
      weekNumber: 4,
      title: 'JavaScript Fundamentals & DOM Manipulation',
      description: 'Dasar pemrograman JavaScript modern dan manipulasi interaktif halaman web.',
      isCurrent: false,
      topics: [
        {
          title: 'JavaScript Syntax & Arrays',
          category: 'JAVASCRIPT',
          sortOrder: 1,
          checklists: [
            'Saya memahami let, const, arrow functions, template literals, dan destructuring',
            'Saya mahir menggunakan array iteration methods (map, filter, reduce, forEach)',
          ],
        },
        {
          title: 'DOM Events & Interactivity',
          category: 'JAVASCRIPT',
          sortOrder: 2,
          checklists: [
            'Saya dapat memilih dan mengubah elemen DOM (querySelector, classList, textContent)',
            'Saya dapat menangani event listener (click, submit, input) dan event.preventDefault()',
          ],
        },
      ],
    },
    {
      weekNumber: 5,
      title: 'Asynchronous JavaScript & REST API Integration',
      description: 'Komunikasi data asynchronous menggunakan Fetch API dan Promise.',
      isCurrent: false,
      topics: [
        {
          title: 'Fetch API & Async/Await',
          category: 'JAVASCRIPT',
          sortOrder: 1,
          checklists: [
            'Saya memahami asynchronous JavaScript, Promise, dan async/await',
            'Saya dapat mengambil data dari REST API publik menggunakan fetch()',
            'Saya dapat menangani loading state dan error handling (try/catch) dengan ramah pengguna',
          ],
        },
      ],
    },
    {
      weekNumber: 6,
      title: 'Component-Based Frontend with React',
      description: 'Membangun antarmuka modern modular dengan React, Hooks, dan State Management.',
      isCurrent: false,
      topics: [
        {
          title: 'React Components, Props & State',
          category: 'JAVASCRIPT',
          sortOrder: 1,
          checklists: [
            'Saya memahami prinsip komponen deklaratif dan passing data via props',
            'Saya dapat mengelola interaktivitas dengan useState dan form inputs',
            'Saya memahami lifecycle efek samping dengan useEffect',
          ],
        },
      ],
    },
    {
      weekNumber: 7,
      title: 'Backend API Development with Express',
      description: 'Membuat RESTful API server-side, routing, dan validation middleware.',
      isCurrent: false,
      topics: [
        {
          title: 'Express REST Server & Middlewares',
          category: 'BACKEND',
          sortOrder: 1,
          checklists: [
            'Saya dapat membuat server Express dengan clean routing structure',
            'Saya dapat memvalidasi input request dengan Zod / Joi di boundary',
            'Saya memahami implementasi global error handler',
          ],
        },
      ],
    },
    {
      weekNumber: 8,
      title: 'Database & Fullstack Project Integration',
      description: 'Koneksi database PostgreSQL, Prisma/Drizzle ORM, dan integrasi fullstack end-to-end.',
      isCurrent: false,
      topics: [
        {
          title: 'Relational Database & Fullstack Wiring',
          category: 'FULLSTACK',
          sortOrder: 1,
          checklists: [
            'Saya dapat merancang skema relasi dan menjalankan database migration',
            'Saya dapat menghubungkan frontend React dengan backend API secara penuh',
            'Saya siap memulai implementasi client project nyata',
          ],
        },
      ],
    },
  ];

  const createdChecklistItems: { id: string; statement: string }[] = [];
  let flexboxTopicId = '';

  for (const w of roadmapData) {
    const [weekRow] = await db
      .insert(roadmapWeeks)
      .values({
        weekNumber: w.weekNumber,
        title: w.title,
        description: w.description,
        isCurrent: w.isCurrent,
      })
      .returning();

    for (const t of w.topics) {
      const [topicRow] = await db
        .insert(topics)
        .values({
          weekId: weekRow.id,
          title: t.title,
          category: t.category,
          sortOrder: t.sortOrder,
        })
        .returning();

      if (t.title.includes('Flexbox')) {
        flexboxTopicId = topicRow.id;
      }

      for (let i = 0; i < t.checklists.length; i++) {
        const [cItem] = await db
          .insert(checklistItems)
          .values({
            topicId: topicRow.id,
            statement: t.checklists[i],
            sortOrder: i + 1,
          })
          .returning();

        createdChecklistItems.push(cItem);
      }
    }
  }

  // 5. Seed some realistic initial checklist progress for Andi
  console.log('📊 Seeding initial student progress & sprints...');
  if (createdChecklistItems.length >= 4) {
    await db.insert(checklistProgress).values([
      {
        userId: studentAndi.id,
        checklistItemId: createdChecklistItems[0].id,
        status: 'CAN_DO_INDEPENDENTLY',
      },
      {
        userId: studentAndi.id,
        checklistItemId: createdChecklistItems[1].id,
        status: 'CAN_DO_INDEPENDENTLY',
      },
      {
        userId: studentAndi.id,
        checklistItemId: createdChecklistItems[2].id,
        status: 'PRACTICING',
      },
      {
        userId: studentAndi.id,
        checklistItemId: createdChecklistItems[3].id,
        status: 'LEARNING',
      },
    ]);

    await db.insert(checklistProgress).values([
      {
        userId: studentBudi.id,
        checklistItemId: createdChecklistItems[0].id,
        status: 'CAN_DO_INDEPENDENTLY',
      },
      {
        userId: studentBudi.id,
        checklistItemId: createdChecklistItems[1].id,
        status: 'LEARNING',
      },
    ]);
  }

  // 6. Seed Learning Sprint with Habit reflection & Evidence
  const [sprintAndi] = await db
    .insert(learningSprints)
    .values({
      userId: studentAndi.id,
      topicId: flexboxTopicId || null,
      durationMinutes: 35, // >= 25 min habit reached!
      whatLearned: 'Saya memahami perbedaan mendasar justify-content (main axis) dan align-items (cross axis).',
      whatPracticed: 'Membuat navigation bar responsive dengan tombol CTA yang rapi di sudut kanan.',
      confusingParts: 'Awalnya masih bingung kapan flex-wrap dibutuhkan saat item bertambah banyak.',
      evidenceUrl: 'https://github.com/andipratama/webdev-portfolio',
      evidenceType: 'GITHUB',
    })
    .returning();

  const [sprintBudi] = await db
    .insert(learningSprints)
    .values({
      userId: studentBudi.id,
      topicId: flexboxTopicId || null,
      durationMinutes: 30,
      whatLearned: 'Mempelajari cara membuat card layout menggunakan display: flex dengan gap 1.5rem.',
      whatPracticed: 'Slicing layout 3 kolom pricing cards.',
      confusingParts: 'Masih sering lupa setting flex-shrink agar card tidak gepeng di mobile.',
      evidenceUrl: 'https://budisantoso.github.io/learning-logs',
      evidenceType: 'GITHUB_PAGES',
    })
    .returning();

  // 7. Seed Peer Feedback
  console.log('💬 Seeding Peer Feedback...');
  await db.insert(peerFeedback).values([
    {
      sprintId: sprintAndi.id,
      authorId: studentBudi.id,
      comment: 'Implementasi navbar kamu clean banget! Di layar mobile spacing CTA-nya udah pas.',
    },
    {
      sprintId: sprintBudi.id,
      authorId: studentAndi.id,
      comment: 'Bagus Bud! Kalau mau cardnya ga gepeng, coba set flex-shrink: 0 atau pakai min-width.',
    },
  ]);

  console.log('✅ Database seed completed successfully!');
  await queryClient.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
