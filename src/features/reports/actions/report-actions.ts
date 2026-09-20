'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { nowInJakarta, calculateWorkedMinutes, formatDuration, formatDate } from '@/lib/date';
import {
  reportFormSchema,
  type ReportFormInput,
} from '../schemas/report-schema';

export interface ReportStatistics {
  workingDays?: number;
  workedMinutes?: number;
  completedTasks?: number;
  completedJournals?: number;
  learningsCount?: number;
  [key: string]: unknown;
}

export interface ReportRecord {
  id: string;
  user_id: string;
  internship_id: string;
  report_type: 'weekly' | 'monthly' | 'final' | 'custom';
  period_start: string;
  period_end: string;
  title: string;
  content_markdown: string;
  source_snapshot: Record<string, unknown>;
  statistics: ReportStatistics;
  status: 'draft' | 'final';
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

async function getActiveInternship(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('internships')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return data || null;
}

export async function getReports(filter?: {
  type?: string;
  status?: string;
}): Promise<ReportRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internship = await getActiveInternship(supabase, user.id);
  if (!internship) return [];

  let query = supabase
    .from('reports')
    .select('*')
    .eq('internship_id', internship.id)
    .order('period_end', { ascending: false });

  if (filter?.type && filter.type !== 'all') {
    query = query.eq('report_type', filter.type);
  }

  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return (data as unknown as ReportRecord[]) || [];
}

export async function getReportById(id: string): Promise<ReportRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching report by id:', error);
    return null;
  }

  return (data as unknown as ReportRecord) || null;
}

