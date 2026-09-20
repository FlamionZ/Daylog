-- ============================================================================
-- Internship Companion - Initial Schema, Security, and Triggers
-- Generated per Schema.md and Architecture.md
-- ============================================================================

-- 1. Enumerations
CREATE TYPE "public"."document_category" AS ENUM('administration', 'report', 'certificate', 'work_sample', 'other');
CREATE TYPE "public"."journal_status" AS ENUM('draft', 'completed');
CREATE TYPE "public"."learning_level" AS ENUM('exploring', 'learning', 'practicing', 'confident');
CREATE TYPE "public"."report_status" AS ENUM('draft', 'final');
CREATE TYPE "public"."report_type" AS ENUM('weekly', 'monthly', 'final', 'custom');
CREATE TYPE "public"."task_link_type" AS ENUM('repository', 'branch', 'commit', 'pull_request', 'deployment', 'documentation', 'other');
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');
CREATE TYPE "public"."task_status" AS ENUM('backlog', 'todo', 'in_progress', 'review', 'blocked', 'done');
CREATE TYPE "public"."work_mode" AS ENUM('wfo', 'wfh', 'hybrid', 'leave', 'sick', 'holiday');

-- 2. Tables
CREATE TABLE "public"."profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	"full_name" text NOT NULL,
	"avatar_path" text,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."internships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
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
	CONSTRAINT "internship_dates_check" CHECK ("end_date" >= "start_date")
);

CREATE TABLE "public"."attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"work_date" date NOT NULL,
	"work_mode" "public"."work_mode" NOT NULL,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"break_minutes" integer DEFAULT 0 NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_break_minutes_check" CHECK ("break_minutes" >= 0),
	CONSTRAINT "attendance_checkout_needs_checkin" CHECK ("check_out_at" IS NULL OR "check_in_at" IS NOT NULL),
	CONSTRAINT "attendance_checkout_after_checkin" CHECK ("check_out_at" IS NULL OR "check_out_at" >= "check_in_at")
);

CREATE TABLE "public"."tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"description" text,
	"status" "public"."task_status" DEFAULT 'backlog' NOT NULL,
	"priority" "public"."task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"estimate_minutes" integer,
	"actual_minutes" integer,
	"sort_order" numeric DEFAULT '0' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_estimate_minutes_check" CHECK ("estimate_minutes" IS NULL OR "estimate_minutes" >= 0),
	CONSTRAINT "task_actual_minutes_check" CHECK ("actual_minutes" IS NULL OR "actual_minutes" >= 0)
);

CREATE TABLE "public"."task_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"task_id" uuid NOT NULL REFERENCES "public"."tasks"("id") ON DELETE CASCADE,
	"link_type" "public"."task_link_type" NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"journal_date" date NOT NULL,
	"title" text,
	"summary" text,
	"activities" text,
	"learnings" text,
	"blockers" text,
	"solutions" text,
	"next_plan" text,
	"status" "public"."journal_status" DEFAULT 'draft' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."journal_tasks" (
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"journal_id" uuid NOT NULL REFERENCES "public"."journals"("id") ON DELETE CASCADE,
	"task_id" uuid NOT NULL REFERENCES "public"."tasks"("id") ON DELETE CASCADE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_tasks_journal_id_task_id_pk" PRIMARY KEY("journal_id","task_id")
);

CREATE TABLE "public"."learnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"journal_id" uuid REFERENCES "public"."journals"("id") ON DELETE SET NULL,
	"task_id" uuid REFERENCES "public"."tasks"("id") ON DELETE SET NULL,
	"topic" text NOT NULL,
	"technology" text,
	"summary" text,
	"source_url" text,
	"level" "public"."learning_level" DEFAULT 'exploring' NOT NULL,
	"learned_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"report_type" "public"."report_type" NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"source_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statistics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "public"."report_status" DEFAULT 'draft' NOT NULL,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_period_check" CHECK ("period_end" >= "period_start")
);

CREATE TABLE "public"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid NOT NULL REFERENCES "public"."internships"("id") ON DELETE CASCADE,
	"category" "public"."document_category" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"storage_path" text,
	"external_url" text,
	"mime_type" text,
	"size_bytes" bigint,
	"document_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_storage_or_url_check" CHECK (("storage_path" IS NOT NULL AND "external_url" IS NULL) OR ("storage_path" IS NULL AND "external_url" IS NOT NULL)),
	CONSTRAINT "document_size_bytes_check" CHECK ("size_bytes" IS NULL OR "size_bytes" >= 0)
);

-- 3. Indexes
CREATE UNIQUE INDEX "idx_unique_active_internship" ON "public"."internships" USING btree ("user_id") WHERE "is_active" = true;
CREATE UNIQUE INDEX "idx_attendance_internship_date" ON "public"."attendance_records" USING btree ("internship_id", "work_date");
CREATE UNIQUE INDEX "idx_journals_internship_date" ON "public"."journals" USING btree ("internship_id", "journal_date");
CREATE INDEX "idx_task_links_task_type" ON "public"."task_links" USING btree ("task_id", "link_type");
CREATE INDEX "idx_tasks_internship_status_sort" ON "public"."tasks" USING btree ("internship_id", "status", "sort_order");
CREATE INDEX "idx_tasks_internship_due_date" ON "public"."tasks" USING btree ("internship_id", "due_date");
CREATE INDEX "idx_learnings_internship_date" ON "public"."learnings" USING btree ("internship_id", "learned_on" DESC);
CREATE INDEX "idx_learnings_internship_technology" ON "public"."learnings" USING btree ("internship_id", "technology");
CREATE UNIQUE INDEX "idx_reports_unique_final" ON "public"."reports" USING btree ("internship_id", "report_type", "period_start", "period_end") WHERE "status" = 'final';

-- 4. Triggers & Functions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_internships_updated_at BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_journals_updated_at BEFORE UPDATE ON public.journals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_task_links_updated_at BEFORE UPDATE ON public.task_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_learnings_updated_at BEFORE UPDATE ON public.learnings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_path, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Jakarta')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_profile" ON public.profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_internships" ON public.internships FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_attendance" ON public.attendance_records FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_journals" ON public.journals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_journal_tasks" ON public.journal_tasks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_tasks" ON public.tasks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_task_links" ON public.task_links FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_learnings" ON public.learnings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_reports" ON public.reports FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_manage_own_documents" ON public.documents FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6. Views
CREATE OR REPLACE VIEW public.attendance_with_duration AS
SELECT
  id,
  user_id,
  internship_id,
  work_date,
  work_mode,
  check_in_at,
  check_out_at,
  break_minutes,
  location,
  notes,
  created_at,
  updated_at,
  CASE
    WHEN check_in_at IS NOT NULL AND check_out_at IS NOT NULL THEN
      GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 60) - break_minutes)
    ELSE NULL
  END AS worked_minutes
FROM public.attendance_records;
