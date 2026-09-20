'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Clock, MapPin, Building, Home, Briefcase, FileText, HeartPulse, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  checkInSchema,
  type CheckInInput,
  type workModes,
} from '../schemas/attendance-schema';
import { checkIn } from '../actions/attendance-actions';
import { formatTime, nowInJakarta } from '@/lib/date';

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultMode?: (typeof workModes)[number];
  defaultLocation?: string;
}

const modeOptions = [
  { id: 'wfo', label: 'WFO (Kantor)', icon: Building, desc: 'Bekerja dari kantor' },
  { id: 'wfh', label: 'WFH (Rumah)', icon: Home, desc: 'Bekerja dari rumah' },
  { id: 'hybrid', label: 'Hybrid', icon: Briefcase, desc: 'Kombinasi kantor & remote' },
  { id: 'sick', label: 'Sakit', icon: HeartPulse, desc: 'Tidak dapat hadir karena sakit' },
  { id: 'leave', label: 'Izin', icon: FileText, desc: 'Mengajukan izin resmi' },
  { id: 'holiday', label: 'Libur', icon: Sparkles, desc: 'Hari libur nasional / cuti bersama' },
] as const;

export function CheckInModal({
  open,
  onOpenChange,
  onSuccess,
  defaultMode = 'wfo',
  defaultLocation = 'Surakarta',
}: CheckInModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const currentTime = formatTime(nowInJakarta());

  const form = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      workMode: defaultMode,
      location: defaultLocation,
      notes: '',
    },
  });

  const selectedMode = useWatch({ control: form.control, name: 'workMode' }) || defaultMode;
  const isWork = ['wfo', 'wfh', 'hybrid'].includes(selectedMode);

  const handleSubmit = (data: CheckInInput) => {
    startTransition(async () => {
      const result = await checkIn(data);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal melakukan check-in');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pencatatan Kehadiran</DialogTitle>
          <DialogDescription>
            {isWork
              ? `Check-in pukul ${currentTime || 'sekarang'} (WIB)`
              : 'Catat status absensi hari ini'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label>Mode Kehadiran</Label>
            <div className="grid grid-cols-2 gap-2">
              {modeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => form.setValue('workMode', opt.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--accent))]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`size-4 ${
                          isSelected
                            ? 'text-[hsl(var(--primary))]'
                            : 'text-[hsl(var(--muted))]'
                        }`}
                      />
                      <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted))] line-clamp-1">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location (only for work modes) */}
          {isWork && (
            <div className="space-y-2">
              <Label htmlFor="checkin-location">Lokasi</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="checkin-location"
                  placeholder="Nama tempat / kantor"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('location')}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="checkin-notes">Catatan (Opsional)</Label>
            <Textarea
              id="checkin-notes"
              placeholder={
                isWork
                  ? 'Catatan khusus hari ini...'
                  : 'Keterangan izin/sakit/libur...'
              }
              disabled={isPending}
              {...form.register('notes')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isWork ? (
                <>
                  <Clock className="mr-2 size-4" />
                  Check-in Sekarang
                </>
              ) : (
                'Simpan Status'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
