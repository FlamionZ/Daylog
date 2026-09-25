'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ListTodo,
  Loader2,
  Check,
  AlertTriangle,
  Info,
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
import { extractTasksAction } from '../actions/ai-actions';
import { createTask, getTasks } from '@/features/tasks/actions/task-actions';
import { getJournalByDate } from '@/features/journals/actions/journal-actions';
import { todayInJakarta } from '@/lib/date';
import type { ExtractedTaskItem } from '@/server/ai/prompts/extract-tasks';

interface TaskExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes?: string;
  existingTasks?: string[];
  onSuccess?: () => void;
}

interface EditableTaskItem extends ExtractedTaskItem {
  id: string;
  selected: boolean;
}

export function TaskExtractionModal({
  open,
  onOpenChange,
  notes = '',
  existingTasks = [],
  onSuccess,
}: TaskExtractionModalProps) {
  const [isExtracting, startExtracting] = React.useTransition();
  const [isSaving, startSaving] = React.useTransition();
  const [isFetchingContext, setIsFetchingContext] = React.useState(Boolean(open && !notes));
  const [notesInput, setNotesInput] = React.useState(notes);
  const [customExistingTasks, setCustomExistingTasks] = React.useState<string[]>([]);
  const [tasks, setTasks] = React.useState<EditableTaskItem[]>([]);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [hasAttemptedScan, setHasAttemptedScan] = React.useState(false);
  const [isEditingSource, setIsEditingSource] = React.useState(false);

  const combinedExistingTasks = React.useMemo(
    () => (existingTasks.length > 0 ? existingTasks : customExistingTasks),
    [existingTasks, customExistingTasks],
  );

  // When modal opens:
  // If explicit notes provided from scratchpad with content, auto-extract
  // If notes not provided, prefetch today's journal context and active tasks
  React.useEffect(() => {
    let ignore = false;

    if (open) {
      if (notes && notes.trim().length > 5 && tasks.length === 0 && !hasAttemptedScan) {
        startExtracting(async () => {
          setHasAttemptedScan(true);
          const res = await extractTasksAction({
            notes,
            existingTasks: combinedExistingTasks,
          });

          if (ignore) return;
          if (res.success && res.data) {
            const items: EditableTaskItem[] = res.data.tasks.map((t, idx) => ({
              ...t,
              id: `task-${idx}-${Date.now()}`,
              selected: true,
            }));
            setTasks(items);
            setWarningMessage(res.warning || null);
            if (items.length === 0) {
              toast.info('Tidak ada tugas baru yang terdeteksi dari catatan.');
            } else {
              toast.success(`${items.length} tugas berhasil diekstrak!`);
            }
          } else {
            toast.error(res.error || 'Gagal mengekstrak tugas.');
          }
        });
      } else if (!notes && tasks.length === 0 && !hasAttemptedScan) {
        // AI Hub mode: prefetch today's journal activities and active tasks
        Promise.all([
          getJournalByDate(todayInJakarta()),
          existingTasks.length === 0 ? getTasks({ status: 'all' }) : Promise.resolve([]),
        ])
          .then(([journal, taskRecords]) => {
            if (ignore) return;
            if (taskRecords && taskRecords.length > 0) {
              setCustomExistingTasks(taskRecords.map((t) => t.title));
            }
            if (
              journal &&
              (journal.activities?.trim() || journal.next_plan?.trim() || journal.blockers?.trim())
            ) {
              const parts: string[] = [];
              if (journal.activities?.trim()) {
                parts.push(`Aktivitas Hari Ini:\n${journal.activities.trim()}`);
              }
              if (journal.next_plan?.trim()) {
                parts.push(`Rencana Lanjutan:\n${journal.next_plan.trim()}`);
              }
              if (journal.blockers?.trim()) {
                parts.push(`Kendala / Follow-up:\n${journal.blockers.trim()}`);
              }
              setNotesInput((prev) => (prev ? prev : parts.join('\n\n')));
            }
          })
          .catch((err) => {
            console.error('Error prefetching context:', err);
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
  }, [open, notes, existingTasks.length, combinedExistingTasks, hasAttemptedScan, tasks.length]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTasks([]);
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
      if (
        journal &&
        (journal.activities?.trim() || journal.next_plan?.trim() || journal.blockers?.trim())
      ) {
        const parts: string[] = [];
        if (journal.activities?.trim()) {
          parts.push(`Aktivitas Hari Ini:\n${journal.activities.trim()}`);
        }
        if (journal.next_plan?.trim()) {
          parts.push(`Rencana Lanjutan:\n${journal.next_plan.trim()}`);
        }
        if (journal.blockers?.trim()) {
          parts.push(`Kendala / Follow-up:\n${journal.blockers.trim()}`);
        }
        setNotesInput(parts.join('\n\n'));
        toast.success('Berhasil memuat aktivitas & rencana dari jurnal hari ini!');
      } else {
        toast.info(
          'Belum ada catatan jurnal untuk hari ini. Kamu bisa menulis atau menempel catatan langsung di kolom bawah.',
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
      const res = await extractTasksAction({
        notes: notesInput,
        existingTasks: combinedExistingTasks,
      });

      if (res.success && res.data) {
        const items: EditableTaskItem[] = res.data.tasks.map((t, idx) => ({
          ...t,
          id: `task-${idx}-${Date.now()}`,
          selected: true,
        }));
        setTasks(items);
        setWarningMessage(res.warning || null);
        if (items.length === 0) {
          toast.info('Tidak ada tugas baru yang terdeteksi dari teks catatan.');
        } else {
          toast.success(`${items.length} tugas berhasil diekstrak!`);
        }
      } else {
        toast.error(res.error || 'Gagal mengekstrak tugas.');
      }
    });
  };

  const toggleSelect = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)),
    );
  };

  const updateTaskField = <K extends keyof ExtractedTaskItem>(
    id: string,
    field: K,
    value: ExtractedTaskItem[K],
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const selectedCount = tasks.filter((t) => t.selected).length;

  const handleSaveSelected = () => {
    const toSave = tasks.filter((t) => t.selected);
    if (toSave.length === 0) {
      toast.error('Pilih minimal satu tugas untuk disimpan.');
      return;
    }

    startSaving(async () => {
      let successCount = 0;
      let failCount = 0;

      for (const t of toSave) {
        const res = await createTask({
          title: t.title,
          description: t.description || undefined,
          priority: t.priority,
          status: 'todo',
        });
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} tugas berhasil ditambahkan ke Task Board!`);
        onSuccess?.();
        handleOpenChange(false);
      }
      if (failCount > 0) {
        toast.error(`${failCount} tugas gagal disimpan.`);
      }
    });
  };

  const showResults = tasks.length > 0 && !isEditingSource;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card text-card-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#DDE7FE] dark:bg-[#1E293B] text-[#1E3A8A] dark:text-[#93C5FD] shadow-2xs shrink-0">
              <ListTodo className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Ekstrak Tugas dari Catatan
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                AI mengidentifikasi action items dan tindak lanjut dari catatan untuk dijadikan tugas baru di Task Board.
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

        {/* Existing tasks context badge */}
        {combinedExistingTasks.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 border border-border px-3.5 py-2 text-[11px] text-muted-foreground">
            <span className="flex size-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Terhubung ke Task Board: <strong>{combinedExistingTasks.length} tugas aktif</strong> terdaftar sebagai referensi anti-duplikasi AI.
            </span>
          </div>
        )}

        {isExtracting ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#DDE7FE] dark:bg-[#1E293B] text-[#1E3A8A] dark:text-[#93C5FD]">
              <Loader2 className="size-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-foreground">Menganalisis catatan dan mengekstrak tugas...</p>
            <p className="text-[11px] text-muted-foreground">Memetakan deliverable, rencana kerja, dan tingkat prioritas.</p>
          </div>
        ) : showResults ? (
          /* RESULT VIEW: LIST OF EXTRACTED TASKS */
          <div className="space-y-3.5 py-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
              <span className="text-foreground">{tasks.length} TUGAS DITEMUKAN · {selectedCount} TERPILIH</span>
              <button
                type="button"
                onClick={() => setIsEditingSource(true)}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Ubah Catatan Sumber</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-[22px] border p-4 space-y-3 transition-all ${
                    task.selected
                      ? 'border-[#B4CCFE] dark:border-blue-500/40 bg-[#DDE7FE]/35 dark:bg-blue-950/25 shadow-2xs'
                      : 'border-border bg-card opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`check-${task.id}`}
                      checked={task.selected}
                      onChange={() => toggleSelect(task.id)}
                      className="mt-1.5 size-4 rounded-md border-border accent-primary text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) =>
                            updateTaskField(task.id, 'title', e.target.value)
                          }
                          placeholder="Judul tugas"
                          className="flex-1 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                        />
                        <select
                          value={task.priority}
                          onChange={(e) =>
                            updateTaskField(
                              task.id,
                              'priority',
                              e.target.value as ExtractedTaskItem['priority'],
                            )
                          }
                          className={`self-start sm:self-auto rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs ${
                            task.priority === 'urgent'
                              ? 'bg-[#F8C39E] dark:bg-red-950/50 text-[#4A240E] dark:text-red-300 border border-transparent dark:border-red-800/40'
                              : task.priority === 'high'
                              ? 'bg-[#FBE892] dark:bg-amber-950/50 text-[#3E340D] dark:text-amber-300 border border-transparent dark:border-amber-800/40'
                              : 'bg-secondary border border-border text-foreground'
                          }`}
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={task.description || ''}
                        onChange={(e) =>
                          updateTaskField(task.id, 'description', e.target.value)
                        }
                        placeholder="Deskripsi singkat (opsional)..."
                        className="w-full rounded-full border border-border bg-secondary/30 px-3.5 py-1.5 text-[11px] text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* INPUT VIEW: TEXTAREA + LOAD FROM JOURNAL + SCAN BUTTON */
          <div className="space-y-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="task-extraction-notes"
                className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider"
              >
                Catatan / Sumber Teks
              </label>
              <button
                type="button"
                onClick={handleManualLoadJournal}
                disabled={isFetchingContext}
                className="inline-flex items-center gap-1.5 text-xs text-[#1E3A8A] dark:text-[#93C5FD] font-bold hover:underline self-start sm:self-auto disabled:opacity-50"
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
              id="task-extraction-notes"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ketik catatan pekerjaan, arahan mentor, chat diskusi, notulen rapat, atau klik 'Muat dari Jurnal Hari Ini' untuk mengekstrak tugas baru ke task board..."
              rows={6}
              className="w-full rounded-2xl border border-border bg-secondary/30 p-4 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs leading-relaxed"
            />

            {hasAttemptedScan && tasks.length === 0 && (
              <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 flex items-start gap-3">
                <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-foreground">Tidak ada tugas yang terdeteksi dari teks di atas</p>
                  <p className="text-muted-foreground leading-relaxed">
                    AI tidak menemukan kalimat rencana aksi atau tindak lanjut spesifik. Pastikan catatan mencantumkan aktivitas kerja, to-do, perbaikan bug, atau instruksi tindak lanjut.
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
                {tasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSource(false)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-2xs"
                  >
                    Lihat Hasil Tugas ({tasks.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isExtracting || !notesInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E3A8A] dark:bg-[#BFDBFE] px-5 py-2.5 text-xs font-bold text-white dark:text-[#152347] hover:bg-[#2A4EA8] dark:hover:bg-white active:scale-95 transition-all shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  <span>{hasAttemptedScan ? 'Pindai Ulang Catatan' : 'Pindai & Ekstrak Tugas'}</span>
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
                  <span>Menyimpan ke Task Board...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5 stroke-[2.5]" />
                  <span>Simpan {selectedCount} Tugas Terpilih</span>
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
