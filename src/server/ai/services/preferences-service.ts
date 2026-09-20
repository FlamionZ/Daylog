import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export interface UserAIPreferences {
  isEnabled: boolean;
  saveHistory: boolean;
  allowSelectedDocuments: boolean;
  dailyRequestLimit: number;
}

export interface RecordGenerationData {
  internshipId?: string;
  feature: string;
  provider: string;
  model: string;
  inputEntityType?: string;
  inputEntityIds?: string[];
  status: 'completed' | 'failed';
  resultJson?: unknown;
}

/**
 * Gets user's AI preferences, with sensible defaults if not yet created.
 */
export async function getUserAIPreferences(
  userId: string,
): Promise<UserAIPreferences> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_preferences')
    .select('is_enabled, save_history, allow_selected_documents, daily_request_limit')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      isEnabled: true,
      saveHistory: false,
      allowSelectedDocuments: false,
      dailyRequestLimit: env.AI_DAILY_REQUEST_LIMIT,
    };
  }

  return {
    isEnabled: data.is_enabled,
    saveHistory: data.save_history,
    allowSelectedDocuments: data.allow_selected_documents,
    dailyRequestLimit: data.daily_request_limit,
  };
}

/**
 * Updates or creates user's AI preferences.
 */
export async function updateUserAIPreferences(
  userId: string,
  input: Partial<UserAIPreferences>,
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('ai_preferences').upsert(
    {
      user_id: userId,
      is_enabled: input.isEnabled,
      save_history: input.saveHistory,
      allow_selected_documents: input.allowSelectedDocuments,
      daily_request_limit: input.dailyRequestLimit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

/**
 * Deletes all AI generation history for the specified user.
 */
export async function clearUserAIHistory(userId: string): Promise<void> {
  const supabase = await createClient();

  await supabase.from('ai_generations').delete().eq('user_id', userId);
}

/**
 * Records an AI generation event.
 * Per privacy rules, resultJson is ONLY stored if saveHistory is true!
 */
export async function recordAIGeneration(
  userId: string,
  data: RecordGenerationData,
): Promise<void> {
  const supabase = await createClient();
  const prefs = await getUserAIPreferences(userId);

  await supabase.from('ai_generations').insert({
    user_id: userId,
    internship_id: data.internshipId || null,
    feature: data.feature,
    provider: data.provider,
    model: data.model,
    input_entity_type: data.inputEntityType || null,
    input_entity_ids: data.inputEntityIds ? JSON.stringify(data.inputEntityIds) : null,
    status: data.status,
    // Only store output if user opted in to history preservation
    result_json: prefs.saveHistory && data.resultJson ? data.resultJson : null,
  });
}
