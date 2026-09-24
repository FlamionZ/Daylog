'use client';

import * as React from 'react';
import Link from 'next/link';
import type { TaskRecord } from '@/features/tasks/actions/task-actions';

interface DaylogFocusCardProps {
  activeTask?: TaskRecord | null;
  onOpenTasks?: () => void;
  onCreateTask?: () => void;
}

export function DaylogFocusCard({ activeTask, onOpenTasks, onCreateTask }: DaylogFocusCardProps) {
  // Real empty state if no active task
  if (!activeTask) {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-[#5D7FE8] dark:bg-[#1E2B58] p-6 text-white shadow-sm border border-[#486AD3] dark:border-[#2D3E7E] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
        {/* Playful doodle line in top right */}
        <svg
          className="pointer-events-none absolute right-4 top-2 h-20 w-28 text-white/20"
          viewBox="0 0 120 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <path d="M10 50 Q 40 10, 80 30 T 115 15" />
          <path d="M75 25 Q 95 45, 110 35" />
        </svg>

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-xs text-white">
            <span className="size-1.5 rounded-full bg-white/60" />
            Fokus Hari Ini
          </div>
        </div>

        {/* Center Title */}
        <div className="my-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
            Belum ada tugas aktif
          </h2>
          <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5">
            Mulai hari ini dengan membuat target atau tugas kerja baru.
          </p>
        </div>

        {/* Bottom Action */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-white/70">Workspace siap digunakan</span>
          <button
            type="button"
            onClick={onCreateTask || onOpenTasks}
            className="inline-flex items-center justify-center rounded-full bg-black dark:bg-white px-4 py-1.5 text-xs font-bold text-white dark:text-black shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            + Buat Tugas Baru
          </button>
        </div>
      </div>
    );
  }

  // Real Active Task Data
  const title = activeTask.title;
  const statusLabels: Record<string, string> = {
    in_progress: 'Sedang Dikerjakan',
    review: 'Dalam Review',
    todo: 'To Do',
    backlog: 'Backlog',
    blocked: 'Terkendala',
    done: 'Selesai',
  };
  const subtitle = `Task aktif · ${statusLabels[activeTask.status] || activeTask.status} · Prioritas ${activeTask.priority.toUpperCase()}`;
  const progressPercent =
    activeTask.status === 'done'
      ? 100
      : activeTask.status === 'review'
        ? 85
        : activeTask.status === 'in_progress'
          ? 50
          : activeTask.status === 'todo'
            ? 20
            : 0;

  const dueDate = activeTask.due_date
    ? new Date(activeTask.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : 'Tanpa tenggat';

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#5D7FE8] dark:bg-[#1E2B58] p-6 text-white shadow-sm border border-[#486AD3] dark:border-[#2D3E7E] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Playful doodle line in top right */}
      <svg
        className="pointer-events-none absolute right-4 top-2 h-20 w-28 text-white/25"
        viewBox="0 0 120 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <path d="M10 50 Q 40 10, 80 30 T 115 15" />
        <path d="M75 25 Q 95 45, 110 35" />
      </svg>

      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-xs text-white">
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
          Fokus Sekarang
        </div>
      </div>

      {/* Center Title */}
      <div className="my-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Progress track with thumb */}
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <span className="text-xs font-bold text-white/90 font-mono">{progressPercent}%</span>
          <div className="relative w-full h-1.5 rounded-full bg-black/20 overflow-visible flex items-center">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Slider thumb */}
            <div
              className="absolute size-3.5 rounded-full bg-black border-2 border-white shadow-xs -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta info & Action */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-medium text-white/85">{dueDate}</span>

          <Link
            href="/tasks"
            onClick={(e) => {
              if (onOpenTasks) {
                e.preventDefault();
                onOpenTasks();
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-black dark:bg-white px-4 py-1.5 text-xs font-bold text-white dark:text-black shadow-xs transition-transform hover:scale-105 active:scale-95"
          >
            Buka tugas
          </Link>
        </div>
      </div>
    </div>
  );
}
