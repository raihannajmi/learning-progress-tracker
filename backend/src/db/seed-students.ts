import fs from 'node:fs';
import path from 'node:path';
import { db, queryClient } from './index.js';
import { users, classes } from './schema.js';
import { eq } from 'drizzle-orm';

export async function importStudentsFromJson() {
  console.log('📦 Starting Batch Student Import from JSON...');

  // 1. Locate students.private.json
  const possiblePaths = [
    path.join(process.cwd(), 'src/db/data/students.private.json'),
    path.join(process.cwd(), 'dist/db/data/students.private.json'),
    path.join(process.cwd(), 'students.private.json'),
  ];

  let filePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!filePath) {
    console.error('❌ students.private.json not found in expected locations:');
    possiblePaths.forEach((p) => console.log(`   - ${p}`));
    process.exit(1);
  }

  console.log(`📄 Found private student dataset at: ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const studentsList: Array<{
    email: string;
    name: string;
    nim: string;
    className?: string;
  }> = JSON.parse(raw);

  // 2. Fetch existing classes
  const dbClasses = await db.select().from(classes);
  const classMap = new Map<string, string>();
  dbClasses.forEach((c) => classMap.set(c.name, c.id));
  const defaultClassId = dbClasses[0]?.id;

  let addedCount = 0;
  let skippedCount = 0;

  for (const st of studentsList) {
    const email = st.email.trim().toLowerCase();
    const classId = (st.className ? classMap.get(st.className) : undefined) || defaultClassId;
    const username = email.split('@')[0];

    // Check if already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      skippedCount++;
      continue;
    }

    await db.insert(users).values({
      name: st.name.trim(),
      email,
      nim: st.nim.trim(),
      role: 'STUDENT',
      classId,
      githubRepoUrl: `https://github.com/${username}/webdev-portfolio`,
      githubPageUrl: `https://${username}.github.io/webdev-portfolio`,
    });

    addedCount++;
  }

  console.log(`✅ Student Import Complete!`);
  console.log(`   - Added: ${addedCount} students`);
  console.log(`   - Skipped: ${skippedCount} existing records`);
  console.log(`   - Total processed: ${studentsList.length}`);
}

if (process.argv[1]?.endsWith('seed-students.ts') || process.argv[1]?.endsWith('seed-students.js')) {
  importStudentsFromJson()
    .then(async () => {
      await queryClient.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Student import failed:', err);
      await queryClient.end();
      process.exit(1);
    });
}
