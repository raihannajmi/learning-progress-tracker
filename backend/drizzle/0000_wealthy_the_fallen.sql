CREATE TYPE "public"."checklist_status" AS ENUM('NOT_STARTED', 'LEARNING', 'PRACTICING', 'CAN_DO_INDEPENDENTLY');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('GITHUB', 'GITHUB_PAGES', 'LOOM', 'FIGMA', 'LIVE_DEMO', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'ADMIN');--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"statement" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"checklist_item_id" uuid NOT NULL,
	"status" "checklist_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"academic_term" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"milestone_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'NOT_STARTED' NOT NULL,
	"certificate_url" varchar(500),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" uuid,
	"duration_minutes" integer NOT NULL,
	"what_learned" text NOT NULL,
	"what_practiced" text NOT NULL,
	"confusing_parts" text,
	"evidence_url" varchar(500),
	"evidence_type" "evidence_type" DEFAULT 'OTHER',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peer_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_weeks_week_number_unique" UNIQUE("week_number")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"nim" varchar(50),
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"class_id" uuid,
	"github_repo_url" varchar(500),
	"github_page_url" varchar(500),
	"avatar_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_progress" ADD CONSTRAINT "checklist_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_progress" ADD CONSTRAINT "checklist_progress_checklist_item_id_checklist_items_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."checklist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_milestones" ADD CONSTRAINT "external_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD CONSTRAINT "learning_sprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sprints" ADD CONSTRAINT "learning_sprints_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_feedback" ADD CONSTRAINT "peer_feedback_sprint_id_learning_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."learning_sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_feedback" ADD CONSTRAINT "peer_feedback_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_week_id_roadmap_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."roadmap_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_items_topic_id_idx" ON "checklist_items" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_checklist_unique_idx" ON "checklist_progress" USING btree ("user_id","checklist_item_id");--> statement-breakpoint
CREATE INDEX "checklist_progress_user_id_idx" ON "checklist_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checklist_progress_status_idx" ON "checklist_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "external_milestones_user_id_idx" ON "external_milestones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learning_sprints_user_id_idx" ON "learning_sprints" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learning_sprints_topic_id_idx" ON "learning_sprints" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "learning_sprints_created_at_idx" ON "learning_sprints" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "peer_feedback_sprint_id_idx" ON "peer_feedback" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "peer_feedback_author_id_idx" ON "peer_feedback" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "topics_week_id_idx" ON "topics" USING btree ("week_id");--> statement-breakpoint
CREATE INDEX "topics_category_idx" ON "topics" USING btree ("category");--> statement-breakpoint
CREATE INDEX "users_class_id_idx" ON "users" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");