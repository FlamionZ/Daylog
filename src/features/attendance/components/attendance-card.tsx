'use client';

import * as React from 'react';
import {
  Clock,
  HeartPulse,
  FileText,
  Sparkles,
  LogIn,
  LogOut,
  MapPin,
  CheckCircle2,
  Timer,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckInModal } from './check-in-modal';
import { CheckOutModal } from './check-out-modal';
import { toggleKemnakerAttendanceChecklist } from '../actions/attendance-actions';
import { isKemnakerSynced } from '../utils/kemnaker-sync';
import {
  formatTime,
  calculateWorkedMinutes,
  formatDuration,
  nowInJakarta,
} from '@/lib/date';

interface AttendanceCardProps {
  record?: {
    id: string;
    work_date: string;
    work_mode: string;
    check_in_at: string | null;
    check_out_at: string | null;
    break_minutes: number;
    location: string | null;
    notes: string | null;
  } | null;
  onRefresh?: () => void;
}

export function AttendanceCard({ record }: AttendanceCardProps) {
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);
  const [currentTimeStr, setCurrentTimeStr] = React.useState('');

  // Live ticking WIB time
  React.useEffect(() => {
    const updateTime = () => {
      const now = nowInJakarta();
      setCurrentTimeStr(formatTime(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = Boolean(record?.check_in_at);
  const isCheckedOut = Boolean(record?.check_out_at);
  const isSpecialMode = record && ['leave', 'sick', 'holiday'].includes(record.work_mode);

  // Calculate worked duration and target percentage (8 hours = 480 mins)
  const { workedDuration, progressPercentage } = React.useMemo(() => {
    if (!record?.check_in_at) {
      return { workedDuration: null, progressPercentage: 0 };
    }
    const start = new Date(record.check_in_at);
    const end = record.check_out_at ? new Date(record.check_out_at) : nowInJakarta();
    const minutes = calculateWorkedMinutes(start, end, record.break_minutes || 0);
    const pct = Math.min(100, Math.round((minutes / 480) * 100));
    return {
      workedDuration: formatDuration(minutes),
      progressPercentage: pct,
    };
  }, [record]);

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        {/* Top Cockpit Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-3.5 text-xs">
          <div className="flex items-center gap-2 font-mono text-muted-foreground">
            <Clock className="size-3.5 text-[#5D7FE8]" />
            <span className="font-semibold text-foreground">{currentTimeStr || '--:--'} WIB</span>
            <span>·</span>
            <span>{record?.work_date || 'Hari Kerja Aktif'}</span>
          </div>

          <div className="flex items-center gap-2">
            {isSpecialMode ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">
                {record?.work_mode}
              </span>
            ) : isCheckedIn && !isCheckedOut ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>Sedang Bekerja</span>
              </div>
            ) : isCheckedIn && isCheckedOut ? (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                <CheckCircle2 className="size-3" />
                <span>Selesai Bekerja</span>
              </div>
            ) : (
              <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
                Belum Check-in
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* State 1: Not checked in */}
          {!record || (!isCheckedIn && !isSpecialMode) ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>Siap mulai sesi kerja hari ini?</span>
                  <Zap className="size-4 text-amber-500" />
                </h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Catat waktu kehadiranmu (WFO atau WFH) untuk memulai perhitungan durasi kerja harian.
                </p>
              </div>
              <button
                onClick={() => setCheckInOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0"
              >
                <LogIn className="size-4 stroke-[2.5]" />
                <span>Check-in Sekarang</span>
              </button>
            </div>
          ) : isSpecialMode ? (
            /* State 2: Special Mode (Sick/Leave/Holiday) */
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted/30 text-muted-foreground">
                  {record.work_mode === 'sick' && <HeartPulse className="size-5 text-destructive" />}
                  {record.work_mode === 'leave' && <FileText className="size-5 text-warning" />}
                  {record.work_mode === 'holiday' && <Sparkles className="size-5 text-info" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    Status: {record.work_mode === 'sick' ? 'Sakit' : record.work_mode === 'leave' ? 'Izin' : 'Libur'}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{record.notes}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCheckInOpen(true)}
              >
                Ubah Status
              </Button>
            </div>
          ) : (
            /* State 3: Working or Completed */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Check In */}
                <div className="rounded-[18px] border border-border bg-secondary/30 p-4 transition-colors">
                  <span className="text-[11px] font-bold text-muted-foreground block">Check-in</span>
                  <p className="mt-1 font-mono text-base font-extrabold text-foreground">
                    {record.check_in_at ? formatTime(new Date(record.check_in_at)) : '--:--'} <span className="text-[10px] font-normal text-muted-foreground">WIB</span>
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="size-2.5" />
                    {record.work_mode}
                  </span>
                </div>

                {/* Check Out */}
                <div className="rounded-[18px] border border-border bg-secondary/30 p-4 transition-colors">
                  <span className="text-[11px] font-bold text-muted-foreground block">Check-out</span>
                  <p className="mt-1 font-mono text-base font-extrabold text-foreground">
                    {record.check_out_at ? formatTime(new Date(record.check_out_at)) : '--:--'} <span className="text-[10px] font-normal text-muted-foreground">{record.check_out_at ? 'WIB' : 'Aktif'}</span>
                  </p>
                  <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
                    Istirahat: {record.break_minutes || 0}m
                  </span>
                </div>

                {/* Duration */}
                <div className="rounded-[18px] border border-emerald-500/30 bg-emerald-500/10 p-4 transition-colors">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Durasi Bersih</span>
                  <p className="mt-1 font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                    {workedDuration || '0 jam'}
                  </p>
                  <span className="mt-1 block text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                    {isCheckedOut ? 'Total Selesai' : 'Sedang Berjalan'}
                  </span>
                </div>

                {/* Action CTA */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                  {!isCheckedOut ? (
                    <button
                      onClick={() => setCheckOutOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <LogOut className="size-3.5 stroke-[2.5]" />
                      <span>Check-out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCheckInOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/15 transition-all"
                    >
                      Koreksi
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar towards 8 hours */}
              {!isCheckedOut && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      <Timer className="size-3 text-primary" /> Target Kerja Harian (8 Jam)
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 bg-secondary" />
                </div>
              )}

              {/* Kemnaker Portal Status & Quick Link */}
              <div className="flex flex-col gap-2 rounded-[20px] border border-border bg-secondary/30 p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground">Portal MagangHub Kemnaker: </span>
                    {record && isKemnakerSynced(record.notes) ? (
                      <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[11px] ml-1">
                        ✓ Sudah Diceklis di Web
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 text-[11px] ml-1">
                        ⏳ Belum Diceklis di Web
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record && (
                    <button
                      type="button"
                      onClick={async () => {
                        const currentSynced = isKemnakerSynced(record.notes);
                        const res = await toggleKemnakerAttendanceChecklist(record.id, !currentSynced);
                        if (res.success) {
                          toast.success(res.message);
                          window.location.reload();
                        } else {
                          toast.error(res.error || 'Gagal mengubah status');
                        }
                      }}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
                    >
                      {isKemnakerSynced(record.notes) ? 'Batalkan Status' : 'Tandai Diceklis'}
                    </button>
                  )}
                  <a
                    href="https://monev.maganghub.kemnaker.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1 text-[11px] font-bold transition-colors shadow-2xs"
                  >
                    <span>Buka Portal</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckInModal
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        defaultLocation={record?.location ?? undefined}
        onSuccess={() => window.location.reload()}
      />

      {record && (
        <CheckOutModal
          open={checkOutOpen}
          onOpenChange={setCheckOutOpen}
          checkInAt={record.check_in_at}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
