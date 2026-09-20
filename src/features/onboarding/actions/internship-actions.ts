'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createInternshipSchema,
  type CreateInternshipInput,
} from '../schemas/internship-schema';

export interface InternshipRecord {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  department: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  work_mode: string;
  mentor_name: string | null;
  mentor_contact: string | null;
  created_at: string;
  updated_at: string;
}

export type InternshipActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

export async function getActiveInternship(): Promise<InternshipRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active internship:', error);
    return null;
  }

  return (data as unknown as InternshipRecord) || null;
}

export async function createInternship(
  input: CreateInternshipInput,
): Promise<InternshipActionResult> {
  const parsed = createInternshipSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Kamu harus masuk terlebih dahulu.',
    };
  }

  // Ensure profile exists for the user
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from('profiles').insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      timezone: 'Asia/Jakarta',
    });
  }

  // Deactivate any existing active internship first
  await supabase
    .from('internships')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true);

  const { data, error } = await supabase
    .from('internships')
    .insert({
      user_id: user.id,
      company_name: parsed.data.companyName,
      role_title: parsed.data.roleTitle,
      location: parsed.data.location || null,
      mentor_name: parsed.data.mentorName || null,
      mentor_contact: parsed.data.mentorContact || null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      default_start_time: parsed.data.defaultStartTime || '08:00:00',
      default_end_time: parsed.data.defaultEndTime || '17:00:00',
      notes: parsed.data.notes || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return {
    success: true,
    message: 'Data magang berhasil disimpan.',
    data,
  };
}
