'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  FileText,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Send,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { FinalReportAIModal } from './final-report-ai-modal';
import type { ReportRecord } from '../actions/report-actions';

interface KemnakerCompletionHubProps {
  reports: ReportRecord[];
  activeInternship?: {
    companyName: string;
    roleTitle: string;
    startDate: string;
    endDate: string;
  } | null;
  statistics?: {
    totalJournals: number;
    completedJournals: number;
    totalAttendance: number;
    syncedAttendance: number;
    completedTasks: number;
    totalHoursFormatted: string;
  };
  onOpenReportBuilder?: (reportType: 'final') => void;
}

export function KemnakerCompletionHub({
  reports,
  activeInternship,
  statistics = {
    totalJournals: 0,
    completedJournals: 0,
    totalAttendance: 0,
    syncedAttendance: 0,
    completedTasks: 0,
    totalHoursFormatted: '0 jam',
  },
  onOpenReportBuilder,
}: KemnakerCompletionHubProps) {
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);
  const [isSubmittedToPortal, setIsSubmittedToPortal] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kemnaker_final_report_submitted') === 'true';
    }
    return false;
  });

  // Find existing final report
  const finalReport = React.useMemo(() => {
    return reports.find((r) => r.report_type === 'final');
  }, [reports]);

  // Calculate audit readiness
  const journalReady = statistics.totalJournals > 0 && statistics.completedJournals === statistics.totalJournals;
  const attendanceReady = statistics.totalAttendance > 0 && statistics.syncedAttendance === statistics.totalAttendance;
  const taskReady = statistics.completedTasks > 0;
  const reportReady = Boolean(finalReport && finalReport.status === 'final');

  const readyPoints = [journalReady, attendanceReady, taskReady, reportReady].filter(Boolean).length;
  const readinessPercentage = Math.round((readyPoints / 4) * 100);

  const handleToggleSubmitted = () => {
    const next = !isSubmittedToPortal;
    setIsSubmittedToPortal(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kemnaker_final_report_submitted', String(next));
    }
    toast.success(
      next
        ? 'Status diperbarui: Laporan Akhir telah diserahkan ke portal MagangHub.'
        : 'Status penyerahan laporan dibatalkan.',
    );
  };

  const handleCopyKemnakerFinalReport = () => {
    if (!finalReport?.content_markdown) {
      toast.error('Belum ada Laporan Akhir Magang yang disusun.', {
        description: 'Buat laporan akhir terlebih dahulu untuk menyalin format Kemnaker.',
      });
      return;
    }

    const text = [
      `LAPORAN AKHIR PROGRAM MAGANGHUB KEMNAKER RI`,
      `Peserta: Software Developer Intern`,
      `Perusahaan: ${activeInternship?.companyName || 'PT Tiga Serangkai'}`,
      `Periode: ${activeInternship?.startDate || '-'} s/d ${activeInternship?.endDate || '-'}`,
      `Total Jam Kerja: ${statistics.totalHoursFormatted}`,
      ``,
      `================================================================================`,
      finalReport.content_markdown,
      `================================================================================`,
      `Disusun untuk pemenuhan syarat kelulusan program MagangHub Kemnaker RI.`,
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Format Laporan Akhir Kemnaker berhasil disalin!', {
        description: 'Teks terstruktur siap ditempel ke formulir portal MagangHub Kemnaker.',
      });
    }
  };

  const handlePrint = () => {
    if (!finalReport) {
      toast.error('Buat draf Laporan Akhir terlebih dahulu sebelum mencetak.');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[24px] border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                <ShieldCheck className="size-4" />
              </div>
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Pusat Selesai Magang Kemnaker
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              Kesiapan Selesai Magang & Laporan Akhir
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verifikasi kelengkapan seluruh berkas magang, sintesis Laporan Akhir Magang berbasis AI, dan persiapkan berkas pengiriman untuk portal resmi MagangHub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 transition-all shadow-2xs"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Bantu AI Laporan Akhir</span>
            </button>

            <button
              type="button"
              onClick={handleCopyKemnakerFinalReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
            >
              <Copy className="size-3.5 text-blue-500" />
              <span>Salin Format Portal</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
            >
              <Printer className="size-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <a
              href="https://maganghub.kemnaker.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>Buka Portal MagangHub</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="mt-6 pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5 font-bold">
              <Award className="size-3.5 text-blue-500" /> Skor Kesiapan Penyerahan Selesai Magang
            </span>
            <span className="font-mono font-extrabold text-foreground">{readinessPercentage}% ({readyPoints}/4 Syarat)</span>
          </div>
          <Progress value={readinessPercentage} className="h-2 bg-muted/20" />
        </div>
      </div>

      {/* 4 Audit Pillars */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Jurnal Harian */}
        <div className="rounded-[20px] border border-border bg-card p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400">
              <BookOpen className="size-4" />
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold font-mono uppercase ${
                journalReady
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-muted/15 text-muted-foreground border border-border'
              }`}
            >
              {journalReady ? 'Lengkap' : 'Perlu Ditinjau'}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-foreground">1. Jurnal Harian</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {statistics.completedJournals} dari {statistics.totalJournals} jurnal selesai ({statistics.totalJournals - statistics.completedJournals} draft).
            </p>
          </div>
        </div>

        {/* 2. Ceklist Presensi Web */}
        <div className="rounded-[20px] border border-border bg-card p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <Calendar className="size-4" />
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold font-mono uppercase ${
                attendanceReady
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-border'
              }`}
            >
              {attendanceReady ? '100% Diceklis' : `${statistics.totalAttendance - statistics.syncedAttendance} Belum`}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-foreground">2. Presensi di Web Kemnaker</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {statistics.syncedAttendance} dari {statistics.totalAttendance} presensi telah diceklis di web.
            </p>
          </div>
        </div>

        {/* 3. Deliverables Proyek */}
        <div className="rounded-[20px] border border-border bg-card p-4.5 space-y-2 shadow-2xs">
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Layers className="size-4" />
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold font-mono uppercase ${
              taskReady
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-muted/15 text-muted-foreground border border-border'
            }`}
          >
            {taskReady ? `${statistics.completedTasks} Tugas` : 'Belum Ada'}
          </span>
          <div>
            <h4 className="text-xs font-extrabold text-foreground">3. Deliverables & Proyek</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Tugas selesai dengan bukti implementasi modul dan pull request.
            </p>
          </div>
        </div>

        {/* 4. Dokumen Laporan Akhir */}
        <div className="rounded-[20px] border border-border bg-card p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-orange-400">
              <FileText className="size-4" />
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold font-mono uppercase ${
                reportReady
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-muted/15 text-muted-foreground border border-border'
              }`}
            >
              {reportReady ? 'Final Siap Kirim' : finalReport ? 'Draf Ada' : 'Belum Dibuat'}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-foreground">4. Laporan Akhir Magang</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {finalReport ? `Versi: ${finalReport.title}` : 'Gunakan asisten AI untuk menyintesis draf awal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Submission Status Tracker Card */}
      <div className="rounded-[24px] border border-border bg-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            <h4 className="text-sm font-extrabold text-foreground">
              Status Pengiriman ke Portal MagangHub
            </h4>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase ${
                isSubmittedToPortal
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-muted/15 text-muted-foreground border border-border'
              }`}
            >
              {isSubmittedToPortal ? 'Terkirim ke Kemnaker' : 'Menunggu Pengiriman'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Setelah mengunggah laporan akhir di portal resmi, tandai status di sini agar tercatat dalam riwayat administrasi magangmu.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleSubmitted}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
              isSubmittedToPortal
                ? 'border border-border bg-surface text-foreground hover:bg-muted/15'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isSubmittedToPortal ? 'Batalkan Status Terkirim' : 'Tandai Telah Dikirim ke Portal'}
          </button>

          {onOpenReportBuilder && (
            <button
              type="button"
              onClick={() => onOpenReportBuilder('final')}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
            >
              {finalReport ? 'Edit Laporan Akhir' : 'Tulis Laporan Akhir'}
            </button>
          )}
        </div>
      </div>

      {/* Printable Document View (Clean A4 layout when window.print() is called) */}
      {finalReport && (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4 print:border-none print:shadow-none print:p-0">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Pratinjau Dokumen Laporan Akhir (Siap Cetak / Unggah)
              </h3>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              Terakhir diperbarui: {new Date(finalReport.updated_at).toLocaleDateString('id-ID')}
            </span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none font-sans leading-relaxed text-foreground space-y-4">
            <div className="border-b-2 border-foreground/20 pb-4 text-center space-y-1">
              <h1 className="text-lg font-bold uppercase tracking-tight text-foreground m-0">
                LAPORAN AKHIR PELAKSANAAN MAGANG
              </h1>
              <p className="text-xs text-muted-foreground m-0">
                Program MagangHub Kementerian Ketenagakerjaan Republik Indonesia
              </p>
              <p className="text-xs font-semibold text-foreground m-0">
                {activeInternship?.companyName || 'PT Tiga Serangkai'} — Surakarta
              </p>
            </div>

            <div className="whitespace-pre-wrap text-xs text-foreground/90 font-mono leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/60">
              {finalReport.content_markdown}
            </div>

            {/* Signature Block for Mentor */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs border-t border-border/60 print:block">
              <div>
                <p className="text-muted-foreground mb-16">Peserta Magang,</p>
                <p className="font-bold text-foreground underline">Software Developer Intern</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-16">Pembimbing Lapangan / Mentor,</p>
                <p className="font-bold text-foreground underline">PT Tiga Serangkai</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Report AI Modal */}
      <FinalReportAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        internshipRole={activeInternship?.roleTitle || 'Software Developer Intern'}
        companyName={activeInternship?.companyName || 'PT Tiga Serangkai'}
        durationText="6 Bulan"
        totalHours={statistics.totalHoursFormatted}
        tasksCompletedSummary={`${statistics.completedTasks} tugas diselesaikan`}
        learningsSummary="Pengembangan modul frontend Next.js 16, arsitektur database Supabase, dan AI assistant"
        journalsSummary={`${statistics.completedJournals} jurnal harian tercatat`}
        onApply={() => {
          if (onOpenReportBuilder) {
            onOpenReportBuilder('final');
          }
        }}
      />
    </div>
  );
}
