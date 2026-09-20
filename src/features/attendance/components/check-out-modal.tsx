'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Clock, Coffee, BookOpen, Loader2 } from 'lucide-react';
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
  checkOutSchema,
  type CheckOutInput,
} from '../schemas/attendance-schema';
import { checkOut } from '../actions/attendance-actions';
import { formatTime, nowInJakarta, calculateWorkedMinutes, formatDuration } from '@/lib/date';

interface CheckOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkInAt?: string | null;
  onSuccess?: () => void;
}

export function CheckOutModal({
  open,
  onOpenChange,
  checkInAt,
  onSuccess,
}: CheckOutModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [redirectAfter, setRedirectAfter] = React.useState(false);
  const currentTime = formatTime(nowInJakarta());

  const form = useForm<CheckOutInput>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      breakMinutes: 60,
      notes: '',
    },
  });

  const breakMinutes = useWatch({ control: form.control, name: 'breakMinutes' }) || 0;

  // Calculate estimated total worked minutes
  const estimatedDuration = React.useMemo(() => {
    if (!checkInAt) return '0 jam 0 menit';
    const now = nowInJakarta();
    const minutes = calculateWorkedMinutes(new Date(checkInAt), now, Number(breakMinutes));
    return formatDuration(minutes);
  }, [checkInAt, breakMinutes]);

  const handleSubmit = (data: CheckOutInput, shouldRedirectToJournal = false) => {
    setRedirectAfter(shouldRedirectToJournal);
    startTransition(async () => {
      const result = await checkOut(data);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
        if (shouldRedirectToJournal) {
          router.push('/journals');
        }
      } else {
        toast.error(result.error || 'Gagal melakukan check-out');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Check-out</DialogTitle>
          <DialogDescription>
            Selesaikan jam kerja hari ini dan rekap durasi aktivitasmu.
          </DialogDescription>
        </DialogHeader>

        {/* Working duration summary card */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--muted))]">Jam Check-in:</span>
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {checkInAt ? formatTime(new Date(checkInAt)) : '-'} WIB
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--muted))]">Jam Check-out:</span>
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {currentTime || formatTime(nowInJakarta())} WIB
            </span>
          </div>
          <div className="mt-3 border-t border-[hsl(var(--border))] pt-3 flex items-center justify-between text-sm">
            <span className="font-medium text-[hsl(var(--foreground))]">
              Estimasi Jam Kerja Bersih:
            </span>
            <span className="font-bold text-[hsl(var(--primary))]">
              {estimatedDuration}
            </span>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit((d) => handleSubmit(d, false))}
          className="space-y-4 pt-1"
        >
          {/* Break Duration */}
          <div className="space-y-2">
            <Label htmlFor="checkout-break">Durasi Istirahat (Menit)</Label>
            <div className="relative">
              <Coffee className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
              <Input
                id="checkout-break"
                type="number"
                min="0"
                step="5"
                placeholder="60"
                className="pl-9"
                disabled={isPending}
                {...form.register('breakMinutes')}
              />
            </div>
            <p className="text-xs text-[hsl(var(--muted))]">
              Standar istirahat kerja penuh adalah 60 menit.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="checkout-notes">Catatan Hari Ini (Opsional)</Label>
            <Textarea
              id="checkout-notes"
              placeholder="Ringkasan singkat atau pesan sebelum menutup hari..."
              disabled={isPending}
              {...form.register('notes')}
            />
          </div>

          <div className="flex flex-col gap-2 pt-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending && !redirectAfter ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Clock className="mr-2 size-4" />
                  Check-out Sekarang
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={form.handleSubmit((d) => handleSubmit(d, true))}
            >
              {isPending && redirectAfter ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Membuka Jurnal...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 size-4" />
                  Check-out & Buat Jurnal Hari Ini
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
