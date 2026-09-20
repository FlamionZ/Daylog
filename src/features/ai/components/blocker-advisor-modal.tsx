'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Search,
  Wrench,
  HelpCircle,
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
import { Label } from '@/components/ui/label';
import { analyzeBlockerAction } from '../actions/ai-actions';
import type { BlockerAdvice } from '@/server/ai/prompts/blocker-advisor';

interface BlockerAdvisorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBlockerText?: string;
  onApplySolution?: (solution: string) => void;
}

export function BlockerAdvisorModal({
  open,
  onOpenChange,
  initialBlockerText = '',
  onApplySolution,
}: BlockerAdvisorModalProps) {
  const [userEditedBlocker, setUserEditedBlocker] = React.useState<string | null>(null);
  const [technology, setTechnology] = React.useState('');
  const [attemptedSolutions, setAttemptedSolutions] = React.useState('');
  const [isAnalyzing, startAnalyzing] = React.useTransition();
  const [advice, setAdvice] = React.useState<BlockerAdvice | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [copiedMentorText, setCopiedMentorText] = React.useState(false);

  const blockerText = userEditedBlocker ?? initialBlockerText;

  const handleAnalyze = () => {
    if (!blockerText.trim()) {
      toast.error('Jelaskan kendala atau error yang Anda temui terlebih dahulu.');
      return;
    }

    startAnalyzing(async () => {
      const res = await analyzeBlockerAction({
        blockerText: blockerText.trim(),
        technology: technology.trim() || undefined,
        attemptedSolutions: attemptedSolutions.trim() || undefined,
      });

      if (res.success && res.data) {
        setAdvice(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Diagnosis dan rekomendasi berhasil disusun!');
      } else {
        toast.error(res.error || 'Gagal menganalisis kendala.');
      }
    });
  };

  const copyMentorMessage = async () => {
    if (!advice?.howToAskMentor) return;
    try {
      await navigator.clipboard.writeText(advice.howToAskMentor);
      setCopiedMentorText(true);
      toast.success('Template pesan untuk mentor berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedMentorText(false), 2000);
    } catch {
      toast.error('Gagal menyalin teks.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border border-border bg-card text-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
              <AlertCircle className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Asisten Diagnosis Kendala (Blocker Advisor)
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                AI membantu mendiagnosis akar masalah teknis, menyarankan langkah investigasi, dan menyiapkan pesan tanya mentor.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {warningMessage && (
          <div className="rounded-[18px] bg-amber-500/10 border border-amber-500/25 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <span className="font-medium">{warningMessage}</span>
          </div>
        )}

        {!advice ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="blockerText" className="text-xs font-extrabold text-foreground">
                Deskripsi Kendala / Pesan Error
              </Label>
              <textarea
                id="blockerText"
                rows={4}
                placeholder="Contoh: Terjadi error 'PGRST116 JSON object requested, multiple (or no) rows returned' saat query single user di Supabase..."
                value={blockerText}
                onChange={(e) => setUserEditedBlocker(e.target.value)}
                disabled={isAnalyzing}
                className="w-full rounded-[18px] border border-border bg-secondary/30 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="technology" className="text-xs font-extrabold text-foreground">
                  Teknologi Terkait (Opsional)
                </Label>
                <input
                  type="text"
                  id="technology"
                  placeholder="Misal: Next.js 16, Supabase, Drizzle"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full rounded-full border border-border bg-secondary/30 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attempted" className="text-xs font-extrabold text-foreground">
                  Apa yang Sudah Dicoba? (Opsional)
                </Label>
                <input
                  type="text"
                  id="attempted"
                  placeholder="Misal: Ganti .single() jadi .maybeSingle()"
                  value={attemptedSolutions}
                  onChange={(e) => setAttemptedSolutions(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full rounded-full border border-border bg-secondary/30 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* 1. Root Cause Hypotheses */}
            <div className="rounded-[22px] border border-amber-500/30 bg-amber-500/10 p-4.5 space-y-2 text-foreground shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                <Search className="size-4" /> Kemungkinan Akar Masalah:
              </span>
              <ul className="list-disc list-inside space-y-1.5 font-medium pl-1 leading-relaxed">
                {advice.rootCauseHypotheses.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            {/* 2. Investigation Steps */}
            <div className="rounded-[22px] border border-border bg-secondary/30 p-4.5 space-y-2 text-foreground shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-sm text-primary">
                <Search className="size-4" /> Langkah Investigasi & Debugging:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground font-medium pl-1 leading-relaxed">
                {advice.investigationSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>

            {/* 3. Potential Solutions */}
            <div className="rounded-[22px] border border-emerald-500/30 bg-emerald-500/10 p-4.5 space-y-2 text-foreground shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                <Wrench className="size-4" /> Alternatif Solusi:
              </span>
              <ul className="space-y-2 pt-1">
                {advice.potentialSolutions.map((sol, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-[16px] bg-card border border-border p-3 shadow-2xs">
                    <span className="text-foreground font-medium flex-1 leading-relaxed">{sol}</span>
                    {onApplySolution && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplySolution(sol);
                          toast.success('Solusi diterapkan ke formulir!');
                        }}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1 text-[11px] font-bold active:scale-95 transition-all shadow-2xs shrink-0"
                      >
                        Gunakan
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. How to Ask Mentor */}
            <div className="rounded-[22px] border border-indigo-500/30 bg-indigo-500/10 p-4.5 space-y-2.5 text-foreground shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-sm text-indigo-700 dark:text-indigo-300">
                  <HelpCircle className="size-4" /> Template Bertanya ke Mentor:
                </span>
                <button
                  type="button"
                  onClick={copyMentorMessage}
                  className="rounded-full border border-border bg-surface px-3.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                >
                  {copiedMentorText ? (
                    <>
                      <Check className="size-3 text-emerald-600 stroke-[2.5]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
              </div>
              <p className="whitespace-pre-wrap rounded-[16px] bg-card p-3.5 font-mono text-[11px] text-foreground border border-border leading-relaxed shadow-2xs">
                {advice.howToAskMentor}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border pt-4 mt-2">
          <button
            type="button"
            onClick={() => {
              if (advice) {
                setAdvice(null);
              } else {
                onOpenChange(false);
              }
            }}
            disabled={isAnalyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            {advice ? 'Ubah Pertanyaan' : 'Tutup'}
          </button>

          {!advice ? (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Mendiagnosis kendala...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5" />
                  <span>Diagnosis Masalah</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-xs"
            >
              Selesai
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
