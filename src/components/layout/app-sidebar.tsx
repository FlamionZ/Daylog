'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/browser';
import {
  CalendarDays,
  MapPin,
  BookOpen,
  CheckSquare,
  GraduationCap,
  BarChart2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

import { InstallButton } from '@/components/pwa/install-banner';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  highlight?: boolean;
}

const navItems: readonly NavItem[] = [
  { href: '/dashboard', label: 'Hari ini', icon: CalendarDays },
  { href: '/attendance', label: 'Kehadiran', icon: MapPin },
  { href: '/journals', label: 'Jurnal', icon: BookOpen },
  { href: '/tasks', label: 'Tugas', icon: CheckSquare },
  { href: '/learnings', label: 'Belajar', icon: GraduationCap },
  { href: '/reports', label: 'Laporan', icon: BarChart2 },
  { href: '/assistant', label: 'Asisten AI', icon: Sparkles, highlight: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState<string>('Peserta');
  const [initials, setInitials] = React.useState<string>('P');
  const [attendanceCount, setAttendanceCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Peserta';
        setUserName(name);
        const parts = name.trim().split(/\s+/);
        const inits = parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : parts[0].slice(0, 2).toUpperCase();
        setInitials(inits);

        supabase
          .from('attendance_records')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .then(({ count }) => {
            setAttendanceCount(count ?? 0);
          });
      }
    });
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-dvh w-60 flex-col border-r border-border bg-[#F7F4EE] dark:bg-[#080C12] select-none lg:flex"
      role="navigation"
      aria-label="Navigasi utama"
    >
      {/* 1. Header / Daylog Brand Mark */}
      <div className="flex flex-col px-6 pt-7 pb-6">
        <div className="flex items-center gap-3">
          {/* 4-square logo icon */}
          <div className="grid grid-cols-2 gap-1 size-6.5 shrink-0">
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground font-sans">
            daylog
          </span>
        </div>
      </div>

      {/* 2. Navigation Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#6284EB] dark:bg-[#3B82F6] font-semibold text-white shadow-xs'
                  : item.highlight
                    ? 'text-[#2B1E4A] dark:text-[#D4C8F4] hover:bg-[#DED8FA]/60 dark:hover:bg-[#2D2544]/60'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={cn(
                    'size-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                    isActive ? 'text-white' : item.highlight ? 'text-[#7B61FF] dark:text-[#A78BFA]' : 'text-muted-foreground',
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="rounded-full bg-[#DED8FA] dark:bg-[#2D2544] px-2 py-0.5 text-[9px] font-extrabold text-[#2B1E4A] dark:text-[#A78BFA] uppercase tracking-wider">
                  Gemini
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / User & Consistency Badge */}
      <div className="p-4 space-y-2.5">
        {/* PWA Install Button */}
        <InstallButton className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-[#6284EB] dark:hover:bg-[#3B82F6] hover:text-white transition-all cursor-pointer" />

        {/* Consistency Pill */}
        <div className="flex items-center justify-between rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs">
          <span>
            {attendanceCount === null
              ? 'Konsisten magang'
              : attendanceCount > 0
                ? `${attendanceCount} hari konsisten`
                : 'Mulai konsisten hari ini'}
          </span>
          <span className="size-2 rounded-full bg-[#6284EB] dark:bg-[#3B82F6]" />
        </div>

        {/* User Info & Settings */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-[#DDE7FE] dark:bg-[#1E2D4A] text-xs font-bold text-[#3B66E8] dark:text-[#60A5FA]">
              {initials}
            </div>
            <span className="truncate text-sm font-semibold text-foreground">
              {userName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60 transition-colors"
              title="Pengaturan"
            >
              <Settings className="size-4" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
