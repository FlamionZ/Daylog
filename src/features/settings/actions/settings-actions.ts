'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  profileSettingsSchema,
  internshipSettingsSchema,
  type ProfileSettingsInput,
  type InternshipSettingsInput,
} from '../schemas/settings-schema';

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  timezone: string;
}

export interface InternshipData {
  id: string;
  companyName: string;
  roleTitle: string;
  location: string | null;
  mentorName: string | null;
  mentorContact: string | null;
  startDate: string;
  endDate: string;
  defaultStartTime: string | null;
  defaultEndTime: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface SettingsData {
  profile: UserProfileData | null;
  internship: InternshipData | null;
}

export type SettingsActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function getSettingsData(): Promise<SettingsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, internship: null };
  }

  const [profileRes, internshipRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('internships')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const profile: UserProfileData = {
    id: user.id,
    email: user.email || '',
    fullName:
      profileRes.data?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Peserta Magang',
    timezone: profileRes.data?.timezone || 'Asia/Jakarta',
  };

  let internship: InternshipData | null = null;
  if (internshipRes.data) {
    const d = internshipRes.data;
    internship = {
      id: d.id,
      companyName: d.company_name,
      roleTitle: d.role_title,
      location: d.location,
      mentorName: d.mentor_name,
      mentorContact: d.mentor_contact,
      startDate: d.start_date,
      endDate: d.end_date,
      defaultStartTime: d.default_start_time,
      defaultEndTime: d.default_end_time,
      notes: d.notes,
      isActive: d.is_active,
    };
  }

  return { profile, internship };
}

export async function updateProfile(
  input: ProfileSettingsInput,
): Promise<SettingsActionResult> {
  const parsed = profileSettingsSchema.safeParse(input);
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

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      full_name: parsed.data.fullName,
      timezone: parsed.data.timezone || 'Asia/Jakarta',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Profil berhasil diperbarui.',
  };
}

export async function saveInternship(
  input: InternshipSettingsInput,
  id?: string,
): Promise<SettingsActionResult> {
  const parsed = internshipSettingsSchema.safeParse(input);
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

  // Format default start & end time cleanly for PostgreSQL time type
  const defaultStartTime = parsed.data.defaultStartTime
    ? parsed.data.defaultStartTime.length === 5
      ? `${parsed.data.defaultStartTime}:00`
      : parsed.data.defaultStartTime
    : '08:00:00';

  const defaultEndTime = parsed.data.defaultEndTime
    ? parsed.data.defaultEndTime.length === 5
      ? `${parsed.data.defaultEndTime}:00`
      : parsed.data.defaultEndTime
    : '17:00:00';

  if (id) {
    const { error } = await supabase
      .from('internships')
      .update({
        company_name: parsed.data.companyName,
        role_title: parsed.data.roleTitle,
        location: parsed.data.location || null,
        mentor_name: parsed.data.mentorName || null,
        mentor_contact: parsed.data.mentorContact || null,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        default_start_time: defaultStartTime,
        default_end_time: defaultEndTime,
        notes: parsed.data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  } else {
    // Ensure profile exists for the user
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from('profiles').insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna',
        timezone: 'Asia/Jakarta',
      });
    }

    // Deactivate any existing active internship first
    await supabase
      .from('internships')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { error } = await supabase.from('internships').insert({
      user_id: user.id,
      company_name: parsed.data.companyName,
      role_title: parsed.data.roleTitle,
      location: parsed.data.location || null,
      mentor_name: parsed.data.mentorName || null,
      mentor_contact: parsed.data.mentorContact || null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      default_start_time: defaultStartTime,
      default_end_time: defaultEndTime,
      notes: parsed.data.notes || null,
      is_active: true,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/attendance');
  revalidatePath('/journals');

  return {
    success: true,
    message: id
      ? 'Informasi magang berhasil diperbarui.'
      : 'Program magang berhasil disimpan.',
  };
}

export async function updateInternship(
  id: string,
  input: InternshipSettingsInput,
): Promise<SettingsActionResult> {
  return saveInternship(input, id);
}

