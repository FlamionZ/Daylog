'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  ListTodo,
  BookOpen,
  MoreHorizontal,
  GraduationCap,
  FileText,
  FolderOpen,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { InstallButton } from '@/components/pwa/install-banner';

/** Bottom nav items per design.md §4: Home, Attendance, Tasks, Journal, More */
const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/attendance', label: 'Kehadiran', icon: Clock },
  { href: '/tasks', label: 'Tugas', icon: ListTodo },
  { href: '/journals', label: 'Jurnal', icon: BookOpen },
] as const;

interface MoreMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  /** Light bg / dark bg */
  bg: string;
  /** Light icon color / dark icon color */
  iconColor: string;
  /** Light text / dark text */
  textColor: string;
}

/**
 * Each item gets a unique pastel bento-card color matching the Daylog dashboard aesthetic.
 * Dark variants use muted, deeper tones of the same hue family.
 */
const moreMenuItems: readonly MoreMenuItem[] = [
  {
    href: '/assistant',
    label: 'Asisten AI',
    icon: Sparkles,
    bg: 'bg-[#DED8FA] dark:bg-[#2D2544]',
    iconColor: 'text-[#7B61FF] dark:text-[#A78BFA]',
    textColor: 'text-[#2B1E4A] dark:text-[#D4C8F4]',
  },
  {
    href: '/learnings',
    label: 'Pembelajaran',
    icon: GraduationCap,
    bg: 'bg-[#BCE8D3] dark:bg-[#1A3329]',
    iconColor: 'text-[#1E8A5A] dark:text-[#34D399]',
    textColor: 'text-[#163A2B] dark:text-[#A7F3D0]',
  },
  {
    href: '/reports',
    label: 'Laporan',
    icon: FileText,
    bg: 'bg-[#DDE7FE] dark:bg-[#1E2D4A]',
    iconColor: 'text-[#3B66E8] dark:text-[#60A5FA]',
    textColor: 'text-[#1E3A8A] dark:text-[#BFDBFE]',
  },
  {
    href: '/documents',
    label: 'Dokumen',
    icon: FolderOpen,
    bg: 'bg-[#FBE892] dark:bg-[#3D3415]',
    iconColor: 'text-[#8B7000] dark:text-[#FACC15]',
    textColor: 'text-[#3E340D] dark:text-[#FDE68A]',
  },
  {
    href: '/settings',
    label: 'Pengaturan',
    icon: Settings,
    bg: 'bg-[#F8C39E] dark:bg-[#3D2413]',
    iconColor: 'text-[#B05E1A] dark:text-[#FB923C]',
    textColor: 'text-[#4A240E] dark:text-[#FED7AA]',
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreMenuItems.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More menu drawer — Daylog Parchment Style (light + dark) */}
      {moreOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-t-[24px] border-t border-border bg-[#F7F4EE] dark:bg-[#080C12] p-5 pb-6 shadow-2xl lg:hidden"
          role="dialog"
          aria-label="Menu lainnya"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between pb-3">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Menu Lainnya
            </span>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                aria-label="Tutup menu"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Menu Grid — Pastel Bento Cards */}
          <nav className="grid grid-cols-2 gap-2.5">
            {moreMenuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl p-3.5 text-sm font-semibold transition-all active:scale-[0.97]',
                    isActive
                      ? 'bg-[#6284EB] dark:bg-[#3B82F6] text-white shadow-sm ring-2 ring-[#6284EB]/30 dark:ring-[#3B82F6]/30'
                      : `${item.bg} ${item.textColor} hover:shadow-sm`,
                  )}
                >
                  <item.icon
                    className={cn(
                      'size-4.5 shrink-0',
                      isActive ? 'text-white' : item.iconColor,
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* PWA Install — Daylog Style */}
          <div className="mt-3.5">
            <InstallButton
              onAction={() => setMoreOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/60 py-3 text-sm font-bold text-foreground shadow-2xs hover:bg-[#6284EB] dark:hover:bg-[#3B82F6] hover:text-white hover:border-[#6284EB] dark:hover:border-[#3B82F6] transition-all cursor-pointer active:scale-[0.97]"
            />
          </div>
        </div>
      )}

      {/* Bottom nav bar — Daylog Parchment (light + dark) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#F7F4EE]/95 dark:bg-[#080C12]/95 backdrop-blur-md lg:hidden"
        role="navigation"
        aria-label="Navigasi mobile"
      >
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium transition-all active:scale-95',
                  isActive
                    ? 'font-semibold text-[#6284EB] dark:text-[#3B82F6]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="size-5 transition-transform duration-150" aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 size-1 rounded-full bg-[#6284EB] dark:bg-[#3B82F6]" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'relative flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium transition-all active:scale-95',
              isMoreActive || moreOpen
                ? 'font-semibold text-[#6284EB] dark:text-[#3B82F6]'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Menu lainnya"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
            <span>Lainnya</span>
            {(isMoreActive || moreOpen) && (
              <span className="absolute bottom-1.5 size-1 rounded-full bg-[#6284EB] dark:bg-[#3B82F6]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
