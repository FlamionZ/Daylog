'use server';

import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/server/ai/providers/provider';
import {
  JOURNAL_SYSTEM_PROMPT,
  buildJournalPrompt,
  journalSuggestionSchema,
  type JournalSuggestion,
} from '@/server/ai/prompts/journal';
import {
  IMPROVE_WRITING_SYSTEM_PROMPT,
  buildImproveWritingPrompt,
  improveWritingSchema,
  type ImproveWritingMode,
} from '@/server/ai/prompts/improve-writing';
import {
  EXTRACT_TASKS_SYSTEM_PROMPT,
  buildExtractTasksPrompt,
  extractedTasksSchema,
  type ExtractedTaskItem,
} from '@/server/ai/prompts/extract-tasks';
import {
  EXTRACT_LEARNINGS_SYSTEM_PROMPT,
  buildExtractLearningsPrompt,
  extractedLearningsSchema,
  type ExtractedLearningItem,
} from '@/server/ai/prompts/extract-learnings';
import {
  WEEKLY_REPORT_SYSTEM_PROMPT,
  buildWeeklyReportPrompt,
  weeklyReportEnhancementSchema,
  type WeeklyReportEnhancement,
} from '@/server/ai/prompts/weekly-report';
import {
  FINAL_REPORT_SYSTEM_PROMPT,
  buildFinalReportPrompt,
  finalReportDraftSchema,
  type FinalReportDraft,
} from '@/server/ai/prompts/final-report';
import {
  PROGRESS_SUMMARY_SYSTEM_PROMPT,
  buildProgressSummaryPrompt,
  progressSummarySchema,
  type ProgressSummary,
} from '@/server/ai/prompts/progress-summary';
import {
  BLOCKER_ADVISOR_SYSTEM_PROMPT,
  buildBlockerAdvisorPrompt,
  blockerAdviceSchema,
  type BlockerAdvice,
} from '@/server/ai/prompts/blocker-advisor';
import {
  DAILY_REFLECTION_SYSTEM_PROMPT,
  buildDailyReflectionPrompt,
  dailyReflectionSchema,
  type DailyReflection,
} from '@/server/ai/prompts/daily-reflection';
import { hasSensitiveData, redactText } from '@/server/ai/safety/redactor';
import { checkDailyLimit, recordUsage, type UsageStatus } from '@/server/ai/usage/usage-service';
import {
  recordAIGeneration,
  getUserAIPreferences,
  updateUserAIPreferences,
  clearUserAIHistory,
  type UserAIPreferences,
} from '@/server/ai/services/preferences-service';
import { AIError } from '@/server/ai/errors/ai-error';

export interface GenerateJournalSuggestionInput {
  journalDate: string;
  notes?: string;
  tasksDone?: string[];
  tasksInProgress?: string[];
  attendanceInfo?: string;
}

export interface ImproveWritingInput {
  text: string;
  mode: ImproveWritingMode;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  warning?: string;
  error?: string;
}