export async function aggregateReportData(
  startDate: string,
  endDate: string,
  reportType: 'weekly' | 'monthly' | 'final' | 'custom' = 'weekly',
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const internship = await getActiveInternship(supabase, user.id);
  if (!internship) return null;

  // 1. Fetch attendance records in period
  const { data: attendanceData } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('internship_id', internship.id)
    .gte('work_date', startDate)
    .lte('work_date', endDate)
    .order('work_date', { ascending: true });

  // 2. Fetch journals in period
  const { data: journalsData } = await supabase
    .from('journals')
    .select('*')
    .eq('internship_id', internship.id)
    .gte('journal_date', startDate)
    .lte('journal_date', endDate)
    .order('journal_date', { ascending: true });

  // 3. Fetch tasks completed in period
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*, task_links(*)')
    .eq('internship_id', internship.id)
    .order('created_at', { ascending: true });

  // Filter tasks completed or worked on
  const relevantTasks = (tasksData || []).filter((t) => {
    if (t.completed_at) {
      const compDate = t.completed_at.slice(0, 10);
      return compDate >= startDate && compDate <= endDate;
    }
    return t.status === 'in_progress' || t.status === 'review';
  });

  // 4. Fetch learnings in period
  const { data: learningsData } = await supabase
    .from('learnings')
    .select('*')
    .eq('internship_id', internship.id)
    .gte('learned_on', startDate)
    .lte('learned_on', endDate)
    .order('learned_on', { ascending: true });

  // Calculate statistics
  const attendances = attendanceData || [];
  const journals = journalsData || [];
  const learnings = learningsData || [];

  let totalWorkedMinutes = 0;
  let workingDays = 0;

  for (const att of attendances) {
    if (['wfo', 'wfh', 'hybrid'].includes(att.work_mode)) {
      workingDays++;
      if (att.check_in_at && att.check_out_at) {
        totalWorkedMinutes += calculateWorkedMinutes(
          new Date(att.check_in_at),
          new Date(att.check_out_at),
          att.break_minutes || 0,
        );
      }
    }
  }

  const completedTasks = relevantTasks.filter((t) => t.status === 'done').length;
  const completedJournals = journals.filter((j) => j.status === 'completed').length;

  const statistics: ReportStatistics = {
    workingDays,
    workedMinutes: totalWorkedMinutes,
    completedTasks,
    completedJournals,
    learningsCount: learnings.length,
  };

  const formattedWorkedHours = formatDuration(totalWorkedMinutes);

  // Generate structured markdown template pre-filled with activities
  const typeLabel =
    reportType === 'weekly'
      ? 'Laporan Mingguan'
      : reportType === 'monthly'
        ? 'Laporan Bulanan'
        : 'Laporan Akhir';

  const defaultTitle = `${typeLabel} (${formatDate(startDate, 'd MMM')} - ${formatDate(endDate, 'd MMM yyyy')})`;

  let markdown = `# ${defaultTitle}\n\n`;
  markdown += `**Nama Mahasiswa / Intern:** ${user.user_metadata?.full_name || 'Intern'}\n`;
  markdown += `**Posisi:** ${internship.role_title} · **Instansi:** ${internship.company_name}\n`;
  markdown += `**Periode:** ${formatDate(startDate, 'd MMMM yyyy')} s.d. ${formatDate(endDate, 'd MMMM yyyy')}\n\n`;
  markdown += `---\n\n`;

  markdown += `## I. Ringkasan Eksekutif & Statistik\n\n`;
  markdown += `- **Hari Kehadiran:** ${workingDays} hari kerja\n`;
  markdown += `- **Total Jam Kerja Bersih:** ${formattedWorkedHours}\n`;
  markdown += `- **Jurnal Harian Terselesaikan:** ${completedJournals} hari\n`;
  markdown += `- **Tugas Diselesaikan:** ${completedTasks} tugas\n`;
  markdown += `- **Materi Pembelajaran Terdokumentasi:** ${learnings.length} topik\n\n`;

  markdown += `## II. Rincian Kegiatan yang Dilakukan\n\n`;
  if (journals.length > 0) {
    for (const j of journals) {
      markdown += `### ${formatDate(j.journal_date, 'EEEE, d MMMM yyyy')}\n`;
      if (j.title) markdown += `**${j.title}**\n\n`;
      markdown += `${j.summary}\n\n`;
      if (j.activities) {
        markdown += `*Aktivitas Utama:*\n${j.activities}\n\n`;
      }
    }
  } else {
    markdown += `*Belum ada entri jurnal harian yang tercatat pada periode ini.*\n\n`;
  }

  markdown += `## III. Capaian Tugas & Hasil Kerja (Deliverables)\n\n`;
  if (relevantTasks.length > 0) {
    for (const t of relevantTasks) {
      const statusText = t.status === 'done' ? '[SELESAI]' : `[${t.status.toUpperCase()}]`;
      markdown += `- ${statusText} **${t.title}** (Prioritas: ${t.priority})\n`;
      if (t.description) {
        markdown += `  - *Keterangan:* ${t.description}\n`;
      }
      if (t.task_links && t.task_links.length > 0) {
        for (const link of t.task_links) {
          markdown += `  - *Tautan:* [${link.label || link.link_type}](${link.url})\n`;
        }
      }
    }
    markdown += `\n`;
  } else {
    markdown += `*Tidak ada tugas yang ditutup pada periode ini.*\n\n`;
  }

  markdown += `## IV. Pembelajaran & Penguasaan Kompetensi\n\n`;
  if (learnings.length > 0) {
    for (const l of learnings) {
      markdown += `- **${l.topic}** (${l.level.toUpperCase()})\n`;
      if (l.technology) markdown += `  - *Teknologi:* ${l.technology}\n`;
      if (l.summary) markdown += `  - *Catatan:* ${l.summary}\n`;
    }
    markdown += `\n`;
  } else {
    markdown += `*Belum ada catatan pembelajaran khusus pada periode ini.*\n\n`;
  }

  markdown += `## V. Kendala yang Dihadapi & Solusi\n\n`;
  const blockersJournals = journals.filter((j) => j.blockers || j.solutions);
  if (blockersJournals.length > 0) {
    for (const bj of blockersJournals) {
      markdown += `### ${formatDate(bj.journal_date, 'd MMMM yyyy')}\n`;
      if (bj.blockers) markdown += `- **Kendala:** ${bj.blockers}\n`;
      if (bj.solutions) markdown += `- **Solusi / Tindak Lanjut:** ${bj.solutions}\n`;
      markdown += `\n`;
    }
  } else {
    markdown += `*Selama periode ini aktivitas berjalan lancar tanpa kendala operasional yang signifikan.*\n\n`;
  }

  markdown += `## VI. Rencana Kerja Periode Berikutnya\n\n`;
  const latestPlan = journals.find((j) => j.next_plan)?.next_plan;
  if (latestPlan) {
    markdown += `${latestPlan}\n\n`;
  } else {
    markdown += `Melanjutkan backlog tugas dan integrasi modul sesuai target sprint program magang.\n\n`;
  }

  return {
    defaultTitle,
    markdown,
    statistics,
    sourceSnapshot: {
      attendancesCount: attendances.length,
      journalsCount: journals.length,
      tasksCount: relevantTasks.length,
      learningsCount: learnings.length,
    },
    journals,
    tasks: relevantTasks,
    learnings,
    formattedWorkedHours,
  };
}

export async function saveReport(input: ReportFormInput): Promise<ReportActionResult> {
  const parsed = reportFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input laporan tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const internship = await getActiveInternship(supabase, user.id);
  if (!internship) return { success: false, error: 'Belum ada program magang aktif.' };

  const isFinal = parsed.data.status === 'final';
  const finalizedAt = isFinal ? nowInJakarta().toISOString() : null;

  const { data, error } = await supabase
    .from('reports')
    .upsert({
      id: parsed.data.id || undefined,
      user_id: user.id,
      internship_id: internship.id,
      report_type: parsed.data.reportType,
      period_start: parsed.data.periodStart,
      period_end: parsed.data.periodEnd,
      title: parsed.data.title,
      content_markdown: parsed.data.contentMarkdown,
      status: parsed.data.status,
      finalized_at: finalizedAt,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/reports');

  return {
    success: true,
    message: isFinal
      ? 'Laporan berhasil difinalisasi dan disimpan.'
      : 'Draf laporan berhasil disimpan.',
    data,
  };
}

export async function deleteReport(id: string): Promise<ReportActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('reports').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/reports');

  return {
    success: true,
    message: 'Laporan berhasil dihapus.',
  };
}
