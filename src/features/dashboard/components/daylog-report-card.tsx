'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import type { ReportRecord } from '@/features/reports/actions/report-actions';
import { formatDate } from '@/lib/date';

interface DaylogReportCardProps {
  reports?: ReportRecord[];
  onOpenReport?: () => void;
}

export function DaylogReportCard({ reports = [], onOpenReport }: DaylogReportCardProps) {
  const hasReports = reports && reports.length > 0;
  const latestReport = hasReports
    ? reports.find((r) => r.report_type === 'weekly') || reports[0]
    : null;

  // Real empty state when no report has been created yet
  if (!hasReports || !latestReport) {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-[#F8C39E] dark:bg-[#2A170A] p-5 text-[#4A240E] dark:text-[#FDBA74] shadow-sm border border-[#E7AA80] dark:border-[#522910] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
        {/* Subtle decorative document icon in top right */}
        <div className="pointer-events-none absolute right-4 top-4 text-[#4A240E]/15 dark:text-[#FDBA74]/15">
          <FileText className="size-16 stroke-[1.2]" />
        </div>

        {/* Top section */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A240E]/75 dark:text-[#FDBA74]/75 block">
            Laporan Magang
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#4A240E] dark:text-[#FDBA74] font-mono leading-none mt-1.5">
            0 Laporan
          </div>
        </div>

        {/* Bottom section: Empty state notice & Action */}
        <div className="flex items-end justify-between pt-4">
          <div className="max-w-[70%]">
            <h4 className="text-sm sm:text-base font-bold text-[#4A240E] dark:text-[#FDBA74] line-clamp-1">
              Belum ada laporan
            </h4>
            <p className="text-xs font-medium text-[#4A240E]/75 dark:text-[#FDBA74]/75 mt-0.5">
              Susun laporan mingguan dari jurnal & absensi
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
            className="inline-flex items-center gap-1.5 justify-center rounded-full bg-black/15 dark:bg-white/15 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-4 py-1.5 text-xs font-bold text-[#4A240E] dark:text-[#FDBA74] transition-all active:scale-95 shrink-0"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Buat</span>
          </Link>
        </div>
      </div>
    );
  }

  // Real report data from database
  const isFinalized = latestReport.status === 'final';
  const typeLabel =
    latestReport.report_type === 'weekly'
      ? 'Mingguan'
      : latestReport.report_type === 'monthly'
        ? 'Bulanan'
        : latestReport.report_type === 'final'
          ? 'Akhir'
          : 'Kustom';

  const badgeText = isFinalized ? `Laporan ${typeLabel} · Final` : `Draf Laporan ${typeLabel}`;
  const displayBigText = isFinalized ? 'Selesai' : 'Draf';
  const periodText =
    latestReport.period_start && latestReport.period_end
      ? `Periode ${formatDate(latestReport.period_start, 'd MMM')} – ${formatDate(latestReport.period_end, 'd MMM')}`
      : `Diperbarui ${formatDate(latestReport.updated_at, 'd MMM')}`;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#F8C39E] dark:bg-[#2A170A] p-5 text-[#4A240E] dark:text-[#FDBA74] shadow-sm border border-[#E7AA80] dark:border-[#522910] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Playful doodle document icon in top right */}
      <svg
        className="pointer-events-none absolute right-4 top-6 h-14 w-14 text-[#4A240E]/40 dark:text-[#FDBA74]/35"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 10 H45 V50 H15 Z" />
        <path d="M22 22 H38" />
        <path d="M22 30 H38" />
        <path d="M22 38 H32" />
      </svg>

      {/* Top section: Badge & Status */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#4A240E]/75 dark:text-[#FDBA74]/75 block">
          {badgeText}
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4A240E] dark:text-[#FDBA74] font-mono leading-none mt-1">
          {displayBigText}
        </div>
      </div>

      {/* Bottom section: Real title & Open CTA */}
      <div className="flex items-end justify-between pt-4">
        <div className="max-w-[70%]">
          <h4 className="text-sm sm:text-base font-bold text-[#4A240E] dark:text-[#FDBA74] truncate">
            {latestReport.title}
          </h4>
          <p className="text-xs font-medium text-[#4A240E]/75 dark:text-[#FDBA74]/75 truncate mt-0.5">
            {periodText}
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
          className="inline-flex items-center justify-center rounded-full bg-black/15 dark:bg-white/15 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-4 py-1.5 text-xs font-bold text-[#4A240E] dark:text-[#FDBA74] transition-all active:scale-95 shrink-0"
        >
          {isFinalized ? 'Lihat' : 'Lanjutkan'}
        </Link>
      </div>
    </div>
  );
}
