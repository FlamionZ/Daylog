'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  taskFormSchema,
  taskLinkSchema,
  type TaskFormInput,
  type TaskLinkInput,
} from '../schemas/task-schema';

export interface TaskLinkRecord {
  id: string;
  user_id: string;
  task_id: string;
  link_type: 'pull_request' | 'commit' | 'documentation' | 'issue' | 'other';
  label: string | null;
  url: string;
  created_at: string;
}

export interface TaskRecord {
  id: string;
  user_id: string;
  internship_id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  estimate_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  task_links?: TaskLinkRecord[];
}

export type TaskActionResult = {
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

export async function getTasks(filter?: {
  status?: string;
  priority?: string;
  search?: string;
}): Promise<TaskRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return [];

  let query = supabase
    .from('tasks')
    .select('*, task_links(*)')
    .eq('internship_id', internshipId)
    .order('created_at', { ascending: false });

  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }

  if (filter?.priority && filter.priority !== 'all') {
    query = query.eq('priority', filter.priority);
  }

  if (filter?.search) {
    query = query.ilike('title', `%${filter.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function createTask(input: TaskFormInput): Promise<TaskActionResult> {
  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tugas tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return { success: false, error: 'Belum ada program magang aktif.' };

  const isDone = parsed.data.status === 'done';
  const completedAt = isDone ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      internship_id: internshipId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate || null,
      estimate_minutes: parsed.data.estimateMinutes || null,
      actual_minutes: parsed.data.actualMinutes || null,
      completed_at: completedAt,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/tasks');

  return {
    success: true,
    message: 'Tugas berhasil ditambahkan.',
    data,
  };
}

export async function updateTask(
  id: string,
  input: TaskFormInput,
): Promise<TaskActionResult> {
  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tugas tidak valid',
    };
  }

  const supabase = await createClient();
  const isDone = parsed.data.status === 'done';

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate || null,
      estimate_minutes: parsed.data.estimateMinutes || null,
      actual_minutes: parsed.data.actualMinutes || null,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/tasks');

  return {
    success: true,
    message: 'Tugas berhasil diperbarui.',
    data,
  };
}

export async function updateTaskStatus(
  id: string,
  status: string,
): Promise<TaskActionResult> {
  const supabase = await createClient();
  const isDone = status === 'done';

  const { error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/tasks');

  return { success: true };
}

export async function deleteTask(id: string): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/tasks');

  return {
    success: true,
    message: 'Tugas berhasil dihapus.',
  };
}

export async function addTaskLink(input: TaskLinkInput): Promise<TaskActionResult> {
  const parsed = taskLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input link tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const { data, error } = await supabase
    .from('task_links')
    .insert({
      user_id: user.id,
      task_id: parsed.data.taskId,
      link_type: parsed.data.linkType,
      label: parsed.data.label || null,
      url: parsed.data.url,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/tasks');

  return {
    success: true,
    message: 'Link berhasil ditambahkan ke tugas.',
    data,
  };
}

export async function deleteTaskLink(linkId: string): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('task_links').delete().eq('id', linkId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/tasks');

  return {
    success: true,
    message: 'Link berhasil dihapus.',
  };
}
