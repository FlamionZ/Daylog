'use client';

import * as React from 'react';

interface DaylogRhythmCardProps {
  completedJournalsCount?: number;
  totalTarget?: number;
}

export function DaylogRhythmCard({
  completedJournalsCount = 4,
  totalTarget = 5,
}: DaylogRhythmCardProps) {
  // Days of week and their pill colors
  const days = [
    { label: 'S', name: 'Minggu', fill: 80, color: 'bg-[#708DF2]' },
    { label: 'M', name: 'Senin', fill: 45, color: 'bg-[#56A2E8]' },
    { label: 'T', name: 'Selasa', fill: 90, color: 'bg-[#8ED2B2]' },
    { label: 'W', name: 'Rabu', fill: 75, color: 'bg-[#F3D17A]' },
    { label: 'T', name: 'Kamis', fill: 60, color: 'bg-[#D1C7F7]' },
    { label: 'F', name: 'Jumat', fill: 85, color: 'bg-[#BCABEE]' },
    { label: 'S', name: 'Sabtu', fill: 70, color: 'bg-[#F3B28A]' },
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-card p-5 text-foreground shadow-sm border border-border flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Top row */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Ritme minggu ini
          </h3>
          <span className="rounded-full bg-muted/15 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {completedJournalsCount}/{totalTarget} jurnal selesai
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {completedJournalsCount >= totalTarget
            ? 'Hebat! Semua jurnal minggu ini terpenuhi.'
            : 'Nice, tinggal satu lagi.'}
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
            <span className="text-[11px] font-bold text-muted-foreground font-mono">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
