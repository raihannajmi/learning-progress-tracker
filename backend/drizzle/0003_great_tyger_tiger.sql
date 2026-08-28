ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "loom_url" varchar(500);--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "demo_url" varchar(500);