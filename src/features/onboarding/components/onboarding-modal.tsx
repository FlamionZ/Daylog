'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, Calendar, Clock, Loader2, MapPin, User, Mail } from 'lucide-react';
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
  createInternshipSchema,
  type CreateInternshipInput,
} from '../schemas/internship-schema';
import { createInternship } from '../actions/internship-actions';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultValues?: Partial<CreateInternshipInput>;
}

export function OnboardingModal({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
}: OnboardingModalProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateInternshipInput>({
    resolver: zodResolver(createInternshipSchema),
    defaultValues: {
      companyName: defaultValues?.companyName || 'PT. Tiga Serangkai Pustaka Mandiri',
      roleTitle:
        defaultValues?.roleTitle ||
        'Software Developer — Fullstack, Frontend, Backend, Mobile & Desktop',
      location: defaultValues?.location || 'KOTA SURAKARTA',
      mentorName: defaultValues?.mentorName || '',
      mentorContact: defaultValues?.mentorContact || '',
      startDate: defaultValues?.startDate || '2026-09-21',
      endDate: defaultValues?.endDate || '2027-03-20',
      defaultStartTime: defaultValues?.defaultStartTime || '08:00',
      defaultEndTime: defaultValues?.defaultEndTime || '17:00',
      notes:
        defaultValues?.notes ||
        'Program MagangHub Kemnaker RI — Periode 21 September 2026 s/d 20 Maret 2027.',
    },
  });

  const handleSubmit = (data: CreateInternshipInput) => {
    startTransition(async () => {
      const result = await createInternship(data);
      if (result.success) {
        toast.success('Profil program magang berhasil disimpan!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal menyimpan data magang');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Setup Program Magang</DialogTitle>
          <DialogDescription>
            Masukkan detail informasi tempat magang kamu untuk memulai pencatatan harian.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          {/* Company & Role */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Perusahaan / Instansi</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="companyName"
                  placeholder="PT Tiga Serangkai"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('companyName')}
                />
              </div>
              {form.formState.errors.companyName && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleTitle">Posisi / Divisi</Label>
              <Input
                id="roleTitle"
                placeholder="Software Developer Intern"
                disabled={isPending}
                {...form.register('roleTitle')}
              />
              {form.formState.errors.roleTitle && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.roleTitle.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi Kerja</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
              <Input
                id="location"
                placeholder="Surakarta, Jawa Tengah"
                className="pl-9"
                disabled={isPending}
                {...form.register('location')}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('startDate')}
                />
              </div>
              {form.formState.errors.startDate && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('endDate')}
                />
              </div>
              {form.formState.errors.endDate && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultStartTime">Jam Masuk Default</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="defaultStartTime"
                  type="time"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('defaultStartTime')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultEndTime">Jam Pulang Default</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="defaultEndTime"
                  type="time"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('defaultEndTime')}
                />
              </div>
            </div>
          </div>

          {/* Mentor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mentorName">Nama Mentor (Opsional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="mentorName"
                  placeholder="Nama pembimbing"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('mentorName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentorContact">Kontak Mentor (Opsional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="mentorContact"
                  placeholder="email@perusahaan.com"
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('mentorContact')}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Program</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan mengenai target atau divisi magang..."
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
              ) : (
                'Simpan Profil Magang'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
