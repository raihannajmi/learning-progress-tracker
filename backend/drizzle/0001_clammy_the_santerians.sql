ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "review_status" varchar(50) DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "needs_feedback" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "instructor_feedback" text;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "reviewed_by_id" uuid;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "learning_sprints" ADD CONSTRAINT "learning_sprints_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_sprints_review_status_idx" ON "learning_sprints" USING btree ("review_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_sprints_needs_feedback_idx" ON "learning_sprints" USING btree ("needs_feedback");