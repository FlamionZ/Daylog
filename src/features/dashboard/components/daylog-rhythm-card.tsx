'use client';

import * as React from 'react';

import type { JournalRecord } from '@/features/journals/actions/journal-actions';
import { startOfWeek, addDays, isSameDay } from 'date-fns';

interface DaylogRhythmCardProps {
  journals?: JournalRecord[];
  completedJournalsCount?: number;
  totalTarget?: number;
}

export function DaylogRhythmCard({
  journals = [],
  completedJournalsCount,
  totalTarget = 5,
}: DaylogRhythmCardProps) {
  const now = new Date();
  // Monday as start of week
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  // Calculate real week days: Senin (M) to Minggu (S)
  const pillColors = [
    'bg-[#56A2E8]', // Sen
    'bg-[#8ED2B2]', // Sel
    'bg-[#F3D17A]', // Rab
    'bg-[#D1C7F7]', // Kam
    'bg-[#BCABEE]', // Jum
    'bg-[#F3B28A]', // Sab
    'bg-[#708DF2]', // Min
  ];

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayDate = addDays(weekStart, i);
    const dayJournals = journals.filter((j) => {
      if (!j.journal_date) return false;
      const jDate = new Date(j.journal_date);
      return isSameDay(jDate, dayDate);
    });

    const isCompleted = dayJournals.some((j) => j.status === 'completed');
    const isDraft = dayJournals.length > 0;
    const isToday = isSameDay(dayDate, now);

    let fill = 0;
    if (isCompleted) {
      fill = 100;
    } else if (isDraft) {
      fill = 50;
    } else if (isToday) {
      fill = 15;
    }

    return {
      label: dayLabels[i],
      date: dayDate,
      fill,
      color: pillColors[i],
      isToday,
      isCompleted,
    };
  });

  const realCompletedCount =
    completedJournalsCount !== undefined
      ? completedJournalsCount
      : days.filter((d) => d.isCompleted).length;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-card p-5 text-foreground shadow-sm border border-border flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Top row */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Ritme minggu ini
          </h3>
          <span className="rounded-full bg-muted/15 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {realCompletedCount}/{totalTarget} jurnal selesai
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {realCompletedCount === 0
            ? 'Belum ada jurnal minggu ini. Catat aktivitasmu!'
            : realCompletedCount >= totalTarget
              ? 'Luar biasa! Target jurnal minggu ini terpenuhi.'
              : `${realCompletedCount} dari ${totalTarget} jurnal minggu ini selesai.`}
        </p>
      </div>

      {/* 7 Colorful Capsule Bars */}
      <div className="flex items-end justify-between gap-2 pt-4 px-1">
        {days.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
            {/* Capsule Pill */}
            <div className="relative h-16 w-4 sm:w-5 rounded-full bg-muted/15 overflow-hidden flex items-end">
              <div
                className={`w-full rounded-full transition-all duration-500 ${d.color}`}
                style={{ height: `${d.fill}%` }}
              />
            </div>
            {/* Day Label */}
            <span
              className={`text-[11px] font-bold font-mono ${
                d.isToday ? 'text-primary underline decoration-2 underline-offset-2' : 'text-muted-foreground'
              }`}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
