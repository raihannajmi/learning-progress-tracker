import { db } from './index.js';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Running review columns migration...');
  await db.execute(sql`
    ALTER TABLE learning_sprints ADD COLUMN IF NOT EXISTS review_status varchar(50) DEFAULT 'PENDING' NOT NULL;
    ALTER TABLE learning_sprints ADD COLUMN IF NOT EXISTS instructor_feedback text;
    ALTER TABLE learning_sprints ADD COLUMN IF NOT EXISTS reviewed_by_id uuid REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE learning_sprints ADD COLUMN IF NOT EXISTS reviewed_at timestamp;
    CREATE INDEX IF NOT EXISTS learning_sprints_review_status_idx ON learning_sprints (review_status);
  `);
  console.log('✅ PostgreSQL Schema updated with review columns successfully!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
