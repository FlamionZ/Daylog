'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface KemnakerChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function KemnakerChecklistModal({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: KemnakerChecklistModalProps) {
  const [check1, setCheck1] = React.useState(true);
  const [check2, setCheck2] = React.useState(true);
  const [check3, setCheck3] = React.useState(true);

  const allChecked = check1 && check2 && check3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-4.5 text-primary" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              Standar Kemnaker MagangHub
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Sebelum Klik Selesaikan, Coba Cek Lagi!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuai panduan resmi Kementerian Ketenagakerjaan RI untuk peserta MagangHub:
          </DialogDescription>
        </DialogHeader>

        {/* Checklist items */}
        <div className="space-y-3 py-3">
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 transition-colors hover:border-primary/40">
            <Checkbox
              id="kemnaker-check-1"
              checked={check1}
              onCheckedChange={(checked: boolean) => setCheck1(Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="kemnaker-check-1" className="text-xs font-semibold text-foreground cursor-pointer">
                Laporannya sudah sesuai dengan kegiatan hari ini
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Tugas dan aktivitas yang dicatat benar-benar dikerjakan pada hari ini.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 transition-colors hover:border-primary/40">
            <Checkbox
              id="kemnaker-check-2"
              checked={check2}
              onCheckedChange={(checked: boolean) => setCheck2(Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="kemnaker-check-2" className="text-xs font-semibold text-foreground cursor-pointer">
                Ditulis dengan jelas, bukan sekadar satu atau dua kata
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Deskripsi pekerjaan, kendala, dan hasil memiliki konteks yang memadai.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 transition-colors hover:border-primary/40">
            <Checkbox
              id="kemnaker-check-3"
              checked={check3}
              onCheckedChange={(checked: boolean) => setCheck3(Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="kemnaker-check-3" className="text-xs font-semibold text-foreground cursor-pointer">
                Sudah memastikan tidak ada informasi yang terlewat
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Termasuk kendala yang dihadapi agar bisa menjadi bahan diskusi dengan mentor.
              </p>
            </div>
          </div>

          {/* Kemnaker Reminder Note */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground block mb-0.5">
              Ingat ya, Rekanaker!
            </span>
            Biasakan isi laporan harian sebelum menutup hari kerja, lalu pastikan laporanmu sudah siap untuk divalidasi mentor sesuai mekanisme yang berlaku.
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs"
          >
            Cek Lagi
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={!allChecked || isPending}
            className="text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>Ya, Selesaikan Laporan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
