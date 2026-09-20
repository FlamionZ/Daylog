CREATE TYPE "public"."document_category" AS ENUM('administration', 'report', 'certificate', 'work_sample', 'other');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('draft', 'completed');--> statement-breakpoint
CREATE TYPE "public"."learning_level" AS ENUM('exploring', 'learning', 'practicing', 'confident');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'final');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('weekly', 'monthly', 'final', 'custom');--> statement-breakpoint
CREATE TYPE "public"."task_link_type" AS ENUM('repository', 'branch', 'commit', 'pull_request', 'deployment', 'documentation', 'other');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('backlog', 'todo', 'in_progress', 'review', 'blocked', 'done');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('wfo', 'wfh', 'hybrid', 'leave', 'sick', 'holiday');--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"avatar_path" text,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"role_title" text NOT NULL,
	"location" text,
	"mentor_name" text,
	"mentor_contact" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"default_start_time" time,
	"default_end_time" time,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "internship_dates_check" CHECK ("internships"."end_date" >= "internships"."start_date")
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"work_mode" "work_mode" NOT NULL,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"break_minutes" integer DEFAULT 0 NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_break_minutes_check" CHECK ("attendance_records"."break_minutes" >= 0),
	CONSTRAINT "attendance_checkout_needs_checkin" CHECK ("attendance_records"."check_out_at" IS NULL OR "attendance_records"."check_in_at" IS NOT NULL),
	CONSTRAINT "attendance_checkout_after_checkin" CHECK ("attendance_records"."check_out_at" IS NULL OR "attendance_records"."check_out_at" >= "attendance_records"."check_in_at")
);
--> statement-breakpoint
CREATE TABLE "journal_tasks" (
	"user_id" uuid NOT NULL,
	"journal_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_tasks_journal_id_task_id_pk" PRIMARY KEY("journal_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"journal_date" date NOT NULL,
	"title" text,
	"summary" text,
	"activities" text,
	"learnings" text,
	"blockers" text,
	"solutions" text,
	"next_plan" text,
	"status" "journal_status" DEFAULT 'draft' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"link_type" "task_link_type" NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'backlog' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"estimate_minutes" integer,
	"actual_minutes" integer,
	"sort_order" numeric DEFAULT '0' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_estimate_minutes_check" CHECK ("tasks"."estimate_minutes" IS NULL OR "tasks"."estimate_minutes" >= 0),
	CONSTRAINT "task_actual_minutes_check" CHECK ("tasks"."actual_minutes" IS NULL OR "tasks"."actual_minutes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "learnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"journal_id" uuid,
	"task_id" uuid,
	"topic" text NOT NULL,
	"technology" text,
	"summary" text,
	"source_url" text,
	"level" "learning_level" DEFAULT 'exploring' NOT NULL,
	"learned_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"report_type" "report_type" NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"source_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statistics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_period_check" CHECK ("reports"."period_end" >= "reports"."period_start")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"internship_id" uuid NOT NULL,
	"category" "document_category" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"storage_path" text,
	"external_url" text,
	"mime_type" text,
	"size_bytes" bigint,
	"document_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_storage_or_url_check" CHECK (("documents"."storage_path" IS NOT NULL AND "documents"."external_url" IS NULL) OR ("documents"."storage_path" IS NULL AND "documents"."external_url" IS NOT NULL)),
	CONSTRAINT "document_size_bytes_check" CHECK ("documents"."size_bytes" IS NULL OR "documents"."size_bytes" >= 0)
);
--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_tasks" ADD CONSTRAINT "journal_tasks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_tasks" ADD CONSTRAINT "journal_tasks_journal_id_journals_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_tasks" ADD CONSTRAINT "journal_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_links" ADD CONSTRAINT "task_links_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_links" ADD CONSTRAINT "task_links_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_journal_id_journals_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_active_internship" ON "internships" USING btree ("user_id") WHERE "internships"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attendance_internship_date" ON "attendance_records" USING btree ("internship_id","work_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_journals_internship_date" ON "journals" USING btree ("internship_id","journal_date");--> statement-breakpoint
CREATE INDEX "idx_task_links_task_type" ON "task_links" USING btree ("task_id","link_type");--> statement-breakpoint
CREATE INDEX "idx_tasks_internship_status_sort" ON "tasks" USING btree ("internship_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_tasks_internship_due_date" ON "tasks" USING btree ("internship_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_learnings_internship_date" ON "learnings" USING btree ("internship_id","learned_on");--> statement-breakpoint
CREATE INDEX "idx_learnings_internship_technology" ON "learnings" USING btree ("internship_id","technology");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_reports_unique_final" ON "reports" USING btree ("internship_id","report_type","period_start","period_end") WHERE "reports"."status" = 'final';