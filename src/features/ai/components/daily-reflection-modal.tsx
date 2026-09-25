'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Compass,
  Loader2,
  Check,
  Copy,
  HeartHandshake,
  Scale,
  Brain,
  Forward,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ListTodo,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  generateDailyReflectionAction,
  getTodayReflectionContextAction,
  type TodayReflectionContext,
} from '../actions/ai-actions';
import type { DailyReflection } from '@/server/ai/prompts/daily-reflection';

interface DailyReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  summary?: string;
  learnings?: string;
  blockers?: string;
  activities?: string;
  onApplyReflection?: (reflection: DailyReflection) => void;
}

export function DailyReflectionModal({
  open,
  onOpenChange,
  date,
  summary: propSummary = '',
  learnings: propLearnings,
  blockers: propBlockers,
  activities: propActivities,
  onApplyReflection,
}: DailyReflectionModalProps) {
  const [isFetchingContext, setIsFetchingContext] = React.useState(false);
  const [context, setContext] = React.useState<TodayReflectionContext | null>(null);
  const [userNotes, setUserNotes] = React.useState<string>('');
  const [isGenerating, startGenerating] = React.useTransition();
  const [reflection, setReflection] = React.useState<DailyReflection | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReflection(null);
      setUserNotes('');
      setWarningMessage(null);
    } else {
      setIsFetchingContext(true);
    }
    onOpenChange(newOpen);
  };

  // Fetch today's data when modal opens
  React.useEffect(() => {
    let ignore = false;
    if (open) {
      getTodayReflectionContextAction(date)
        .then((res) => {
          if (!ignore && res.success && res.data) {
            setContext(res.data);
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsFetchingContext(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [open, date]);

  // Determine what data to send to AI
  const hasJournalData = Boolean(
    propSummary?.trim() ||
      propActivities?.trim() ||
      context?.hasJournal ||
      (context?.journal?.summary && context.journal.summary.trim()),
  );

  const effectiveSummary =
    propSummary?.trim() ||
    context?.journal?.summary?.trim() ||
    (context?.tasksDone && context.tasksDone.length > 0
      ? `Menyelesaikan tugas: ${context.tasksDone.join(', ')}`
      : '') ||
    userNotes.trim();

  const effectiveActivities =
    propActivities?.trim() ||
    context?.journal?.activities?.trim() ||
    (context?.tasksDone && context.tasksDone.length > 0
      ? context.tasksDone.map((t) => `- ${t}`).join('\n')
      : undefined);

  const effectiveLearnings =
    propLearnings?.trim() || context?.journal?.learnings?.trim() || undefined;

  const effectiveBlockers =
    propBlockers?.trim() || context?.journal?.blockers?.trim() || undefined;

  const effectiveTasksDone = context?.tasksDone || [];
  const effectiveTasksInProgress = context?.tasksInProgress || [];
  const effectiveAttendance = context?.attendanceInfo;

  const canGenerate = Boolean(
    effectiveSummary.trim() ||
      (effectiveActivities && effectiveActivities.trim()) ||
      userNotes.trim() ||
      effectiveTasksDone.length > 0,
  );

  const handleGenerate = () => {
    const summaryText =
      effectiveSummary.trim() ||
      (userNotes.trim()
        ? userNotes.trim()
        : 'Menjalankan aktivitas magang dan to-do list harian.');

    startGenerating(async () => {
      const res = await generateDailyReflectionAction({
        date,
        summary: summaryText,
        activities: effectiveActivities,
        learnings: effectiveLearnings,
        blockers: effectiveBlockers,
        tasksDone: effectiveTasksDone,
        tasksInProgress: effectiveTasksInProgress,
        attendanceInfo: effectiveAttendance,
        userNotes: userNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        setReflection(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Refleksi harian berhasil disusun dari data hari ini!');
      } else {
        toast.error(res.error || 'Gagal menyusun refleksi.');
      }
    });
  };

  const handleApplyClick = () => {
    if (!reflection) return;
    if (onApplyReflection) {
      onApplyReflection(reflection);
      toast.success('Hasil refleksi diterapkan ke jurnal!');
    }
    onOpenChange(false);
  };

  const handleCopyAll = async () => {
    if (!reflection) return;
    const formatted = [
      `=== REFLEKSI HARIAN GIBBS (${date}) ===`,
      `1. Apa yang Terjadi (Deskripsi):`,
      reflection.description,
      ``,
      `2. Tantangan & Dinamika Emosional:`,
      reflection.feelingsAndChallenges,
      ``,
      `3. Evaluasi (Keberhasilan vs Peningkatan):`,
      reflection.evaluation,
      ``,
      `4. Analisis & Pembelajaran Mendalam:`,
      reflection.analysis,
      ``,
      `5. Rencana Aksi (Besok):`,
      reflection.actionPlan,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      toast.success('Seluruh refleksi berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin refleksi.');
    }
  };

  const handleReset = () => {
    setReflection(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card text-card-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#BCE8D3] dark:bg-[#1A3329] text-[#163A2B] dark:text-[#34D399] shadow-2xs shrink-0">
              <Compass className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  Refleksi Harian (Gibbs Cycle)
                </DialogTitle>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Otomatis dari Data Hari Ini
                </span>
              </div>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                AI mengumpulkan aktivitas jurnal, to-do list, dan presensi tanggal {date} untuk menyusun evaluasi diri yang nyata.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {warningMessage && (
          <div className="rounded-[18px] bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/25 dark:border-amber-700/40 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">{warningMessage}</span>
          </div>
        )}

        {isFetchingContext ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs font-bold text-foreground">
              Mengumpulkan data aktivitas, to-do list, & presensi hari ini...
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#BCE8D3] dark:bg-[#1A3329] text-[#163A2B] dark:text-[#34D399]">
              <Loader2 className="size-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-foreground">
              Menyusun refleksi Gibbs dari progres hari ini...
            </p>
            <p className="text-[11px] text-muted-foreground">
              Menganalisis pencapaian tugas, kendala teknis, dan rencana perbaikan.
            </p>
          </div>
        ) : !reflection ? (
          <div className="space-y-4 py-2">
            {/* Detected Context Summary Pill Boxes */}
            <div className="rounded-[22px] border border-border bg-secondary/30 p-4 space-y-3 shadow-2xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground font-mono block">
                Ringkasan Data Hari Ini ({date})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 1. Jurnal */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <BookOpen className="size-3.5 text-primary" />
                    <span>Jurnal</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {hasJournalData
                      ? 'Tersedia catatan aktivitas & hasil'
                      : 'Belum ada draf jurnal'}
                  </p>
                </div>

                {/* 2. Tasks / To-Do List */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <ListTodo className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>To-Do List</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {effectiveTasksDone.length > 0 || effectiveTasksInProgress.length > 0
                      ? `${effectiveTasksDone.length} selesai, ${effectiveTasksInProgress.length} proses`
                      : 'Belum ada tugas hari ini'}
                  </p>
                </div>

                {/* 3. Presensi */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Presensi</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight truncate">
                    {effectiveAttendance || 'Belum ada log presensi'}
                  </p>
                </div>
              </div>

              {/* Notice if no data found */}
              {!canGenerate && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                  <Info className="size-4 shrink-0" />
                  <span>
                    Belum ada jurnal atau to-do list tersimpan untuk hari ini. Kamu bisa menuliskan catatan singkat di bawah agar AI bisa merefleksikannya.
                  </span>
                </div>
              )}
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1.5">
              <Label htmlFor="reflection-notes" className="text-xs font-bold text-foreground">
                Catatan Tambahan / Perasaanmu Hari Ini (Opsional)
              </Label>
              <textarea
                id="reflection-notes"
                rows={3}
                placeholder="Ada hal yang bikin senang, bingung, atau unek-unek yang ingin dimasukkan ke refleksi? (Opsional, AI sudah membaca jurnal & tugasmu secara otomatis)..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full rounded-[18px] border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all leading-relaxed"
              />
            </div>

            {/* Action Trigger */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                <Sparkles className="size-3.5" />
                <span>Susun Refleksi Otomatis</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 py-2 text-xs">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                Hasil Siklus Refleksi Gibbs ({date})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Ubah / Generate Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-600 stroke-[2.5]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Salin Semua</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 1. Description */}
            <div className="rounded-[22px] border border-border bg-card p-4.5 space-y-1.5 shadow-2xs">
              <span className="font-extrabold text-foreground block text-xs">
                1. Apa yang Terjadi Hari Ini (Deskripsi Objektif):
              </span>
              <p className="text-muted-foreground leading-relaxed font-medium">{reflection.description}</p>
            </div>

            {/* 2. Feelings & Challenges */}
            <div className="rounded-[22px] border border-[#EEA472] dark:border-[#5C2B0B] bg-[#F8C39E]/30 dark:bg-[#2F1505] p-4.5 space-y-1.5 text-[#4A240E] dark:text-[#FED7AA] shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <HeartHandshake className="size-4 text-[#4A240E] dark:text-[#FED7AA]" /> 2. Tantangan & Dinamika Emosional:
              </span>
              <p className="leading-relaxed font-medium">{reflection.feelingsAndChallenges}</p>
            </div>

            {/* 3. Evaluation */}
            <div className="rounded-[22px] border border-[#ECCF69] dark:border-[#524410] bg-[#FBE892]/40 dark:bg-[#282208] p-4.5 space-y-1.5 text-[#3E340D] dark:text-[#FDE047] shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <Scale className="size-4 text-[#3E340D] dark:text-[#FDE047]" /> 3. Evaluasi (Keberhasilan vs Hal yang Perlu Ditingkatkan):
              </span>
              <p className="leading-relaxed font-medium">{reflection.evaluation}</p>
            </div>

            {/* 4. Analysis & Insights */}
            <div className="rounded-[22px] border border-[#C6B8F5] dark:border-[#382B5E] bg-[#DED8FA]/40 dark:bg-[#1C1530] p-4.5 space-y-1.5 text-[#2B1E4A] dark:text-[#DDD6FE] shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <Brain className="size-4 text-[#2B1E4A] dark:text-[#DDD6FE]" /> 4. Analisis & Pembelajaran Mendalam:
              </span>
              <p className="leading-relaxed font-medium">{reflection.analysis}</p>
            </div>

            {/* 5. Action Plan */}
            <div className="rounded-[22px] border border-[#98D8BA] dark:border-[#1A3D2D] bg-[#BCE8D3]/40 dark:bg-[#0F241A] p-4.5 space-y-1.5 text-[#163A2B] dark:text-[#9FE3C3] shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <Forward className="size-4 text-[#163A2B] dark:text-[#9FE3C3]" /> 5. Rencana Aksi Konkret (Besok):
              </span>
              <p className="leading-relaxed font-medium">
                {reflection.actionPlan}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border pt-4 mt-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            Tutup
          </button>

          {reflection && onApplyReflection && (
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-xs"
            >
              <Check className="size-3.5 stroke-[2.5]" />
              <span>Terapkan ke Jurnal</span>
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
