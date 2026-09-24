'use client';

import * as React from 'react';
import Link from 'next/link';

import type { ReportRecord } from '@/features/reports/actions/report-actions';
import { nextFriday, isFriday, format } from 'date-fns';

interface DaylogReportCardProps {
  reports?: ReportRecord[];
  onOpenReport?: () => void;
}

export function DaylogReportCard({ reports = [], onOpenReport }: DaylogReportCardProps) {
  const now = new Date();

  // Find next Friday deadline (weekly reports)
  const fridayDate = isFriday(now) ? now : nextFriday(now);
  const diffDays = Math.round((fridayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let dayLabel = 'Jumat';
  if (isFriday(now)) {
    dayLabel = 'Hari Ini';
  } else if (diffDays === 1) {
    dayLabel = 'Besok';
  }

  const deadlineDateStr = format(fridayDate, 'd MMM');

  // Check if a weekly report exists
  const latestWeeklyReport = reports.find((r) => r.report_type === 'weekly') || reports[0] || null;
  const isFinalized = latestWeeklyReport?.status === 'final';
  const hasDraft = latestWeeklyReport && !isFinalized;

  const titleText = isFinalized
    ? 'Laporan terkirim'
    : hasDraft
      ? 'Draf laporan siap'
      : 'Laporan mingguan';

  const subText = isFinalized
    ? 'Minggu ini beres ✓'
    : `Tenggat ${deadlineDateStr}`;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#F8C39E] dark:bg-[#2A170A] p-5 text-[#4A240E] dark:text-[#FDBA74] shadow-sm border border-[#E7AA80] dark:border-[#522910] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Doodle curved arrow pointing from 17:00 down */}
      <svg
        className="pointer-events-none absolute right-4 top-8 h-16 w-16 text-[#4A240E]/60 dark:text-[#FDBA74]/50"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 45 10 C 45 35, 20 25, 20 45" />
        <path d="M 12 37 L 20 45 L 28 37" />
      </svg>

      {/* Top section: Day Label & Big Time */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#4A240E]/75 dark:text-[#FDBA74]/75 block">
          {dayLabel}
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4A240E] dark:text-[#FDBA74] font-mono leading-none mt-1">
          17:00
        </div>
      </div>

      {/* Bottom section: Title & Buka */}
      <div className="flex items-end justify-between pt-4">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#4A240E] dark:text-[#FDBA74]">
            {titleText}
          </h4>
          <p className="text-xs font-medium text-[#4A240E]/75 dark:text-[#FDBA74]/75">
            {subText}
          </p>
        </div>

        <Link
          href="/reports"
          onClick={(e) => {
            if (onOpenReport) {
              e.preventDefault();
              onOpenReport();
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-4 py-1.5 text-xs font-bold text-[#4A240E] dark:text-[#FDBA74] transition-all active:scale-95"
        >
          {hasDraft ? 'Lanjutkan' : 'Buka'}
        </Link>
      </div>
    </div>
  );
}
