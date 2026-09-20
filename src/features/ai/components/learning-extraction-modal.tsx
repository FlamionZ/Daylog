'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  GraduationCap,
  Loader2,
  Check,
  AlertTriangle,
  Info,
  Quote,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { extractLearningsAction } from '../actions/ai-actions';
import { createLearning } from '@/features/learnings/actions/learning-actions';
import { todayInJakarta } from '@/lib/date';
import type { ExtractedLearningItem } from '@/server/ai/prompts/extract-learnings';

interface LearningExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onSuccess?: () => void;
}

interface EditableLearningItem extends ExtractedLearningItem {
  id: string;
  selected: boolean;
}

export function LearningExtractionModal({
  open,
  onOpenChange,
  notes,
  onSuccess,
}: LearningExtractionModalProps) {
  const [isExtracting, startExtracting] = React.useTransition();
  const [isSaving, startSaving] = React.useTransition();
  const [learnings, setLearnings] = React.useState<EditableLearningItem[]>([]);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  // Auto extract when modal opens and learnings are empty
  React.useEffect(() => {
    if (open && notes.trim() && learnings.length === 0) {
      startExtracting(async () => {
        const res = await extractLearningsAction({ notes });

        if (res.success && res.data) {
          const items: EditableLearningItem[] = res.data.learnings.map((l, idx) => ({
            ...l,
            id: `learning-${idx}-${Date.now()}`,
            selected: true,
          }));
          setLearnings(items);
          setWarningMessage(res.warning || null);
          if (items.length === 0) {
            toast.info('Tidak ada pembelajaran baru yang terdeteksi.');
          } else {
            toast.success(`${items.length} materi pembelajaran berhasil diekstrak!`);
          }
        } else {
          toast.error(res.error || 'Gagal mengekstrak pembelajaran.');
        }
      });
    }
  }, [open, notes, learnings.length]);

  const toggleSelect = (id: string) => {
    setLearnings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)),
    );
  };

  const updateLearningField = (
    id: string,
    field: keyof ExtractedLearningItem,
    value: string,
  ) => {
    setLearnings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  };

  const selectedCount = learnings.filter((l) => l.selected).length;

  const handleSaveSelected = () => {
    const toSave = learnings.filter((l) => l.selected);
    if (toSave.length === 0) {
      toast.error('Pilih minimal satu pembelajaran untuk disimpan.');
      return;
    }

    startSaving(async () => {
      let successCount = 0;
      let failCount = 0;
      const today = todayInJakarta();

      for (const item of toSave) {
        const res = await createLearning({
          topic: item.topic,
          technology: item.technology,
          summary: item.summary,
          level: item.level,
          learnedOn: today,
        });

        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} pembelajaran berhasil ditambahkan ke katalog!`);
        onSuccess?.();
        onOpenChange(false);
      }
      if (failCount > 0) {
        toast.error(`${failCount} materi gagal disimpan.`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card text-card-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F8C39E] dark:bg-amber-950/40 text-[#4A240E] dark:text-amber-300 shadow-2xs shrink-0">
              <GraduationCap className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Ekstrak Pembelajaran dari Catatan
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                AI mengidentifikasi konsep baru, teknologi, dan keterampilan yang dipelajari. Simpan langsung ke katalog belajarmu.
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

        {isExtracting ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F8C39E] dark:bg-amber-950/40 text-[#4A240E] dark:text-amber-300">
              <Loader2 className="size-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-foreground">Menganalisis catatan dan mengekstrak pembelajaran...</p>
            <p className="text-[11px] text-muted-foreground">Memetakan teknologi, konsep baru, dan bukti pemahaman.</p>
          </div>
        ) : learnings.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 p-10 text-center space-y-2">
            <Info className="size-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-extrabold text-foreground">Tidak ada pembelajaran yang terdeteksi</p>
            <p className="text-xs text-muted-foreground">
              Pastikan catatan mencantumkan teknologi baru, konsep teknis, atau wawasan yang dipelajari.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 py-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
              <span>{learnings.length} PEMBELAJARAN DITEMUKAN</span>
              <span className="text-foreground">{selectedCount} TERPILIH</span>
            </div>

            <div className="space-y-3">
              {learnings.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[22px] border p-4 space-y-3 transition-all ${
                    item.selected
                      ? 'border-[#EEA472] dark:border-amber-500/40 bg-[#F8C39E]/30 dark:bg-amber-950/25 shadow-2xs'
                      : 'border-border bg-card opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`check-${item.id}`}
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1.5 size-4 rounded-md border-border accent-primary text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <div className="flex-1 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.topic}
                          onChange={(e) =>
                            updateLearningField(item.id, 'topic', e.target.value)
                          }
                          placeholder="Topik pembelajaran"
                          className="w-full rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.technology}
                            onChange={(e) =>
                              updateLearningField(item.id, 'technology', e.target.value)
                            }
                            placeholder="Teknologi (misal: Next.js)"
                            className="flex-1 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                          />
                          <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground shrink-0">
                            {item.level}
                          </span>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.summary}
                        onChange={(e) =>
                          updateLearningField(item.id, 'summary', e.target.value)
                        }
                        placeholder="Ringkasan pemahaman..."
                        className="w-full rounded-full border border-border bg-secondary/30 px-3.5 py-1.5 text-xs text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />

                      {item.evidence && (
                        <div className="rounded-[16px] bg-secondary/40 border border-border p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 shadow-2xs">
                          <Quote className="size-3.5 shrink-0 mt-0.5 text-[#EEA472] dark:text-amber-400" />
                          <span className="italic leading-relaxed font-medium">&quot;{item.evidence}&quot;</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border pt-4 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            Batal
          </button>

          {learnings.length > 0 && (
            <button
              type="button"
              onClick={handleSaveSelected}
              disabled={isSaving || selectedCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan ke Katalog...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5 stroke-[2.5]" />
                  <span>Simpan {selectedCount} Pembelajaran</span>
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
