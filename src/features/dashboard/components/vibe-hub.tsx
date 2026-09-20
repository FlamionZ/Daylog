'use client';

import * as React from 'react';
import { Flame, Trophy } from 'lucide-react';

export type DevVibe = 'deep_work' | 'caffeinated' | 'shipping' | 'debugging' | 'lofi';

export interface VibeConfig {
  id: DevVibe;
  label: string;
  icon: string;
  badgeClass: string;
  motto: string;
}

export const VIBES: VibeConfig[] = [
  {
    id: 'deep_work',
    label: 'Deep Work',
    icon: '⚡',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    motto: 'Mode fokus penuh tanpa distraksi. Kode bersih, logika tajam.',
  },
  {
    id: 'caffeinated',
    label: 'Caffeinated',
    icon: '☕',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    motto: 'Kafein terisi penuh, siap babat issue dan sprint backlog.',
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: '🚀',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    motto: 'PR sudah approved, unit test hijau, siap push to production.',
  },
  {
    id: 'debugging',
    label: 'Bug Hunting',
    icon: '🧠',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    motto: 'Menelusuri stack trace dan edge cases sampai ke akarnya.',
  },
  {
    id: 'lofi',
    label: 'Lo-Fi Chill',
    icon: '🎧',
    badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    motto: 'Beat santai, flow terjaga, refactoring bertahap.',
  },
];

interface VibeHubProps {
  userName: string;
  roleTitle: string;
  companyName: string;
  tasksDoneCount: number;
  journalsCount: number;
  learningsCount: number;
}

export function VibeHub({
  userName,
  roleTitle,
  companyName,
  tasksDoneCount,
  journalsCount,
  learningsCount,
}: VibeHubProps) {
  const [activeVibeId, setActiveVibeId] = React.useState<DevVibe>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('intern_active_vibe') as DevVibe | null;
        if (saved && VIBES.some((v) => v.id === saved)) {
          return saved;
        }
      } catch {
        // localStorage may be unavailable
      }
    }
    return 'deep_work';
  });
  const [streakCount] = React.useState(() => Math.max(1, Math.min(14, journalsCount + 1)));

  const handleSelectVibe = (id: DevVibe) => {
    setActiveVibeId(id);
    try {
      localStorage.setItem('intern_active_vibe', id);
    } catch {
      // localStorage may be unavailable
    }
  };

  const activeVibe = VIBES.find((v) => v.id === activeVibeId) || VIBES[0];

  // Calculate real gamified developer rank & XP
  const { level, rankTitle, currentXP, nextLevelXP, levelProgressPct } = React.useMemo(() => {
    const xp = (tasksDoneCount * 50) + (journalsCount * 100) + (learningsCount * 75);
    const lvl = Math.max(1, Math.floor(xp / 300) + 1);
    const nextXP = lvl * 300;
    const baseXP = (lvl - 1) * 300;
    const pct = Math.min(100, Math.max(0, Math.round(((xp - baseXP) / 300) * 100)));

    const titles: Record<number, string> = {
      1: 'Junior Intern',
      2: 'Code Crafter',
      3: 'Fullstack Apprentice',
      4: 'Feature Architect',
      5: 'Senior Intern Hero',
    };

    return {
      level: lvl,
      rankTitle: titles[lvl] || 'Lead Tech Intern',
      currentXP: xp,
      nextLevelXP: nextXP,
      levelProgressPct: pct,
    };
  }, [tasksDoneCount, journalsCount, learningsCount]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: User Identity + Vibe Motto */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Halo, {userName}
            </h1>
            <span className="text-lg">✨</span>

            {/* Active Vibe Pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${activeVibe.badgeClass}`}
            >
              <span>{activeVibe.icon}</span>
              <span>{activeVibe.label}</span>
            </span>

            {/* Streak Badge */}
            <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              <Flame className="size-3.5 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{streakCount}d Streak</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{roleTitle}</span>
            <span>•</span>
            <span>{companyName}</span>
          </p>

          <p className="text-xs text-muted-foreground/90 italic">
            &ldquo;{activeVibe.motto}&rdquo;
          </p>

          {/* Vibe Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground mr-1">
              Vibe Hari Ini:
            </span>
            {VIBES.map((v) => {
              const isSelected = v.id === activeVibeId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVibe(v.id)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    isSelected
                      ? `${v.badgeClass} font-semibold ring-1 ring-primary/30 shadow-2xs`
                      : 'border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <span>{v.icon}</span>
                  <span className="text-[11px]">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Gamified Level & XP Card */}
        <div className="shrink-0 rounded-xl border border-border/70 bg-muted/20 p-4 min-w-[260px] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground">
                Lv.{level} {rankTitle}
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground font-semibold">
              {currentXP} XP
            </span>
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{levelProgressPct}% ke Level {level + 1}</span>
              <span>{nextLevelXP - currentXP} XP lagi</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80 pt-0.5 border-t border-border/40">
            <span>+{tasksDoneCount * 50} dari Tugas</span>
            <span>+{journalsCount * 100} dari Jurnal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
