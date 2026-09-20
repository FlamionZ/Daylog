import { createClient } from '@/lib/supabase/server';
import { todayInJakarta } from '@/lib/date';
import { env } from '@/lib/env';
import { AIError } from '../errors/ai-error';

export interface UsageStatus {
  allowed: boolean;
  currentRequests: number;
  limit: number;
  remaining: number;
  inputTokens: number;
  outputTokens: number;
}

export interface RecordUsageOptions {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
}

/**
 * Checks if the user is within their daily request limit.
 */
export async function checkDailyLimit(userId: string): Promise<UsageStatus> {
  const supabase = await createClient();
  const today = todayInJakarta();

  // 1. Get user's custom daily limit from preferences if exists
  const { data: pref } = await supabase
    .from('ai_preferences')
    .select('daily_request_limit, is_enabled')
    .eq('user_id', userId)
    .maybeSingle();

  if (pref && !pref.is_enabled) {
    throw AIError.disabled('Fitur AI dinonaktifkan pada preferensi akun Anda.');
  }

  const limit = pref?.daily_request_limit ?? env.AI_DAILY_REQUEST_LIMIT;

  // 2. Fetch today's usage record
  const { data: usage } = await supabase
    .from('ai_usage_daily')
    .select('request_count, input_tokens, output_tokens')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  const currentRequests = usage?.request_count ?? 0;
  const remaining = Math.max(0, limit - currentRequests);
  const allowed = currentRequests < limit;

  return {
    allowed,
    currentRequests,
    limit,
    remaining,
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
  };
}

/**
 * Atomically increments daily request count and adds token usage.
 */
export async function recordUsage(
  userId: string,
  options: RecordUsageOptions,
): Promise<void> {
  const supabase = await createClient();
  const today = todayInJakarta();

  const { data: existing } = await supabase
    .from('ai_usage_daily')
    .select('id, request_count, input_tokens, output_tokens, estimated_cost')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (existing) {
    const updatedCount = (existing.request_count || 0) + 1;
    const updatedInput = (existing.input_tokens || 0) + (options.promptTokens || 0);
    const updatedOutput = (existing.output_tokens || 0) + (options.completionTokens || 0);
    const updatedCost =
      Number(existing.estimated_cost || 0) + (options.estimatedCost || 0);

    await supabase
      .from('ai_usage_daily')
      .update({
        request_count: updatedCount,
        input_tokens: updatedInput,
        output_tokens: updatedOutput,
        estimated_cost: updatedCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('ai_usage_daily').insert({
      user_id: userId,
      usage_date: today,
      request_count: 1,
      input_tokens: options.promptTokens || 0,
      output_tokens: options.completionTokens || 0,
      estimated_cost: options.estimatedCost || 0,
    });
  }
}
