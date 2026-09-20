'use client';

import * as React from 'react';
import Link from 'next/link';
import type { TaskRecord } from '@/features/tasks/actions/task-actions';

interface DaylogActiveTasksCardProps {
  tasks?: TaskRecord[];
  onOpenTasks?: () => void;
}

export function DaylogActiveTasksCard({ tasks = [], onOpenTasks }: DaylogActiveTasksCardProps) {
  // Default mock items matching the exact reference if real tasks are few
  const defaultItems = [
    {
      id: '1',
      title: 'API validation cleanup',
      status: 'Review',
      dueDate: '21 Sep',
      color: 'bg-[#7292F5]',
    },
    {
      id: '2',
      title: 'Authentication unit tests',
      status: 'Planned',
      dueDate: '25 Sep',
      color: 'bg-[#F3CE71]',
    },
    {
      id: '3',
      title: 'Update dokumentasi',
      status: 'Todo',
      dueDate: '26 Sep',
      color: 'bg-[#C1B2F2]',
    },
  ];

  // Map real tasks if available
  const displayItems =
    tasks.length > 0
      ? tasks.slice(0, 3).map((t, idx) => {
          const colors = ['bg-[#7292F5]', 'bg-[#F3CE71]', 'bg-[#C1B2F2]'];
          const statusLabels: Record<string, string> = {
            in_progress: 'Active',
            review: 'Review',
            todo: 'Todo',
            backlog: 'Planned',
            blocked: 'Blocked',
            done: 'Done',
          };
          return {
            id: t.id,
            title: t.title,
            status: statusLabels[t.status] || 'Todo',
            dueDate: t.due_date
              ? new Date(t.due_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })
              : `${21 + idx} Sep`,
            color: colors[idx % colors.length],
          };
        })
      : defaultItems;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-card p-5 text-foreground shadow-sm border border-border flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold tracking-tight text-foreground">
          Yang lagi jalan
        </h3>
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
          Lihat semua
        </Link>
      </div>

      {/* List */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`size-3.5 rounded-sm shrink-0 shadow-2xs ${item.color}`}
              />
              <span className="font-medium text-foreground truncate">
                {item.title}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-md bg-muted/15 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {item.status}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.dueDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
