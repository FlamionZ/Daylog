'use client';

import * as React from 'react';
import Link from 'next/link';
import type { TaskRecord } from '@/features/tasks/actions/task-actions';

import { Plus, ListTodo } from 'lucide-react';

interface DaylogActiveTasksCardProps {
  tasks?: TaskRecord[];
  onOpenTasks?: () => void;
  onCreateTask?: () => void;
}

export function DaylogActiveTasksCard({
  tasks = [],
  onOpenTasks,
  onCreateTask,
}: DaylogActiveTasksCardProps) {
  // Filter and prioritize active (non-done) tasks
  const activeTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const order = { in_progress: 1, review: 2, todo: 3, backlog: 4, blocked: 5, done: 6 };
      return (order[a.status] || 99) - (order[b.status] || 99);
    })
    .slice(0, 3);

  const colors = ['bg-[#7292F5]', 'bg-[#F3CE71]', 'bg-[#C1B2F2]'];
  const statusLabels: Record<string, string> = {
    in_progress: 'Active',
    review: 'Review',
    todo: 'Todo',
    backlog: 'Planned',
    blocked: 'Blocked',
    done: 'Done',
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-card p-5 text-foreground shadow-sm border border-border flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold tracking-tight text-foreground">
          Yang lagi jalan
        </h3>
        {tasks.length > 0 && (
          <Link
            href="/tasks"
            onClick={(e) => {
              if (onOpenTasks) {
                e.preventDefault();
                onOpenTasks();
              }
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Lihat semua ({tasks.length})
          </Link>
        )}
      </div>

      {/* List or Empty State */}
      {activeTasks.length > 0 ? (
        <div className="space-y-2.5 flex-1 flex flex-col justify-center">
          {activeTasks.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`size-3.5 rounded-sm shrink-0 shadow-2xs ${colors[idx % colors.length]}`}
                />
                <span className="font-medium text-foreground truncate">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="rounded-md bg-muted/15 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {statusLabels[item.status] || 'Todo'}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {item.due_date
                    ? new Date(item.due_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
          <div className="size-8 rounded-full bg-muted/15 flex items-center justify-center text-muted-foreground mb-1.5">
            <ListTodo className="size-4" />
          </div>
          <p className="text-xs font-semibold text-foreground">Belum ada tugas aktif</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mulai kelola deliverable magangmu di sini.
          </p>
          <button
            type="button"
            onClick={onCreateTask || onOpenTasks}
            className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] font-bold text-foreground hover:bg-secondary transition-all cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Tambah tugas</span>
          </button>
        </div>
      )}
    </div>
  );
}
