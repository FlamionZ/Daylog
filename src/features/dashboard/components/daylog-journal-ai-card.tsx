'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JournalRecord } from '@/features/journals/actions/journal-actions';

interface DaylogJournalAiCardProps {
  latestJournal?: JournalRecord | null;
  onOpenAiAssistant?: () => void;
}

export function DaylogJournalAiCard({
  latestJournal,
  onOpenAiAssistant,
}: DaylogJournalAiCardProps) {
  const hasJournal = !!latestJournal;

  const title = hasJournal
    ? latestJournal.title
    : 'Belum ada catatan jurnal';

  const summary = hasJournal
    ? latestJournal.summary || (latestJournal.activities ? latestJournal.activities.slice(0, 120) + '...' : 'Belum ada ringkasan jurnal.')
    : 'Refleksikan aktivitas magang dan hasil kerjamu hari ini. Kamu bisa merapikannya dengan asistensi AI.';

  const dateText = hasJournal && latestJournal.journal_date
    ? new Date(latestJournal.journal_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
    : 'Hari ini';

  const statusText = hasJournal
    ? latestJournal.status === 'completed'
      ? 'Selesai'
      : 'Draft'
    : 'Belum diisi';

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#DED8FA] dark:bg-[#1C1530] p-6 text-[#2B1E4A] dark:text-[#DDD6FE] shadow-sm border border-[#C6B8F5] dark:border-[#382B5E] flex flex-col justify-between min-h-[160px] transition-all hover:shadow-md">
      {/* Sparkle doodle in top right */}
      <svg
        className="pointer-events-none absolute right-5 top-5 h-8 w-8 text-[#2B1E4A]/40 dark:text-[#DDD6FE]/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
      </svg>

      {/* Main Content */}
      <div className="pr-10">
        <h3 className="text-lg font-bold tracking-tight text-[#2B1E4A] dark:text-[#DDD6FE] line-clamp-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-[#2B1E4A]/80 dark:text-[#DDD6FE]/80 mt-1 line-clamp-2">
          {summary}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#2B1E4A]/10 dark:border-[#DDD6FE]/15">
        <span className="text-xs font-semibold text-[#2B1E4A]/70 dark:text-[#DDD6FE]/70">
          {dateText} · {statusText}
        </span>

        {hasJournal ? (
          <Link
            href="/assistant"
            onClick={(e) => {
              if (onOpenAiAssistant) {
                e.preventDefault();
                onOpenAiAssistant();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B1E4A] dark:text-[#DDD6FE] hover:text-black dark:hover:text-white transition-colors group"
          >
            <span>Rapikan dengan AI</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            href="/journals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B1E4A] dark:text-[#DDD6FE] hover:text-black dark:hover:text-white transition-colors group"
          >
            <span>Tulis Jurnal Sekarang</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
