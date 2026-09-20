'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  AlertCircle,
  Compass,
  ListTodo,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { JournalAIModal } from './journal-ai-modal';
import { BlockerAdvisorModal } from './blocker-advisor-modal';
import { DailyReflectionModal } from './daily-reflection-modal';
import { TaskExtractionModal } from './task-extraction-modal';
import { LearningExtractionModal } from './learning-extraction-modal';
import { todayInJakarta } from '@/lib/date';
import type { AIUsageStats } from '../actions/ai-actions';

interface AIHubViewProps {
  initialStats?: AIUsageStats | null;
}

export function AIHubView({ initialStats }: AIHubViewProps) {
  const [journalModalOpen, setJournalModalOpen] = React.useState(false);
  const [blockerModalOpen, setBlockerModalOpen] = React.useState(false);
  const [reflectionModalOpen, setReflectionModalOpen] = React.useState(false);
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [learningModalOpen, setLearningModalOpen] = React.useState(false);

  const usage = initialStats?.usage;
  const currentRequests = usage?.currentRequests ?? 0;
  const limit = usage?.limit ?? 50;
  const percentage = Math.min(100, Math.round((currentRequests / limit) * 100));

  const today = todayInJakarta();

  return (
    <div className="space-y-6">
      {/* 1. Header with Model Telemetry & Fallback Chain */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
              <Sparkles className="size-5.5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Asisten AI Copilot
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  Gemini Flash
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Copilot pribadi untuk menyusun jurnal Monev Kemnaker, memecahkan kendala teknis, dan refleksi harian.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-2xs text-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground font-mono">
              {initialStats?.model || 'gemini-3.8-flash'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-[11px] font-medium">Aktif</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <span>Fallback:</span>
            <span className="text-foreground font-semibold">3.8 → 3.7 → 3.6 → 3.5 → 3.5L → 3.1L</span>
          </div>
        </div>
      </div>

      {/* 2. Top Bento Row: Daily Quota Telemetry & Privacy Assurance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2 rounded-[28px] border border-border bg-card p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="size-3.5" />
              </div>
              <span className="text-xs font-extrabold text-foreground">Telemetri Kuota Harian</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-extrabold text-foreground">{currentRequests}</span>
              <span className="text-muted-foreground">/ {limit} requests</span>
              <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-bold text-foreground">
                {limit - currentRequests} sisa
              </span>
            </div>
          </div>

          <Progress value={percentage} className="h-2 bg-secondary" />

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground pt-1">
            <span>Reset otomatis pukul 00:00 WIB</span>
            <span>Total Token: {((usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0)).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Privacy & Redaction Card */}
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privasi & Sanitasi Data</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              API key, password, token, dan data rahasia otomatis disanitasi menjadi <code className="font-mono text-[10px] bg-secondary border border-border px-1 py-0.5 rounded text-foreground font-bold">[REDACTED]</code> sebelum diproses oleh model Gemini.
            </p>
          </div>
          <div>
            <Link
              href="/settings"
              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              Pengaturan AI & Model
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 6 VIBRANT PASTEL BENTO CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-mono">
            Katalog Alat AI Copilot
          </h2>
          <span className="rounded-full bg-card border border-border px-3 py-0.5 text-[11px] font-bold text-foreground font-mono shadow-2xs">
            6 Alat Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 01: Bantu Tulis Jurnal (Pastel Lavender) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#DED8FA] dark:bg-[#201938] p-6 text-[#2B1E4A] dark:text-[#DDD6FE] border border-[#C6B8F5] dark:border-[#3D2D68] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative sparkle SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#2B1E4A]/25 dark:text-[#DDD6FE]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#2B1E4A]/10 dark:bg-[#DDD6FE]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#2B1E4A] dark:text-[#DDD6FE] uppercase tracking-wider">
                  01 · Kemnaker 4 Poin
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#2B1E4A] dark:text-[#DDD6FE]">
                Bantu Tulis Jurnal
              </h3>
              <p className="mt-2 text-xs font-medium text-[#2B1E4A]/80 dark:text-[#DDD6FE]/80 leading-relaxed">
                Ubah catatan kasar harian menjadi 4 poin terstruktur resmi Monev Kemnaker RI (Aktivitas, Pembelajaran, Kendala/Solusi, Rencana).
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#2B1E4A]/10 dark:border-[#DDD6FE]/15">
              <button
                type="button"
                onClick={() => setJournalModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2B1E4A] dark:bg-[#DDD6FE] px-5 py-2.5 text-xs font-bold text-white dark:text-[#201938] hover:bg-[#3D2C68] dark:hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>Buka Generator Jurnal</span>
              </button>
            </div>
          </div>

          {/* 02: Diagnosis Kendala (Pastel Butter Yellow) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#FBE892] dark:bg-[#2C2408] p-6 text-[#3E340D] dark:text-[#FDE047] border border-[#ECCF69] dark:border-[#524512] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative lightning SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#3E340D]/25 dark:text-[#FDE047]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#3E340D]/10 dark:bg-[#FDE047]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#3E340D] dark:text-[#FDE047] uppercase tracking-wider">
                  02 · Debugger & Mentor
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#3E340D] dark:text-[#FDE047]">
                Diagnosis Kendala (Blocker)
              </h3>
              <p className="mt-2 text-xs font-medium text-[#3E340D]/80 dark:text-[#FDE047]/80 leading-relaxed">
                Analisis pesan error teknis, hipotesis akar masalah, langkah investigasi debugging, dan draf template tanya mentor yang sopan.
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#3E340D]/10 dark:border-[#FDE047]/15">
              <button
                type="button"
                onClick={() => setBlockerModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3E340D] dark:bg-[#FDE047] px-5 py-2.5 text-xs font-bold text-white dark:text-[#2C2408] hover:bg-[#524512] dark:hover:bg-[#FEF08A] active:scale-95 transition-all shadow-xs"
              >
                <AlertCircle className="size-3.5" />
                <span>Analisis Kendala</span>
              </button>
            </div>
          </div>

          {/* 03: Refleksi Harian (Pastel Mint Sage) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#BCE8D3] dark:bg-[#0F241A] p-6 text-[#163A2B] dark:text-[#9FE3C3] border border-[#98D8BA] dark:border-[#1B4D36] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative compass SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#163A2B]/25 dark:text-[#9FE3C3]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#163A2B]/10 dark:bg-[#9FE3C3]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#163A2B] dark:text-[#9FE3C3] uppercase tracking-wider">
                  03 · Self-Review (Gibbs)
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#163A2B] dark:text-[#9FE3C3]">
                Refleksi Harian
              </h3>
              <p className="mt-2 text-xs font-medium text-[#163A2B]/80 dark:text-[#9FE3C3]/80 leading-relaxed">
                Refleksi terstruktur Gibbs untuk mengevaluasi dinamika kerja, pengalaman belajar, dan persiapan bimbingan 1-on-1 dengan mentor.
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#163A2B]/10 dark:border-[#9FE3C3]/15">
              <button
                type="button"
                onClick={() => setReflectionModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#163A2B] dark:bg-[#9FE3C3] px-5 py-2.5 text-xs font-bold text-white dark:text-[#0F241A] hover:bg-[#235842] dark:hover:bg-[#BBF7D0] active:scale-95 transition-all shadow-xs"
              >
                <Compass className="size-3.5" />
                <span>Mulai Refleksi</span>
              </button>
            </div>
          </div>

          {/* 04: Ekstraksi Tugas (Pastel Sky Blue) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#DDE7FE] dark:bg-[#152347] p-6 text-[#1E3A8A] dark:text-[#BFDBFE] border border-[#B4CCFE] dark:border-[#223974] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative list SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#1E3A8A]/25 dark:text-[#BFDBFE]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#1E3A8A]/10 dark:bg-[#BFDBFE]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#1E3A8A] dark:text-[#BFDBFE] uppercase tracking-wider">
                  04 · Action Items
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#1E3A8A] dark:text-[#BFDBFE]">
                Ekstraksi Tugas
              </h3>
              <p className="mt-2 text-xs font-medium text-[#1E3A8A]/80 dark:text-[#BFDBFE]/80 leading-relaxed">
                Pindai catatan bebas atau aktivitas harianmu untuk secara otomatis menghasilkan kartu tugas dengan estimasi prioritas dan status.
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#1E3A8A]/10 dark:border-[#BFDBFE]/15">
              <button
                type="button"
                onClick={() => setTaskModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1E3A8A] dark:bg-[#BFDBFE] px-5 py-2.5 text-xs font-bold text-white dark:text-[#152347] hover:bg-[#2A4EA8] dark:hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <ListTodo className="size-3.5" />
                <span>Ekstrak Tugas</span>
              </button>
            </div>
          </div>

          {/* 05: Ekstraksi Pembelajaran (Pastel Soft Peach) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#F8C39E] dark:bg-[#2D1B0E] p-6 text-[#4A240E] dark:text-[#FDBA74] border border-[#F3A56D] dark:border-[#5C3318] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative cap SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#4A240E]/25 dark:text-[#FDBA74]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#4A240E]/10 dark:bg-[#FDBA74]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#4A240E] dark:text-[#FDBA74] uppercase tracking-wider">
                  05 · Skillset & Tech
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#4A240E] dark:text-[#FDBA74]">
                Ekstraksi Pembelajaran
              </h3>
              <p className="mt-2 text-xs font-medium text-[#4A240E]/80 dark:text-[#FDBA74]/80 leading-relaxed">
                Identifikasi konsep teknis, framework baru, dan tools yang telah dipelajari untuk dimasukkan ke katalog riwayat kompetensi magang.
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#4A240E]/10 dark:border-[#FDBA74]/15">
              <button
                type="button"
                onClick={() => setLearningModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#4A240E] dark:bg-[#FDBA74] px-5 py-2.5 text-xs font-bold text-white dark:text-[#2D1B0E] hover:bg-[#683515] dark:hover:bg-[#FED7AA] active:scale-95 transition-all shadow-xs"
              >
                <GraduationCap className="size-3.5" />
                <span>Ekstrak Pembelajaran</span>
              </button>
            </div>
          </div>

          {/* 06: Laporan Mingguan & Sintesis (Pastel Electric Blue) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#D0E2FF] dark:bg-[#142340] p-6 text-[#183B7A] dark:text-[#93C5FD] border border-[#A4C4FA] dark:border-[#22396E] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
            {/* Top decorative trend SVG */}
            <svg
              className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-[#183B7A]/25 dark:text-[#93C5FD]/25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#183B7A]/10 dark:bg-[#93C5FD]/15 px-3 py-1 font-mono text-[10px] font-extrabold text-[#183B7A] dark:text-[#93C5FD] uppercase tracking-wider">
                  06 · Periodic Synthesis
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-[#183B7A] dark:text-[#93C5FD]">
                Laporan & Sintesis
              </h3>
              <p className="mt-2 text-xs font-medium text-[#183B7A]/80 dark:text-[#93C5FD]/80 leading-relaxed">
                Generate draf laporan mingguan formal atau sintesis komprehensif seluruh aktivitas magang untuk keperluan evaluasi akhir.
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-[#183B7A]/10 dark:border-[#93C5FD]/15">
              <Link
                href="/reports"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#93C5FD] px-5 py-2.5 text-xs font-bold text-black dark:text-[#142340] hover:bg-black/5 dark:hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <TrendingUp className="size-3.5" />
                <span>Buka Modul Laporan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <JournalAIModal
        open={journalModalOpen}
        onOpenChange={setJournalModalOpen}
        journalDate={today}
        currentValues={{
          summary: '',
          activities: '',
          learnings: '',
          blockers: '',
          solutions: '',
          nextPlan: '',
        }}
        onApplyField={() => {}}
        onApplyAll={() => {}}
      />

      <BlockerAdvisorModal
        open={blockerModalOpen}
        onOpenChange={setBlockerModalOpen}
      />

      <DailyReflectionModal
        open={reflectionModalOpen}
        onOpenChange={setReflectionModalOpen}
        date={today}
        summary="Aktivitas magang hari ini"
      />

      <TaskExtractionModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        notes="Catatan tugas hari ini"
      />

      <LearningExtractionModal
        open={learningModalOpen}
        onOpenChange={setLearningModalOpen}
        notes="Catatan pembelajaran hari ini"
      />
    </div>
  );
}