export async function generateJournalSuggestionAction(
  input: GenerateJournalSuggestionInput,
): Promise<ActionResult<JournalSuggestion>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    // 1. Check daily rate limit & preferences
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data from notes
    let warning: string | undefined;
    let safeNotes = input.notes || '';
    if (safeNotes) {
      const detection = hasSensitiveData(safeNotes);
      if (detection.detected) {
        warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED] sebelum dikirim ke AI.`;
        safeNotes = redactText(safeNotes).redactedText;
      }
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildJournalPrompt({
      journalDate: input.journalDate,
      notes: safeNotes,
      tasksDone: input.tasksDone,
      tasksInProgress: input.tasksInProgress,
      attendanceInfo: input.attendanceInfo,
    });

    const result = await provider.generateStructuredOutput({
      systemPrompt: JOURNAL_SYSTEM_PROMPT,
      prompt,
      schema: journalSuggestionSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'journal_suggestion',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('generateJournalSuggestionAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghasilkan draf jurnal dengan AI.',
    };
  }
}

export async function improveWritingAction(
  input: ImproveWritingInput,
): Promise<ActionResult<{ improvedText: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    if (!input.text || !input.text.trim()) {
      return { success: false, error: 'Teks tidak boleh kosong.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeText = input.text;
    const detection = hasSensitiveData(safeText);
    if (detection.detected) {
      warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
      safeText = redactText(safeText).redactedText;
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildImproveWritingPrompt(safeText, input.mode);

    const result = await provider.generateStructuredOutput({
      systemPrompt: IMPROVE_WRITING_SYSTEM_PROMPT,
      prompt,
      schema: improveWritingSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'improve_writing',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('improveWritingAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyempurnakan tulisan.',
    };
  }
}

export interface ExtractTasksInput {
  notes: string;
  existingTasks?: string[];
}

export async function extractTasksAction(
  input: ExtractTasksInput,
): Promise<ActionResult<{ tasks: ExtractedTaskItem[] }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    if (!input.notes || !input.notes.trim()) {
      return { success: false, error: 'Catatan tidak boleh kosong.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeNotes = input.notes;
    const detection = hasSensitiveData(safeNotes);
    if (detection.detected) {
      warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
      safeNotes = redactText(safeNotes).redactedText;
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildExtractTasksPrompt(safeNotes, input.existingTasks);

    const result = await provider.generateStructuredOutput({
      systemPrompt: EXTRACT_TASKS_SYSTEM_PROMPT,
      prompt,
      schema: extractedTasksSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'task_extraction',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('extractTasksAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengekstrak tugas dari catatan.',
    };
  }
}

export interface ExtractLearningsInput {
  notes: string;
}

export async function extractLearningsAction(
  input: ExtractLearningsInput,
): Promise<ActionResult<{ learnings: ExtractedLearningItem[] }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    if (!input.notes || !input.notes.trim()) {
      return { success: false, error: 'Catatan tidak boleh kosong.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeNotes = input.notes;
    const detection = hasSensitiveData(safeNotes);
    if (detection.detected) {
      warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
      safeNotes = redactText(safeNotes).redactedText;
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildExtractLearningsPrompt(safeNotes);

    const result = await provider.generateStructuredOutput({
      systemPrompt: EXTRACT_LEARNINGS_SYSTEM_PROMPT,
      prompt,
      schema: extractedLearningsSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'learning_extraction',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('extractLearningsAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengekstrak pembelajaran dari catatan.',
    };
  }
}

export interface GenerateWeeklyReportInput {
  periodStart: string;
  periodEnd: string;
  statisticsText: string;
  journalsSummary: string;
  tasksCompletedText: string;
  learningsText: string;
  userNotes?: string;
}

export async function generateWeeklyReportEnhancementAction(
  input: GenerateWeeklyReportInput,
): Promise<ActionResult<WeeklyReportEnhancement>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeNotes = input.userNotes || '';
    if (safeNotes) {
      const detection = hasSensitiveData(safeNotes);
      if (detection.detected) {
        warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
        safeNotes = redactText(safeNotes).redactedText;
      }
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildWeeklyReportPrompt({
      ...input,
      userNotes: safeNotes,
    });

    const result = await provider.generateStructuredOutput({
      systemPrompt: WEEKLY_REPORT_SYSTEM_PROMPT,
      prompt,
      schema: weeklyReportEnhancementSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'weekly_report_enhancer',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('generateWeeklyReportEnhancementAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyusun narasi laporan mingguan.',
    };
  }
}

export interface GenerateFinalReportInput {
  internshipRole: string;
  companyName: string;
  durationText: string;
  totalHours: string;
  tasksCompletedSummary: string;
  learningsSummary: string;
  journalsSummary: string;
}

export async function generateFinalReportDraftAction(
  input: GenerateFinalReportInput,
): Promise<ActionResult<FinalReportDraft>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildFinalReportPrompt(input);

    const result = await provider.generateStructuredOutput({
      systemPrompt: FINAL_REPORT_SYSTEM_PROMPT,
      prompt,
      schema: finalReportDraftSchema,
      temperature: 0.2,
    });

    // 3. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'final_report_draft',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
    };
  } catch (err: unknown) {
    console.error('generateFinalReportDraftAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyusun draf laporan akhir magang.',
    };
  }
}

export interface GenerateProgressSummaryInput {
  periodText: string;
  attendanceText: string;
  recentTasksText: string;
  recentJournalsText: string;
  recentLearningsText?: string;
}

export async function generateProgressSummaryAction(
  input: GenerateProgressSummaryInput,
): Promise<ActionResult<ProgressSummary>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildProgressSummaryPrompt(input);

    const result = await provider.generateStructuredOutput({
      systemPrompt: PROGRESS_SUMMARY_SYSTEM_PROMPT,
      prompt,
      schema: progressSummarySchema,
      temperature: 0.2,
    });

    // 3. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'progress_summary',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
    };
  } catch (err: unknown) {
    console.error('generateProgressSummaryAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghasilkan ringkasan progres.',
    };
  }
}

export interface AnalyzeBlockerInput {
  blockerText: string;
  technology?: string;
  attemptedSolutions?: string;
}

export async function analyzeBlockerAction(
  input: AnalyzeBlockerInput,
): Promise<ActionResult<BlockerAdvice>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    if (!input.blockerText || !input.blockerText.trim()) {
      return { success: false, error: 'Deskripsi kendala tidak boleh kosong.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeBlocker = input.blockerText;
    const detection = hasSensitiveData(safeBlocker);
    if (detection.detected) {
      warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
      safeBlocker = redactText(safeBlocker).redactedText;
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildBlockerAdvisorPrompt({
      ...input,
      blockerText: safeBlocker,
    });

    const result = await provider.generateStructuredOutput({
      systemPrompt: BLOCKER_ADVISOR_SYSTEM_PROMPT,
      prompt,
      schema: blockerAdviceSchema,
      temperature: 0.2,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'blocker_advisor',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('analyzeBlockerAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menganalisis kendala teknis.',
    };
  }
}

export interface GenerateDailyReflectionInput {
  date: string;
  summary: string;
  learnings?: string;
  blockers?: string;
  activities?: string;
}

export async function generateDailyReflectionAction(
  input: GenerateDailyReflectionInput,
): Promise<ActionResult<DailyReflection>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    if (!input.summary || !input.summary.trim()) {
      return { success: false, error: 'Ringkasan aktivitas tidak boleh kosong untuk refleksi.' };
    }

    // 1. Check daily rate limit
    const usageStatus = await checkDailyLimit(user.id);
    if (!usageStatus.allowed) {
      return {
        success: false,
        error: `Batas kuota harian AI (${usageStatus.limit} request) telah tercapai. Kuota akan direset besok.`,
      };
    }

    // 2. Scan and redact sensitive data
    let warning: string | undefined;
    let safeSummary = input.summary;
    const detection = hasSensitiveData(safeSummary);
    if (detection.detected) {
      warning = `Data sensitif terdeteksi (${detection.matchedTypes.join(', ')}) dan telah disamarkan dengan [REDACTED].`;
      safeSummary = redactText(safeSummary).redactedText;
    }

    // 3. Build prompt and invoke AI provider
    const provider = getAIProvider();
    const prompt = buildDailyReflectionPrompt({
      ...input,
      summary: safeSummary,
    });

    const result = await provider.generateStructuredOutput({
      systemPrompt: DAILY_REFLECTION_SYSTEM_PROMPT,
      prompt,
      schema: dailyReflectionSchema,
      temperature: 0.3,
    });

    // 4. Record token usage and generation event
    await recordUsage(user.id, {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
    });

    await recordAIGeneration(user.id, {
      feature: 'daily_reflection',
      provider: result.provider,
      model: result.model,
      status: 'completed',
      resultJson: result.data,
    });

    return {
      success: true,
      data: result.data,
      warning,
    };
  } catch (err: unknown) {
    console.error('generateDailyReflectionAction error:', err);
    if (err instanceof AIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghasilkan refleksi harian.',
    };
  }
}

export interface AIUsageStats {
  usage: UsageStatus;
  preferences: UserAIPreferences;
  provider: string;
  model: string;
}

export async function getAIUsageStatsAction(): Promise<ActionResult<AIUsageStats>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    const [usage, preferences] = await Promise.all([
      checkDailyLimit(user.id),
      getUserAIPreferences(user.id),
    ]);

    return {
      success: true,
      data: {
        usage,
        preferences,
        provider: 'AI Cloud',
        model: 'AI Copilot',
      },
    };
  } catch (err: unknown) {
    console.error('getAIUsageStatsAction error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil statistik penggunaan AI.',
    };
  }
}

export async function updateAIPreferencesAction(
  input: Partial<UserAIPreferences>,
): Promise<ActionResult<UserAIPreferences>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    await updateUserAIPreferences(user.id, input);
    const updated = await getUserAIPreferences(user.id);

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error('updateAIPreferencesAction error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal memperbarui preferensi AI.',
    };
  }
}

export async function clearAIHistoryAction(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Kamu harus masuk terlebih dahulu.' };
    }

    await clearUserAIHistory(user.id);

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error('clearAIHistoryAction error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus riwayat AI.',
    };
  }
}





