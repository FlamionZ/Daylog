'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BookOpen,
  ListTodo,
  GraduationCap,
  Terminal,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TaskExtractionModal } from '@/features/ai/components/task-extraction-modal';
import { LearningExtractionModal } from '@/features/ai/components/learning-extraction-modal';
import type { TaskRecord } from '@/features/tasks/actions/task-actions';

interface QuickCaptureCardProps {
  existingTasks?: TaskRecord[];
}

export function QuickCaptureCard({ existingTasks = [] }: QuickCaptureCardProps) {
  const router = useRouter();
  const [notes, setNotes] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('intern_quick_scratchpad') || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [learningModalOpen, setLearningModalOpen] = React.useState(false);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    try {
      sessionStorage.setItem('intern_quick_scratchpad', val);
    } catch {
      // ignore
    }
  };

  const handleClearNotes = () => {
    setNotes('');
    try {
      sessionStorage.removeItem('intern_quick_scratchpad');
    } catch {
      // ignore
    }
    toast.info('Scratchpad dibersihkan.');
  };

  const existingTaskTitles = React.useMemo(
    () => existingTasks.map((t) => t.title),
    [existingTasks],
  );

  const handleOpenJournal = () => {
    if (!notes.trim()) {
      toast.error('Ketik catatan aktivitas terlebih dahulu.');
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ai_quick_notes', notes.trim());
    }
    router.push('/journals');
  };

  const handleExtractTasks = () => {
    if (!notes.trim()) {
      toast.error('Ketik catatan aktivitas terlebih dahulu untuk mengekstrak tugas.');
      return;
    }
    setTaskModalOpen(true);
  };

  const handleExtractLearnings = () => {
    if (!notes.trim()) {
      toast.error('Ketik catatan aktivitas terlebih dahulu untuk mengekstrak pembelajaran.');
      return;
    }
    setLearningModalOpen(true);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <>
      <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="size-3.5 text-primary" />
            <span className="font-bold text-foreground">DEV SCRATCHPAD</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-[10px] text-muted-foreground">Catat Cepat & Asistensi AI</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span>{wordCount} kata</span>
            {notes && (
              <button
                type="button"
                onClick={handleClearNotes}
                className="hover:text-destructive transition-colors p-1"
                title="Hapus catatan"
                aria-label="Hapus catatan scratchpad"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Ketik poin kasar apa yang kamu kerjakan hari ini, kendala, atau hal baru... Tekan tombol di bawah untuk diproses oleh AI."
            rows={3}
            className="text-xs font-mono leading-relaxed resize-none bg-surface/50 border-border/70 focus:border-primary/50"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[10px] font-mono text-muted-foreground">
              {notes.trim().length > 0
                ? 'Pilih aksi AI untuk menyulap catatan ini'
                : 'Data rahasia & token disanitasi otomatis'}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExtractTasks}
                disabled={!notes.trim()}
                className="h-8 gap-1.5 text-xs hover:border-blue-500/40 hover:text-blue-500"
              >
                <ListTodo className="size-3.5 text-blue-500" />
                <span>+ Ekstrak Tugas</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExtractLearnings}
                disabled={!notes.trim()}
                className="h-8 gap-1.5 text-xs hover:border-emerald-500/40 hover:text-emerald-500"
              >
                <GraduationCap className="size-3.5 text-emerald-500" />
                <span>+ Catat Belajar</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleOpenJournal}
                disabled={!notes.trim()}
                className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 font-semibold"
              >
                <BookOpen className="size-3.5" />
                <span>Jadikan Jurnal</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Extraction Modal */}
      <TaskExtractionModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        notes={notes}
        existingTasks={existingTaskTitles}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Learning Extraction Modal */}
      <LearningExtractionModal
        open={learningModalOpen}
        onOpenChange={setLearningModalOpen}
        notes={notes}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
