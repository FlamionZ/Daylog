'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  learningFormSchema,
  type LearningFormInput,
} from '../schemas/learning-schema';

export interface LearningRecord {
  id: string;
  user_id: string;
  internship_id: string;
  topic: string;
  technology: string | null;
  summary: string | null;
  source_url: string | null;
  level: 'exploring' | 'learning' | 'practicing' | 'confident';
  learned_on: string;
  journal_id: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export type LearningActionResult = {
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

export async function getLearnings(filter?: {
  technology?: string;
  level?: string;
  search?: string;
}): Promise<LearningRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return [];

  let query = supabase
    .from('learnings')
    .select('*')
    .eq('internship_id', internshipId)
    .order('learned_on', { ascending: false });

  if (filter?.technology && filter.technology !== 'all') {
    query = query.ilike('technology', `%${filter.technology}%`);
  }

  if (filter?.level && filter.level !== 'all') {
    query = query.eq('level', filter.level);
  }

  if (filter?.search) {
    query = query.or(`topic.ilike.%${filter.search}%,summary.ilike.%${filter.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching learnings:', error);
    return [];
  }

  return data || [];
}

export async function createLearning(
  input: LearningFormInput,
): Promise<LearningActionResult> {
  const parsed = learningFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input pembelajaran tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return { success: false, error: 'Belum ada program magang aktif.' };

  const { data, error } = await supabase
    .from('learnings')
    .insert({
      user_id: user.id,
      internship_id: internshipId,
      topic: parsed.data.topic,
      technology: parsed.data.technology || null,
      summary: parsed.data.summary || null,
      source_url: parsed.data.sourceUrl || null,
      level: parsed.data.level,
      learned_on: parsed.data.learnedOn,
      journal_id: parsed.data.journalId || null,
      task_id: parsed.data.taskId || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/learnings');

  return {
    success: true,
    message: 'Catatan pembelajaran berhasil disimpan.',
    data,
  };
}

export async function updateLearning(
  id: string,
  input: LearningFormInput,
): Promise<LearningActionResult> {
  const parsed = learningFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input pembelajaran tidak valid',
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('learnings')
    .update({
      topic: parsed.data.topic,
      technology: parsed.data.technology || null,
      summary: parsed.data.summary || null,
      source_url: parsed.data.sourceUrl || null,
      level: parsed.data.level,
      learned_on: parsed.data.learnedOn,
      journal_id: parsed.data.journalId || null,
      task_id: parsed.data.taskId || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/learnings');

  return {
    success: true,
    message: 'Catatan pembelajaran berhasil diperbarui.',
    data,
  };
}

export async function deleteLearning(id: string): Promise<LearningActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('learnings').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/learnings');

  return {
    success: true,
    message: 'Catatan pembelajaran berhasil dihapus.',
  };
}
