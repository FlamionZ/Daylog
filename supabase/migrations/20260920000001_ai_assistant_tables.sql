-- ============================================================================
-- Migration: 20260920000001_ai_assistant_tables.sql
-- Description: Adds tables, indexes, triggers, and RLS for AI Assistant
-- ============================================================================

-- 1. Table: ai_generations
CREATE TABLE IF NOT EXISTS "public"."ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"internship_id" uuid REFERENCES "public"."internships"("id") ON DELETE SET NULL,
	"feature" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"input_entity_type" text,
	"input_entity_ids" jsonb,
	"status" text DEFAULT 'completed' NOT NULL,
	"result_json" jsonb,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_ai_generations_user_created" ON "public"."ai_generations" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_ai_generations_feature" ON "public"."ai_generations" ("user_id", "feature");

-- 2. Table: ai_usage_daily
CREATE TABLE IF NOT EXISTS "public"."ai_usage_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"usage_date" date NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"estimated_cost" numeric(10, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_ai_user_daily_usage" ON "public"."ai_usage_daily" ("user_id", "usage_date");

-- 3. Table: ai_preferences
CREATE TABLE IF NOT EXISTS "public"."ai_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"save_history" boolean DEFAULT false NOT NULL,
	"allow_selected_documents" boolean DEFAULT false NOT NULL,
	"daily_request_limit" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Apply set_updated_at triggers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS "set_updated_at_ai_usage_daily" ON "public"."ai_usage_daily";
    CREATE TRIGGER "set_updated_at_ai_usage_daily"
      BEFORE UPDATE ON "public"."ai_usage_daily"
      FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

    DROP TRIGGER IF EXISTS "set_updated_at_ai_preferences" ON "public"."ai_preferences";
    CREATE TRIGGER "set_updated_at_ai_preferences"
      BEFORE UPDATE ON "public"."ai_preferences"
      FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
  END IF;
END $$;

-- 5. Row Level Security (RLS)
ALTER TABLE "public"."ai_generations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_usage_daily" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_preferences" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_ai_generations" ON "public"."ai_generations";
CREATE POLICY "users_manage_own_ai_generations" ON "public"."ai_generations"
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_ai_usage" ON "public"."ai_usage_daily";
CREATE POLICY "users_manage_own_ai_usage" ON "public"."ai_usage_daily"
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_ai_preferences" ON "public"."ai_preferences";
CREATE POLICY "users_manage_own_ai_preferences" ON "public"."ai_preferences"
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
