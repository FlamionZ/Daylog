'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { todayInJakarta, nowInJakarta } from '@/lib/date';
import {
  checkInSchema,
  checkOutSchema,
  manualAttendanceSchema,
  type CheckInInput,
  type CheckOutInput,
  type ManualAttendanceInput,
} from '../schemas/attendance-schema';
import { isKemnakerSynced } from '../utils/kemnaker-sync';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  internship_id: string;
  work_date: string;
  work_mode: string;
  check_in_at: string | null;
  check_out_at: string | null;
  break_minutes: number;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceActionResult = {
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

export async function getTodayAttendance(): Promise<AttendanceRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return null;

  const today = todayInJakarta();

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('internship_id', internshipId)
    .eq('work_date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today attendance:', error);
    return null;
  }

  return (data as unknown as AttendanceRecord) || null;
}

export async function getAttendanceList(limit = 30): Promise<AttendanceRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return [];

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('internship_id', internshipId)
    .order('work_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching attendance list:', error);
    return [];
  }

  return (data as unknown as AttendanceRecord[]) || [];
}

export async function checkIn(input: CheckInInput): Promise<AttendanceActionResult> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input check-in tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Kamu belum masuk.' };
  }

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) {
    return {
      success: false,
      error: 'Belum ada program magang yang aktif. Silakan buat profil magang terlebih dahulu.',
    };
  }

  const today = todayInJakarta();
  const isWorkMode = ['wfo', 'wfh', 'hybrid'].includes(parsed.data.workMode);
  const checkInTime = isWorkMode
    ? parsed.data.checkInAt || nowInJakarta().toISOString()
    : null;

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(
      {
        user_id: user.id,
        internship_id: internshipId,
        work_date: today,
        work_mode: parsed.data.workMode,
        check_in_at: checkInTime,
        location: parsed.data.location || null,
        notes: parsed.data.notes || null,
      },
      {
        onConflict: 'internship_id,work_date',
      },
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');

  return {
    success: true,
    message: isWorkMode
      ? 'Check-in berhasil dicatat. Semangat bekerja!'
      : 'Status kehadiran berhasil dicatat.',
    data,
  };
}

export async function checkOut(input: CheckOutInput): Promise<AttendanceActionResult> {
  const parsed = checkOutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input check-out tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Kamu belum masuk.' };
  }

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) {
    return { success: false, error: 'Belum ada program magang aktif.' };
  }

  const today = todayInJakarta();
  const checkOutTime = parsed.data.checkOutAt || nowInJakarta().toISOString();

  // Find existing record
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id, check_in_at')
    .eq('internship_id', internshipId)
    .eq('work_date', today)
    .maybeSingle();

  if (!existing || !existing.check_in_at) {
    return {
      success: false,
      error: 'Kamu belum melakukan check-in hari ini.',
    };
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .update({
      check_out_at: checkOutTime,
      break_minutes: parsed.data.breakMinutes,
      notes: parsed.data.notes || undefined,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');

  return {
    success: true,
    message: 'Check-out berhasil. Selamat beristirahat!',
    data,
  };
}

export async function saveManualAttendance(
  input: ManualAttendanceInput,
): Promise<AttendanceActionResult> {
  const parsed = manualAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Data kehadiran tidak valid',
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
    .from('attendance_records')
    .upsert(
      {
        id: parsed.data.id || undefined,
        user_id: user.id,
        internship_id: internshipId,
        work_date: parsed.data.workDate,
        work_mode: parsed.data.workMode,
        check_in_at: parsed.data.checkInAt || null,
        check_out_at: parsed.data.checkOutAt || null,
        break_minutes: parsed.data.breakMinutes,
        location: parsed.data.location || null,
        notes: parsed.data.notes || null,
      },
      {
        onConflict: 'internship_id,work_date',
      },
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');

  return {
    success: true,
    message: 'Data kehadiran berhasil disimpan.',
    data,
  };
}

export async function deleteAttendance(id: string): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('attendance_records').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');

  return {
    success: true,
    message: 'Catatan kehadiran berhasil dihapus.',
  };
}

export async function toggleKemnakerAttendanceChecklist(
  id: string,
  isChecked: boolean,
): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Kamu belum masuk.' };
  }

  const { data: record, error: fetchError } = await supabase
    .from('attendance_records')
    .select('notes')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    return { success: false, error: 'Catatan kehadiran tidak ditemukan.' };
  }

  let updatedNotes = record.notes || '';
  if (isChecked) {
    if (!updatedNotes.includes('[kemnaker_synced]')) {
      updatedNotes = updatedNotes ? `${updatedNotes.trim()} [kemnaker_synced]` : '[kemnaker_synced]';
    }
  } else {
    updatedNotes = updatedNotes.replace('[kemnaker_synced]', '').trim();
  }

  const { error: updateError } = await supabase
    .from('attendance_records')
    .update({ notes: updatedNotes || null })
    .eq('id', id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/attendance');

  return {
    success: true,
    message: isChecked
      ? 'Ditandai sudah diceklis di web Kemnaker.'
      : 'Status ceklist web Kemnaker dibatalkan.',
  };
}

export async function getKemnakerAttendanceRecap(): Promise<{
  text: string;
  totalRecords: number;
  syncedCount: number;
  unSyncedCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { text: '', totalRecords: 0, syncedCount: 0, unSyncedCount: 0 };
  }

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) {
    return { text: '', totalRecords: 0, syncedCount: 0, unSyncedCount: 0 };
  }

  // Fetch internship & profile
  const { data: internship } = await supabase
    .from('internships')
    .select('*, profiles(full_name)')
    .eq('id', internshipId)
    .single();

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('internship_id', internshipId)
    .order('work_date', { ascending: true });

  const list = (records as unknown as AttendanceRecord[]) || [];
  let syncedCount = 0;

  const lines: string[] = [
    `REKAP PRESENSI MAGANGHUB KEMNAKER`,
    `Peserta: ${internship?.profiles?.full_name || 'Peserta Magang'}`,
    `Posisi: ${internship?.role_title || 'Software Developer Intern'}`,
    `Perusahaan: ${internship?.company_name || 'PT Tiga Serangkai'}`,
    `Periode: ${internship?.start_date || '-'} s/d ${internship?.end_date || '-'}`,
    `--------------------------------------------------------------------------------`,
    `No | Tanggal    | Mode   | Check-in  | Check-out | Istirahat | Status Web Kemnaker`,
    `--------------------------------------------------------------------------------`,
  ];

  list.forEach((r, idx) => {
    const isSynced = isKemnakerSynced(r.notes);
    if (isSynced) syncedCount++;

    const checkIn = r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-';
    const checkOut = r.check_out_at ? new Date(r.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-';
    const syncStatus = isSynced ? '[✓ Diceklis]' : '[⏳ Belum Ceklist]';

    lines.push(
      `${String(idx + 1).padEnd(2)} | ${r.work_date} | ${r.work_mode.toUpperCase().padEnd(6)} | ${checkIn.padEnd(9)} | ${checkOut.padEnd(9)} | ${String(r.break_minutes || 0).padStart(2)} mnt    | ${syncStatus}`
    );
  });

  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`Total Catatan Kehadiran: ${list.length} hari`);
  lines.push(`Sudah Diceklis di Web: ${syncedCount} hari`);
  lines.push(`Belum Diceklis di Web: ${list.length - syncedCount} hari`);

  return {
    text: lines.join('\n'),
    totalRecords: list.length,
    syncedCount,
    unSyncedCount: list.length - syncedCount,
  };
}

