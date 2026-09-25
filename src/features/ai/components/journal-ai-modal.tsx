'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  Check,
  Copy,
  AlertTriangle,
  Info,
  ArrowRight,
  ExternalLink,
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
import { generateJournalSuggestionAction } from '../actions/ai-actions';
import { KemnakerExportModal } from '@/features/journals/components/kemnaker-export-modal';
import type { JournalSuggestion } from '@/server/ai/prompts/journal';

interface JournalAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journalDate: string;
  currentValues: {
    summary: string;
    activities: string;
    learnings: string;
    blockers: string;
    solutions: string;
    nextPlan: string;
  };
  onApplyField: (field: keyof JournalSuggestion, value: string) => void;
  onApplyAll: (suggestion: JournalSuggestion) => void;
  tasksDone?: string[];
  tasksInProgress?: string[];
  initialNotes?: string;
}

export function JournalAIModal({
  open,
  onOpenChange,
  journalDate,
  currentValues,
  onApplyField,
  onApplyAll,
  tasksDone = [],
  tasksInProgress = [],
  initialNotes,
}: JournalAIModalProps) {
  const [userEditedNotes, setUserEditedNotes] = React.useState<string | null>(null);
  const [isGenerating, startGenerating] = React.useTransition();
  const [suggestion, setSuggestion] = React.useState<JournalSuggestion | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [isExportMonevOpen, setIsExportMonevOpen] = React.useState(false);

  const roughNotes = userEditedNotes ?? (initialNotes || '');

  const handleGenerate = () => {
    if (!roughNotes.trim()) {
      toast.error('Tulis catatan kasar atau poin aktivitas terlebih dahulu.');
      return;
    }

    startGenerating(async () => {
      const res = await generateJournalSuggestionAction({
        notes: roughNotes.trim(),
        journalDate,
        tasksDone,
        tasksInProgress,
      });

      if (res.success && res.data) {
        setSuggestion(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Draf jurnal 4 poin berhasil disusun oleh Asisten AI!');
      } else {
        toast.error(res.error || 'Gagal menyusun jurnal.');
      }
    });
  };

  const handleApplyAllClick = () => {
    if (!suggestion) return;
    onApplyAll(suggestion);
    toast.success('Seluruh saran jurnal berhasil diterapkan ke editor!');
    onOpenChange(false);
  };

  const copyToClipboard = async (field: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Teks berhasil disalin!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Gagal menyalin teks.');
    }
  };

  const renderFieldComparison = (
    fieldKey: keyof JournalSuggestion,
    label: string,
    suggestedText: string,
    currentText: string,
  ) => {
    return (
      <div key={fieldKey} className="rounded-[22px] border border-border bg-card p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs text-foreground">{label}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(fieldKey, suggestedText)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
            >
              {copiedField === fieldKey ? (
                <>
                  <Check className="size-3 text-emerald-600 stroke-[2.5]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyField(fieldKey, suggestedText);
                toast.success(`Bagian ${label} diterapkan!`);
              }}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1 text-[11px] font-bold active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
            >
              <ArrowRight className="size-3" />
              <span>Terapkan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-[16px] bg-secondary/30 border border-border p-3">
            <span className="font-bold text-muted-foreground block mb-1 text-[11px] uppercase tracking-wider font-mono">Teks Saat Ini:</span>
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {currentText.trim() || <span className="italic text-muted-foreground">(Belum diisi)</span>}
            </p>
          </div>

          <div className="rounded-[16px] bg-primary/10 border border-primary/20 p-3">
            <span className="font-bold text-primary block mb-1 text-[11px] uppercase tracking-wider font-mono">Saran AI:</span>
            <p className="whitespace-pre-wrap text-foreground font-medium leading-relaxed">
              {suggestedText.trim() || <span className="italic text-muted-foreground">(Tidak ada saran)</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border border-border bg-card text-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs shrink-0">
              <Sparkles className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  Bantu Tulis Jurnal dengan Asisten AI
                </DialogTitle>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Gaya Alami (Humanize)
                </span>
              </div>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Masukkan catatan kasar aktivitas magang. AI akan menyusunnya ke format resmi 4 poin Monev Kemnaker RI dengan bahasa alami manusia (bebas repetisi kata & buzzword).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Input Rough Notes */}
        {!suggestion ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roughNotes" className="text-xs font-extrabold text-foreground">
                Catatan Kasar Aktivitas Hari Ini
              </Label>
              <textarea
                id="roughNotes"
                rows={5}
                placeholder="Contoh: Pagi tadi meeting sprint planning, lanjut fixing bug di modul presensi, pelajari cara kerja timezone Asia/Jakarta di date-fns-tz, sempat bingung konversi waktu UTC ke WIB tapi ketemu solusinya pakai helper date.ts..."
                value={roughNotes}
                onChange={(e) => setUserEditedNotes(e.target.value)}
                disabled={isGenerating}
                className="w-full rounded-[18px] border border-border bg-secondary/30 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground font-medium">
                Tuliskan secara bebas apa saja yang dikerjakan, kendala, atau hal baru yang dipelajari.
              </p>
            </div>

            {(tasksDone.length > 0 || tasksInProgress.length > 0) && (
              <div className="rounded-[20px] bg-secondary/30 border border-border p-3.5 text-xs space-y-1.5 shadow-2xs">
                <span className="font-extrabold flex items-center gap-1.5 text-foreground">
                  <Info className="size-3.5 text-primary" /> Tugas otomatis disertakan sebagai konteks:
                </span>
                {tasksDone.length > 0 && (
                  <p className="text-muted-foreground text-[11px]">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Selesai:</span> {tasksDone.join(', ')}
                  </p>
                )}
                {tasksInProgress.length > 0 && (
                  <p className="text-muted-foreground text-[11px]">
                    <span className="font-bold text-blue-700 dark:text-blue-400">Sedang dikerjakan:</span> {tasksInProgress.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {warningMessage && (
              <div className="rounded-[18px] bg-amber-500/10 border border-amber-500/25 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                <span className="font-medium">{warningMessage}</span>
              </div>
            )}

            <div className="rounded-[20px] bg-secondary/30 border border-border p-3.5 text-xs text-muted-foreground flex items-center gap-2.5 shadow-2xs">
              <Info className="size-4 text-primary shrink-0" />
              <span className="font-medium">
                Tinjau saran AI di bawah ini. Terapkan seluruh field sekaligus atau pilih field tertentu.
              </span>
            </div>

            <div className="space-y-3.5">
              {renderFieldComparison('summary', '1. Ringkasan Hari Ini', suggestion.summary, currentValues.summary)}
              {renderFieldComparison('activities', '2. Pekerjaan yang Dilakukan', suggestion.activities, currentValues.activities)}
              {renderFieldComparison('learnings', '3. Hal yang Dipelajari', suggestion.learnings, currentValues.learnings)}
              {renderFieldComparison('blockers', '4. Kendala / Blocker', suggestion.blockers, currentValues.blockers)}
              {renderFieldComparison('solutions', '5. Solusi / Tindak Lanjut', suggestion.solutions, currentValues.solutions)}
              {renderFieldComparison('nextPlan', '6. Rencana Kerja Selanjutnya', suggestion.nextPlan, currentValues.nextPlan)}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t border-border pt-4 mt-2">
          {!suggestion ? (
            <>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Menyusun draft jurnal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>Susun Jurnal</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs"
              >
                Ubah Catatan Kasar
              </button>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportMonevOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Kirim ke Monev</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleApplyAllClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="size-3.5 stroke-[2.5]" />
                  <span>Terapkan Semua Field</span>
                </button>
              </div>
            </>
          )}
        </DialogFooter>

        {suggestion && (
          <KemnakerExportModal
            open={isExportMonevOpen}
            onOpenChange={setIsExportMonevOpen}
            data={{
              activities: suggestion.activities,
              learnings: suggestion.learnings,
              blockers: suggestion.blockers,
              solutions: suggestion.solutions,
              summary: suggestion.summary,
              journalDate,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
