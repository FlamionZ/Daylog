'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ListTodo,
  Loader2,
  Check,
  AlertTriangle,
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
import { extractTasksAction } from '../actions/ai-actions';
import { createTask } from '@/features/tasks/actions/task-actions';
import type { ExtractedTaskItem } from '@/server/ai/prompts/extract-tasks';

interface TaskExtractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
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
  notes,
  existingTasks = [],
  onSuccess,
}: TaskExtractionModalProps) {
  const [isExtracting, startExtracting] = React.useTransition();
  const [isSaving, startSaving] = React.useTransition();
  const [tasks, setTasks] = React.useState<EditableTaskItem[]>([]);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  // Auto extract when modal opens and tasks are empty
  React.useEffect(() => {
    if (open && notes.trim() && tasks.length === 0) {
      startExtracting(async () => {
        const res = await extractTasksAction({
          notes,
          existingTasks,
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
            toast.info('Tidak ada tugas baru yang terdeteksi dari catatan.');
          } else {
            toast.success(`${items.length} tugas berhasil diekstrak!`);
          }
        } else {
          toast.error(res.error || 'Gagal mengekstrak tugas.');
        }
      });
    }
  }, [open, notes, existingTasks, tasks.length]);

  const toggleSelect = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)),
    );
  };

  const updateTaskField = (
    id: string,
    field: keyof ExtractedTaskItem,
    value: string,
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
        toast.success(`${successCount} tugas berhasil ditambahkan ke daftar!`);
        onSuccess?.();
        onOpenChange(false);
      }
      if (failCount > 0) {
        toast.error(`${failCount} tugas gagal disimpan.`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                AI mengidentifikasi pekerjaan dan tindak lanjut dari catatan. Pilih tugas yang ingin disimpan ke task board.
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
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#DDE7FE] dark:bg-[#1E293B] text-[#1E3A8A] dark:text-[#93C5FD]">
              <Loader2 className="size-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-foreground">Menganalisis catatan dan mengekstrak tugas...</p>
            <p className="text-[11px] text-muted-foreground">Memetakan deliverable, bug fix, dan tingkat prioritas.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 p-10 text-center space-y-2">
            <Info className="size-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-extrabold text-foreground">Tidak ada tugas yang terdeteksi</p>
            <p className="text-xs text-muted-foreground">
              Pastikan catatan mencantumkan rencana, to-do, atau tindak lanjut pekerjaan.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 py-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
              <span>{tasks.length} TUGAS DITEMUKAN</span>
              <span className="text-foreground">{selectedCount} TERPILIH</span>
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
                        <span
                          className={`self-start sm:self-auto rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            task.priority === 'urgent'
                              ? 'bg-[#F8C39E] dark:bg-red-950/50 text-[#4A240E] dark:text-red-300 border border-transparent dark:border-red-800/40'
                              : task.priority === 'high'
                              ? 'bg-[#FBE892] dark:bg-amber-950/50 text-[#3E340D] dark:text-amber-300 border border-transparent dark:border-amber-800/40'
                              : 'bg-secondary border border-border text-foreground'
                          }`}
                        >
                          {task.priority}
                        </span>
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

          {tasks.length > 0 && (
            <button
              type="button"
              onClick={handleSaveSelected}
              disabled={isSaving || selectedCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan ke Tugas...</span>
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
