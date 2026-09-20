'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Info, Briefcase, GraduationCap, AlertCircle, TrendingUp } from 'lucide-react';

export function KemnakerGuideBanner() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="rounded-[22px] border border-border bg-card p-4.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 font-bold">
            <Info className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                Panduan Laporan Harian Kemnaker MagangHub
              </span>
              <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[9px] font-bold">
                4 POIN RESMI
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Biar gak bingung, cukup ingat 4 poin: Pekerjaan, Pembelajaran, Kendala, dan Hasil.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs shrink-0"
        >
          <span>{isExpanded ? 'Tutup' : 'Lihat Detail'}</span>
          {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-border space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;Laporan harian bukan cuma formalitas. Justru dari sinilah progres belajarmu selama magang bisa terlihat.&rdquo; — Kemnaker RI
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-1">
            <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Briefcase className="size-3.5 text-primary" />
                <span>1. Apa dikerjakan?</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tulis tugas atau progres yang sudah diselesaikan hari ini.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <GraduationCap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>2. Apa dipelajari?</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Ceritakan skill atau pengetahuan baru yang didapatkan.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>3. Ada kendala?</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Tulis hambatan jelas untuk bahan diskusi mentor.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <TrendingUp className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>4. Apa hasilnya?</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Hasil atau bukti konkret dari aktivitas hari ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
