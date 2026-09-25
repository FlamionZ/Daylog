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
  Sparkles,
  BookOpen,
  ArrowLeft,
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
import { getJournalByDate } from '@/features/journals/actions/journal-actions';
import { todayInJakarta } from '@/lib/date';
import type { ExtractedLearningItem } from '@/server/ai/prompts/extract-learnings';

interface LearningExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes?: string;
  onSuccess?: () => void;
}

interface EditableLearningItem extends ExtractedLearningItem {
  id: string;
  selected: boolean;
}

export function LearningExtractionModal({
  open,
  onOpenChange,
  notes = '',
  onSuccess,
}: LearningExtractionModalProps) {
  const [isExtracting, startExtracting] = React.useTransition();
  const [isSaving, startSaving] = React.useTransition();
  const [isFetchingContext, setIsFetchingContext] = React.useState(Boolean(open && !notes));
  const [notesInput, setNotesInput] = React.useState(notes);
  const [learnings, setLearnings] = React.useState<EditableLearningItem[]>([]);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [hasAttemptedScan, setHasAttemptedScan] = React.useState(false);
  const [isEditingSource, setIsEditingSource] = React.useState(false);

  // When modal opens:
  // If notes provided from scratchpad with content, auto-extract
  // If notes not provided, prefetch today's journal context
  React.useEffect(() => {
    let ignore = false;

    if (open) {
      if (notes && notes.trim().length > 5 && learnings.length === 0 && !hasAttemptedScan) {
        startExtracting(async () => {
          setHasAttemptedScan(true);
          const res = await extractLearningsAction({ notes });

          if (ignore) return;
          if (res.success && res.data) {
            const items: EditableLearningItem[] = res.data.learnings.map((l, idx) => ({
              ...l,
              id: `learning-${idx}-${Date.now()}`,
              selected: true,
            }));
            setLearnings(items);
            setWarningMessage(res.warning || null);
            if (items.length === 0) {
              toast.info('Tidak ada pembelajaran baru yang terdeteksi dari catatan.');
            } else {
              toast.success(`${items.length} materi pembelajaran berhasil diekstrak!`);
            }
          } else {
            toast.error(res.error || 'Gagal mengekstrak pembelajaran.');
          }
        });
      } else if (!notes && learnings.length === 0 && !hasAttemptedScan) {
        // AI Hub mode: prefetch today's journal learnings and activities
        getJournalByDate(todayInJakarta())
          .then((journal) => {
            if (ignore) return;
            if (journal && (journal.learnings?.trim() || journal.activities?.trim())) {
              const parts: string[] = [];
              if (journal.learnings?.trim()) {
                parts.push(`Pembelajaran Hari Ini:\n${journal.learnings.trim()}`);
              }
              if (journal.activities?.trim()) {
                parts.push(`Aktivitas Praktik:\n${journal.activities.trim()}`);
              }
              setNotesInput((prev) => (prev ? prev : parts.join('\n\n')));
            }
          })
          .catch((err) => {
            console.error('Error prefetching journal for learnings:', err);
          })
          .finally(() => {
            if (!ignore) {
              setIsFetchingContext(false);
            }
          });
      }
    }

    return () => {
      ignore = true;
    };
  }, [open, notes, hasAttemptedScan, learnings.length]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLearnings([]);
      setHasAttemptedScan(false);
      setWarningMessage(null);
      setIsEditingSource(false);
      setIsFetchingContext(false);
    } else {
      if (notes) {
        setNotesInput(notes);
      } else {
        setIsFetchingContext(true);
      }
    }
    onOpenChange(newOpen);
  };

  const handleManualLoadJournal = async () => {
    setIsFetchingContext(true);
    try {
      const journal = await getJournalByDate(todayInJakarta());
      if (journal && (journal.learnings?.trim() || journal.activities?.trim())) {
        const parts: string[] = [];
        if (journal.learnings?.trim()) {
          parts.push(`Pembelajaran Hari Ini:\n${journal.learnings.trim()}`);
        }
        if (journal.activities?.trim()) {
          parts.push(`Aktivitas Praktik:\n${journal.activities.trim()}`);
        }
        setNotesInput(parts.join('\n\n'));
        toast.success('Berhasil memuat materi pembelajaran dari jurnal hari ini!');
      } else {
        toast.info(
          'Belum ada catatan pembelajaran di jurnal hari ini. Kamu bisa menulis atau menempel catatan langsung di kolom bawah.',
        );
      }
    } catch (err) {
      console.error('Error loading journal:', err);
      toast.error('Gagal memuat jurnal hari ini.');
    } finally {
      setIsFetchingContext(false);
    }
  };

  const handleExtract = () => {
    if (!notesInput.trim()) {
      toast.error('Masukkan catatan atau klik "Muat dari Jurnal Hari Ini" terlebih dahulu.');
      return;
    }

    startExtracting(async () => {
      setHasAttemptedScan(true);
      setIsEditingSource(false);
      const res = await extractLearningsAction({ notes: notesInput });

      if (res.success && res.data) {
        const items: EditableLearningItem[] = res.data.learnings.map((l, idx) => ({
          ...l,
          id: `learning-${idx}-${Date.now()}`,
          selected: true,
        }));
        setLearnings(items);
        setWarningMessage(res.warning || null);
        if (items.length === 0) {
          toast.info('Tidak ada pembelajaran baru yang terdeteksi dari catatan.');
        } else {
          toast.success(`${items.length} materi pembelajaran berhasil diekstrak!`);
        }
      } else {
        toast.error(res.error || 'Gagal mengekstrak pembelajaran.');
      }
    });
  };

  const toggleSelect = (id: string) => {
    setLearnings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)),
    );
  };

  const updateLearningField = <K extends keyof ExtractedLearningItem>(
    id: string,
    field: K,
    value: ExtractedLearningItem[K],
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
        handleOpenChange(false);
      }
      if (failCount > 0) {
        toast.error(`${failCount} materi gagal disimpan.`);
      }
    });
  };

  const showResults = learnings.length > 0 && !isEditingSource;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                AI mengidentifikasi konsep baru, teknologi, dan keterampilan yang dipelajari untuk disimpan ke katalog riwayat kompetensi magang.
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
        ) : showResults ? (
          /* RESULT VIEW */
          <div className="space-y-3.5 py-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
              <span className="text-foreground">{learnings.length} PEMBELAJARAN DITEMUKAN · {selectedCount} TERPILIH</span>
              <button
                type="button"
                onClick={() => setIsEditingSource(true)}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Ubah Catatan Sumber</span>
              </button>
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
                          <select
                            value={item.level}
                            onChange={(e) =>
                              updateLearningField(
                                item.id,
                                'level',
                                e.target.value as ExtractedLearningItem['level'],
                              )
                            }
                            className="rounded-full border border-border bg-secondary/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
                          >
                            <option value="exploring">Exploring</option>
                            <option value="learning">Learning</option>
                            <option value="practicing">Practicing</option>
                            <option value="confident">Confident</option>
                          </select>
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
        ) : (
          /* INPUT VIEW */
          <div className="space-y-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="learning-extraction-notes"
                className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider"
              >
                Catatan / Sumber Pembelajaran
              </label>
              <button
                type="button"
                onClick={handleManualLoadJournal}
                disabled={isFetchingContext}
                className="inline-flex items-center gap-1.5 text-xs text-[#4A240E] dark:text-[#FDBA74] font-bold hover:underline self-start sm:self-auto disabled:opacity-50"
              >
                {isFetchingContext ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Memuat Jurnal...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="size-3.5" />
                    <span>Muat dari Jurnal Hari Ini</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="learning-extraction-notes"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ketik atau tempel ringkasan materi, framework/tools baru yang dipelajari, catatan sesi mentoring teknis, atau klik 'Muat dari Jurnal Hari Ini'..."
              rows={6}
              className="w-full rounded-2xl border border-border bg-secondary/30 p-4 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs leading-relaxed"
            />

            {hasAttemptedScan && learnings.length === 0 && (
              <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 flex items-start gap-3">
                <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-foreground">Tidak ada materi pembelajaran yang terdeteksi</p>
                  <p className="text-muted-foreground leading-relaxed">
                    AI tidak menemukan penyebutan teknologi, konsep teknis, atau keterampilan spesifik dalam catatan di atas. Coba sebutkan nama framework, bahasa pemrograman, atau materi yang kamu pelajari.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-muted-foreground">
                {notesInput.trim() ? (
                  <span>{notesInput.trim().length} karakter terisi</span>
                ) : (
                  <span>Tempel catatan atau muat dari jurnal hari ini</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {learnings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSource(false)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs"
                  >
                    Lihat Hasil Pembelajaran ({learnings.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isExtracting || !notesInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A240E] dark:bg-[#FDBA74] px-5 py-2.5 text-xs font-bold text-white dark:text-[#2D1B0E] hover:bg-[#683515] dark:hover:bg-[#FED7AA] active:scale-95 transition-all shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  <span>{hasAttemptedScan ? 'Pindai Ulang Pembelajaran' : 'Pindai & Ekstrak Pembelajaran'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border pt-4 mt-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            Tutup
          </button>

          {showResults && (
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
