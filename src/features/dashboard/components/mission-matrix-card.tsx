'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateTaskStatus, type TaskRecord } from '@/features/tasks/actions/task-actions';
import { formatDate } from '@/lib/date';

interface MissionMatrixCardProps {
  tasks: TaskRecord[];
  onAddTask: () => void;
}

export function MissionMatrixCard({ tasks: initialTasks, onAddTask }: MissionMatrixCardProps) {
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, TaskRecord['status']>>({});
  const [filter, setFilter] = React.useState<'all' | 'priority' | 'in_progress' | 'done'>('priority');

  const tasks = React.useMemo(() => {
    return initialTasks.map((t) =>
      statusOverrides[t.id] ? { ...t, status: statusOverrides[t.id] } : t,
    );
  }, [initialTasks, statusOverrides]);

  // Pleasant Web Audio chime on task completion
  const playTaskChime = React.useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.12); // B5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // audio error fallback
    }
  }, []);

  const handleToggleTask = async (task: TaskRecord) => {
    const isCurrentlyDone = task.status === 'done';
    const newStatus: TaskRecord['status'] = isCurrentlyDone ? 'in_progress' : 'done';

    // Optimistic UI update via statusOverrides
    setStatusOverrides((prev) => ({ ...prev, [task.id]: newStatus }));

    if (!isCurrentlyDone) {
      playTaskChime();
      toast.success(`Misi selesai: "${task.title}" (+50 XP)`);
    } else {
      toast.info(`Misi dibuka kembali: "${task.title}"`);
    }

    const res = await updateTaskStatus(task.id, newStatus);
    if (!res.success) {
      // Revert if error
      setStatusOverrides((prev) => ({ ...prev, [task.id]: task.status }));
      toast.error('Gagal memperbarui status tugas.');
    }
  };

  const filteredTasks = React.useMemo(() => {
    if (filter === 'priority') {
      return tasks.filter((t) => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'));
    }
    if (filter === 'in_progress') {
      return tasks.filter((t) => t.status === 'in_progress');
    }
    if (filter === 'done') {
      return tasks.filter((t) => t.status === 'done');
    }
    return tasks;
  }, [tasks, filter]);

  const priorityCount = tasks.filter(
    (t) => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'),
  ).length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Misi & Target Kerja
            </h2>
            {priorityCount > 0 && (
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {priorityCount} Prioritas
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Checklist tugas harian terintegrasi dengan backlog sprint dan pelaporan.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onAddTask}
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Tambah Misi</span>
            <kbd className="hidden sm:inline-block rounded bg-primary-foreground/20 px-1 font-mono text-[9px]">T</kbd>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href="/tasks">
              <span>Semua ({tasks.length})</span>
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border/40 px-5 py-2 overflow-x-auto text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setFilter('priority')}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            filter === 'priority'
              ? 'bg-muted text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Fokus Prioritas ({priorityCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('in_progress')}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-muted text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          In Progress ({tasks.filter((t) => t.status === 'in_progress').length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('done')}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            filter === 'done'
              ? 'bg-muted text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Selesai ({doneCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            filter === 'all'
              ? 'bg-muted text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Semua ({tasks.length})
        </button>
      </div>

      {/* Task Rows */}
      <div className="p-4 sm:p-5">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {filter === 'priority'
                ? 'Semua misi prioritas telah tuntas! 🚀'
                : 'Tidak ada misi di tab ini'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {filter === 'priority'
                ? 'Tidak ada blocker atau tugas mendesak saat ini. Kamu bisa lanjut ke sprint backlog atau rehat sejenak.'
                : 'Pilih tab lain atau tambahkan tugas baru.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.slice(0, 5).map((task) => {
              const isDone = task.status === 'done';
              const isUrgent = task.priority === 'urgent';
              const isHigh = task.priority === 'high';

              return (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                    isDone
                      ? 'border-border/40 bg-muted/20 opacity-60'
                      : 'border-border/70 bg-surface hover:border-primary/40 hover:bg-muted/10'
                  }`}
                >
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className="text-muted-foreground hover:text-primary transition-transform active:scale-90 shrink-0 p-0.5"
                      aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="size-4.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium text-foreground truncate ${
                          isDone ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badges */}
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    {task.due_date && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground text-[10px]">
                        <Calendar className="size-3" />
                        <span>{formatDate(task.due_date, 'd MMM')}</span>
                      </span>
                    )}

                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border/60'
                      }`}
                    >
                      {isUrgent && <Flame className="inline-block mr-0.5 size-2.5 fill-current" />}
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
