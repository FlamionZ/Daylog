'use client';

import * as React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DaylogQuickProgressCardProps {
  onSubmitProgress?: (text: string) => Promise<void> | void;
}

export function DaylogQuickProgressCard({ onSubmitProgress }: DaylogQuickProgressCardProps) {
  const [text, setText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    const trimmed = text.trim();
    setIsSubmitting(true);
    try {
      if (onSubmitProgress) {
        await onSubmitProgress(trimmed);
      } else {
        toast.success('Progress kecil berhasil dicatat!');
      }
      setText('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mencatat progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#FBE892] dark:bg-[#282208] p-6 text-[#3E340D] dark:text-[#FDE047] shadow-sm border border-[#ECCF69] dark:border-[#524410] flex flex-col justify-between min-h-[160px] transition-all hover:shadow-md">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold tracking-tight text-[#3E340D] dark:text-[#FDE047]">
          Apa progress kecilmu hari ini?
        </h3>
        <span className="rounded-md bg-black/10 dark:bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#3E340D]/80 dark:text-[#FDE047]/80">
          ⌘ K
        </span>
      </div>

      {/* Input row with round black submit button */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          placeholder="Tulis satu hal yang selesai..."
          className="w-full rounded-full border border-black/15 dark:border-[#524410] bg-white/90 dark:bg-black/40 px-4 py-2.5 text-xs text-[#2C2A26] dark:text-[#FDE047] placeholder:text-[#3E340D]/50 dark:placeholder:text-[#FDE047]/50 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 shadow-2xs disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black dark:bg-[#FDE047] text-white dark:text-[#282208] shadow-xs transition-all hover:bg-black/85 dark:hover:bg-[#FDE047]/90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4 stroke-[2.5]" />
          )}
        </button>
      </form>
    </div>
  );
}
