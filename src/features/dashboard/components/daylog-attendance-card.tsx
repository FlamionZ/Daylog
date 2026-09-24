'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import type { AttendanceRecord } from '@/features/attendance/actions/attendance-actions';

interface DaylogAttendanceCardProps {
  todayAttendance?: AttendanceRecord | null;
  onOpenCheckIn?: () => void;
  onOpenCheckOut?: () => void;
}

export function DaylogAttendanceCard({
  todayAttendance,
  onOpenCheckIn,
  onOpenCheckOut,
}: DaylogAttendanceCardProps) {
  const isCheckedIn = !!todayAttendance?.check_in_at;
  const isCheckedOut = !!todayAttendance?.check_out_at;

  const [activeTimeText, setActiveTimeText] = React.useState('00:00');
  const [daylightPercent, setDaylightPercent] = React.useState(50);

  // Live ticking calculation
  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date();

      // Calculate daylight percentage (06:00 to 18:00 WIB)
      const hours = now.getHours() + now.getMinutes() / 60;
      const progress = Math.max(0, Math.min(100, ((hours - 6) / 12) * 100));
      setDaylightPercent(progress);

      if (!todayAttendance?.check_in_at) {
        setActiveTimeText('00:00');
        return;
      }

      const checkInDate = new Date(todayAttendance.check_in_at);
      const endDate = todayAttendance.check_out_at
        ? new Date(todayAttendance.check_out_at)
        : now;

      const diffMs = endDate.getTime() - checkInDate.getTime();
      const breakMinutes = todayAttendance.break_minutes || 0;
      const totalMinutes = Math.max(0, Math.floor(diffMs / 60000) - breakMinutes);

      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      setActiveTimeText(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const mode = todayAttendance?.work_mode
    ? todayAttendance.work_mode.toUpperCase()
    : 'WFO';

  const checkInTime = todayAttendance?.check_in_at
    ? new Date(todayAttendance.check_in_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#BCE8D3] dark:bg-[#0F241A] p-5 text-[#163A2B] dark:text-[#9FE3C3] shadow-sm border border-[#A5D9C1] dark:border-[#1A3D2D] flex flex-col justify-between min-h-[195px] transition-all hover:shadow-md">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-[#163A2B] dark:text-[#9FE3C3] uppercase">
          Hari Ini
        </span>
        <span className="text-xs font-semibold text-[#163A2B]/80 dark:text-[#9FE3C3]/80">
          {isCheckedIn ? `${mode} · mulai ${checkInTime}` : 'Belum Check-in'}
        </span>
      </div>

      {/* Middle row: Big time + Check button */}
      <div className="flex items-center justify-between my-2">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#163A2B] dark:text-[#9FE3C3] font-mono leading-none">
            {activeTimeText}
          </div>
          <span className="text-xs font-semibold text-[#163A2B]/75 dark:text-[#9FE3C3]/75 mt-0.5 block">
            {isCheckedIn && !isCheckedOut
              ? 'jam aktif berjalan'
              : isCheckedOut
                ? 'total jam selesai'
                : 'jam aktif'}
          </span>
        </div>

        <Link
          href="/attendance"
          onClick={(e) => {
            if (!isCheckedIn && onOpenCheckIn) {
              e.preventDefault();
              onOpenCheckIn();
            } else if (isCheckedIn && !isCheckedOut && onOpenCheckOut) {
              e.preventDefault();
              onOpenCheckOut();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#163A2B]/35 dark:border-[#9FE3C3]/30 bg-white/40 dark:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#163A2B] dark:text-[#9FE3C3] backdrop-blur-xs transition-all hover:bg-white dark:hover:bg-white/20 hover:border-[#163A2B] dark:hover:border-[#9FE3C3] active:scale-95 shadow-2xs"
        >
          {isCheckedIn && !isCheckedOut ? 'Check out' : isCheckedOut ? 'Selesai ✓' : 'Check in'}
        </Link>
      </div>

      {/* Bottom row: Day/Night lighting slider */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#163A2B]/10 dark:border-[#9FE3C3]/15">
        <Sun className="size-3.5 text-[#163A2B]/70 dark:text-[#9FE3C3]/70 shrink-0" />
        <div className="relative w-full h-1 rounded-full bg-[#163A2B]/20 dark:bg-[#9FE3C3]/20 flex items-center">
          <div
            className="h-full rounded-full bg-[#163A2B]/60 dark:bg-[#9FE3C3]/60 transition-all duration-500"
            style={{ width: `${daylightPercent}%` }}
          />
          <div
            className="absolute size-2.5 rounded-full bg-[#163A2B] dark:bg-[#9FE3C3] -translate-x-1/2 transition-all duration-500"
            style={{ left: `${daylightPercent}%` }}
          />
        </div>
        <Moon className="size-3.5 text-[#163A2B]/70 dark:text-[#9FE3C3]/70 shrink-0" />
      </div>
    </div>
  );
}
