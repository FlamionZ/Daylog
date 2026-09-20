'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Compass,
  Loader2,
  Check,
  HeartHandshake,
  Scale,
  Brain,
  Forward,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateDailyReflectionAction } from '../actions/ai-actions';
import type { DailyReflection } from '@/server/ai/prompts/daily-reflection';

interface DailyReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  summary: string;
  learnings?: string;
  blockers?: string;
  activities?: string;
  onApplyReflection?: (reflection: DailyReflection) => void;
}

export function DailyReflectionModal({
  open,
  onOpenChange,
  date,
  summary,
  learnings,
  blockers,
  activities,
  onApplyReflection,
}: DailyReflectionModalProps) {
  const [isGenerating, startGenerating] = React.useTransition();
  const [reflection, setReflection] = React.useState<DailyReflection | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  // Auto generate if open and reflection is null
  React.useEffect(() => {
    if (open && summary.trim() && !reflection) {
      startGenerating(async () => {
        const res = await generateDailyReflectionAction({
          date,
          summary,
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
    }
  }, [open, summary, date, learnings, blockers, activities, reflection]);

  const handleApplyClick = () => {
    if (!reflection) return;
    if (onApplyReflection) {
      onApplyReflection(reflection);
      toast.success('Hasil refleksi diterapkan ke jurnal!');
    }
    onOpenChange(false);
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
                Panduan refleksi terstruktur untuk mengevaluasi pengalaman, memetik hikmah, dan merancang perbaikan esok hari.
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
            <p className="text-xs font-bold text-foreground">Menyusun refleksi mendalam dengan Gemini...</p>
            <p className="text-[11px] text-muted-foreground">Menganalisis dinamika aktivitas, emosi, dan rencana aksi.</p>
          </div>
        ) : !reflection ? (
          <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 p-10 text-center space-y-2">
            <Compass className="size-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-extrabold text-foreground">Belum ada refleksi</p>
            <p className="text-xs text-muted-foreground">
              Pastikan jurnal memiliki ringkasan aktivitas harian untuk memulai refleksi terarah.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 py-2 text-xs">
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
