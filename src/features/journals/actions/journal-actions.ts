'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  journalFormSchema,
  type JournalFormInput,
} from '../schemas/journal-schema';

export interface JournalRecord {
  id: string;
  user_id: string;
  internship_id: string;
  journal_date: string;
  title: string | null;
  summary: string;
  activities: string | null;
  learnings: string | null;
  blockers: string | null;
  solutions: string | null;
  next_plan: string | null;
  status: 'draft' | 'completed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  journal_tasks?: Array<{
    task_id: string;
    tasks: {
      id: string;
      title: string;
      status: string;
    } | null;
  }>;
}

export type JournalActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

async function getActiveInternshipId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('internships')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return data?.id || null;
}

export async function getJournals(limit = 30): Promise<JournalRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return [];

  const { data, error } = await supabase
    .from('journals')
    .select('*, journal_tasks(task_id, tasks(id, title, status))')
    .eq('internship_id', internshipId)
    .order('journal_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching journals:', error);
    return [];
  }

  return (data as unknown as JournalRecord[]) || [];
}

export async function getJournalByDate(date: string): Promise<JournalRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return null;

  const { data, error } = await supabase
    .from('journals')
    .select('*, journal_tasks(task_id, tasks(id, title, status))')
    .eq('internship_id', internshipId)
    .eq('journal_date', date)
    .maybeSingle();

  if (error) {
    console.error('Error fetching journal by date:', error);
    return null;
  }

  return data;
}

export async function saveJournal(
  input: JournalFormInput,
): Promise<JournalActionResult> {
  const parsed = journalFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input jurnal tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return { success: false, error: 'Belum ada program magang aktif.' };

  const isCompleted = parsed.data.status === 'completed';
  const completedAt = isCompleted ? new Date().toISOString() : null;

  const { data: journal, error } = await supabase
    .from('journals')
    .upsert(
      {
        id: parsed.data.id || undefined,
        user_id: user.id,
        internship_id: internshipId,
        journal_date: parsed.data.journalDate,
        title: parsed.data.title || null,
        summary: parsed.data.summary,
        activities: parsed.data.activities || null,
        learnings: parsed.data.learnings || null,
        blockers: parsed.data.blockers || null,
        solutions: parsed.data.solutions || null,
        next_plan: parsed.data.nextPlan || null,
        status: parsed.data.status,
        completed_at: completedAt,
      },
      {
        onConflict: 'internship_id,journal_date',
      },
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Manage journal_tasks junction table
  if (journal?.id && parsed.data.taskIds !== undefined) {
    // Delete existing links
    await supabase.from('journal_tasks').delete().eq('journal_id', journal.id);

    // Insert new links
    if (parsed.data.taskIds.length > 0) {
      const links = parsed.data.taskIds.map((taskId) => ({
        user_id: user.id,
        journal_id: journal.id,
        task_id: taskId,
      }));
      await supabase.from('journal_tasks').insert(links);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/journals');

  return {
    success: true,
    message: isCompleted
      ? 'Jurnal hari ini telah berhasil diselesaikan!'
      : 'Jurnal tersimpan sebagai draft.',
    data: journal,
  };
}

export async function deleteJournal(id: string): Promise<JournalActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('journals').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/journals');

  return {
    success: true,
    message: 'Jurnal berhasil dihapus.',
  };
}
