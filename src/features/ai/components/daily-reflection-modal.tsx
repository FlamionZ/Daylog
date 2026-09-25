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
import { generateDailyReflectionAction } from '../actions/ai-actions';
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
  learnings,
  blockers,
  activities,
  onApplyReflection,
}: DailyReflectionModalProps) {
  const [customSummary, setCustomSummary] = React.useState<string>('');
  const [isGenerating, startGenerating] = React.useTransition();
  const [reflection, setReflection] = React.useState<DailyReflection | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const effectiveSummary = customSummary.trim() || (propSummary && propSummary !== 'Aktivitas magang hari ini' ? propSummary.trim() : '');

  const handleGenerate = (textToUse?: string) => {
    const text = textToUse ?? effectiveSummary;
    if (!text.trim()) {
      toast.error('Tuliskan ringkasan aktivitas atau pengalaman yang kamu alami hari ini.');
      return;
    }

    startGenerating(async () => {
      const res = await generateDailyReflectionAction({
        date,
        summary: text.trim(),
        learnings,
        blockers,
        activities,
      });

      if (res.success && res.data) {
        setReflection(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Refleksi harian Gibbs berhasil disusun!');
      } else {
        toast.error(res.error || 'Gagal menyusun refleksi.');
      }
    });
  };

  // Auto generate if open and a real summary is provided from journal editor
  React.useEffect(() => {
    if (open && propSummary && propSummary.trim() && propSummary !== 'Aktivitas magang hari ini' && !reflection) {
      handleGenerate(propSummary);
    }
  }, [open, propSummary]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setCustomSummary('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card text-card-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#BCE8D3] dark:bg-[#1A3329] text-[#163A2B] dark:text-[#34D399] shadow-2xs shrink-0">
              <Compass className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Refleksi Harian (Gibbs Reflective Cycle)
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Panduan refleksi 5 tahap untuk mengevaluasi pengalaman nyata, dinamika emosi kerja, dan menyusun perbaikan esok hari.
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

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#BCE8D3] dark:bg-[#1A3329] text-[#163A2B] dark:text-[#34D399]">
              <Loader2 className="size-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-foreground">Menyusun refleksi mendalam dengan Asisten AI...</p>
            <p className="text-[11px] text-muted-foreground">Menganalisis dinamika aktivitas, emosi, dan rencana aksi.</p>
          </div>
        ) : !reflection ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reflection-notes" className="text-xs font-extrabold text-foreground">
                Ceritakan Singkat Pengalaman atau Aktivitas Hari Ini
              </Label>
              <textarea
                id="reflection-notes"
                rows={4}
                placeholder="Contoh: Hari ini mengerjakan modul autentikasi, sempat stuck 2 jam mencari bug token expired tapi akhirnya selesai setelah membaca dokumentasi dan diskusi dengan senior..."
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                className="w-full rounded-[18px] border border-border bg-secondary/30 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                AI akan memetakan pengalaman aslimu ke dalam 5 tahap refleksi Gibbs (fakta peristiwa, dinamika emosi, evaluasi kerja, hikmah/analisis, dan rencana aksi esok hari).
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={!effectiveSummary || isGenerating}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                <Compass className="size-3.5" />
                <span>Mulai Refleksi Gibbs</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 py-2 text-xs">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                Hasil Siklus Refleksi Gibbs
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Ubah Input</span>
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
            onClick={() => onOpenChange(false)}
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
