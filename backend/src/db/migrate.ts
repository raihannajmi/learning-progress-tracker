import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5434/learning_progress_tracker';

async function runMigration() {
  console.log('🔄 Running database migrations via Drizzle...');

  // Migration requires max: 1 connection
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    const migrationsFolder = path.join(process.cwd(), 'drizzle');
    await migrate(db, { migrationsFolder });
    console.log('✅ All database migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigration();
