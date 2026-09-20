'use client';

import * as React from 'react';
import { BookOpen, FileEdit, ListTodo, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { formatDate } from '@/lib/date';
import type { JournalRecord } from '../actions/journal-actions';

interface JournalListProps {
  journals: JournalRecord[];
  onSelectJournal: (journal: JournalRecord) => void;
  onNewJournal: () => void;
}

export function JournalList({
  journals,
  onSelectJournal,
  onNewJournal,
}: JournalListProps) {
  if (!journals || journals.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="size-10" />}
        title="Belum ada jurnal yang tercatat"
        description="Buat catatan aktivitas harian pertamamu agar progres magang terekam dengan rapi."
        action={
          <Button onClick={onNewJournal} size="sm">
            <Plus className="mr-1.5 size-4" />
            Tulis Jurnal Pertama
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-foreground">
          Riwayat Jurnal ({journals.length})
        </h3>
        <button
          onClick={onNewJournal}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>Jurnal Baru</span>
        </button>
      </div>

      <div className="space-y-3">
        {journals.map((j) => {
          const isCompleted = j.status === 'completed';
          const tasksCount = j.journal_tasks?.length || 0;

          return (
            <div
              key={j.id}
              onClick={() => onSelectJournal(j)}
              className="group flex flex-col gap-2 rounded-[20px] border border-border bg-card p-4.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md cursor-pointer sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-primary">
                    {formatDate(j.journal_date, 'EEEE, d MMMM yyyy')}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isCompleted ? 'Selesai' : 'Draft'}
                  </span>
                </div>

                <h4 className="mt-1 text-sm font-bold text-foreground truncate">
                  {j.title || j.summary}
                </h4>

                {j.title && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-medium">
                    {j.summary}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-2 border-t border-border sm:border-t-0 sm:pt-0">
                {tasksCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <ListTodo className="size-3.5" />
                    {tasksCount} tugas
                  </span>
                )}

                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-2xs">
                  <FileEdit className="size-3" />
                  <span>Buka Jurnal</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
