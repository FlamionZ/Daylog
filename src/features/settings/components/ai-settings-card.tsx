'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getAIUsageStatsAction,
  updateAIPreferencesAction,
  clearAIHistoryAction,
  type AIUsageStats,
} from '@/features/ai/actions/ai-actions';

interface AISettingsCardProps {
  initialStats?: AIUsageStats | null;
}

export function AISettingsCard({ initialStats }: AISettingsCardProps) {
  const [stats, setStats] = React.useState<AIUsageStats | null>(initialStats ?? null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(!initialStats);
  const [isUpdatingPref, startPrefTransition] = React.useTransition();
  const [isClearingHistory, startClearTransition] = React.useTransition();
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);

  // Fetch stats on mount if not provided
  React.useEffect(() => {
    if (!initialStats) {
      getAIUsageStatsAction().then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
        setIsLoadingStats(false);
      });
    }
  }, [initialStats]);

  const saveHistory = stats?.preferences?.saveHistory ?? false;
  const usage = stats?.usage;
  const currentRequests = usage?.currentRequests ?? 0;
  const limit = usage?.limit ?? 50;
  const percentage = Math.min(100, Math.round((currentRequests / limit) * 100));

  const handleToggleSaveHistory = () => {
    const nextVal = !saveHistory;
    startPrefTransition(async () => {
      const res = await updateAIPreferencesAction({ saveHistory: nextVal });
      if (res.success && res.data) {
        setStats((prev) =>
          prev
            ? { ...prev, preferences: res.data! }
            : null,
        );
        toast.success(
          nextVal
            ? 'Penyimpanan riwayat AI diaktifkan.'
            : 'Penyimpanan riwayat AI dimatikan (mode privasi maksimal).',
        );
      } else {
        toast.error(res.error || 'Gagal memperbarui preferensi AI.');
      }
    });
  };

  const handleClearHistory = () => {
    startClearTransition(async () => {
      const res = await clearAIHistoryAction();
      if (res.success) {
        toast.success('Semua riwayat generasi AI berhasil dibersihkan.');
        setConfirmClearOpen(false);
      } else {
        toast.error(res.error || 'Gagal membersihkan riwayat AI.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Privacy & Guarantees */}
      <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                <Sparkles className="size-4" />
              </div>
              <CardTitle className="text-lg font-extrabold text-foreground">Asisten Magang AI</CardTitle>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 border border-border px-2.5 py-0.5 text-xs font-bold text-foreground font-mono">
              <Zap className="size-3 text-amber-500 fill-amber-500" />
              <span>{stats?.model || 'gemini-2.5-flash'}</span>
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Konfigurasi preferensi privasi, penyimpanan riwayat, dan pantau kuota pemakaian harian.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 p-4.5 text-foreground">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                  Jaminan Privasi & Keamanan Ketat
                </p>
                <p className="text-foreground/85">
                  Semua data masukan disaring terlebih dahulu di sisi server untuk menyamarkan rahasia,
                  token API, kredensial, dan data sensitif sebelum diproses oleh model. Asisten AI tidak
                  memiliki akses ke repository internal PT Tiga Serangkai dan tidak pernah mengirim data ke luar sistem secara otomatis.
                </p>
              </div>
            </div>
          </div>

          {/* Save History Preference */}
          <div className="flex items-center justify-between rounded-[20px] border border-border bg-secondary/30 p-4.5">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Lock className="size-4 text-[#5D7FE8]" />
                <span>Simpan Riwayat AI</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ketika dinonaktifkan, draf dan rekomendasi AI hanya diproses sekilas di memori tanpa disimpan di basis data.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={saveHistory}
              disabled={isUpdatingPref || isLoadingStats}
              onClick={handleToggleSaveHistory}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                saveHistory ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className="sr-only">Toggle simpan riwayat AI</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out ${
                  saveHistory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Usage & Quota Card */}
      <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border p-6">
          <CardTitle className="text-base font-extrabold text-foreground">Batas Kuota Penggunaan Harian</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Batas permintaan AI per hari untuk menjaga performa sistem dan efisiensi biaya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-bold">Penggunaan Hari Ini</span>
              <span className="font-extrabold text-foreground font-mono">
                {currentRequests} / {limit} request ({limit - currentRequests} tersisa)
              </span>
            </div>
            <Progress value={percentage} className="h-2 bg-secondary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground pt-2">
            <div className="rounded-[18px] border border-border bg-secondary/30 p-3.5">
              <span className="block font-extrabold text-foreground mb-1">Penyedia AI Aktif</span>
              <span>{stats?.provider === 'gemini' ? 'Google Gemini REST API' : stats?.provider || 'Mock Provider (Offline)'}</span>
            </div>
            <div className="rounded-[18px] border border-border bg-secondary/30 p-3.5">
              <span className="block font-extrabold text-foreground mb-1">Reset Kuota</span>
              <span>Setiap pukul 00:00 WIB</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
          >
            <span>Buka Asisten Command Center</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-all shadow-xs"
          >
            <Trash2 className="size-3.5" />
            <span>Hapus Riwayat AI</span>
          </button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Clearing History */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <span>Hapus Semua Riwayat AI?</span>
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus seluruh catatan log prompt dan hasil generasi AI yang tersimpan di akun Anda.
              Tindakan ini tidak memengaruhi jurnal, tugas, presensi, atau laporan magang yang sudah Anda simpan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={isClearingHistory}
              onClick={() => setConfirmClearOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={isClearingHistory}
              onClick={handleClearHistory}
              className="gap-2"
            >
              {isClearingHistory && <Loader2 className="size-4 animate-spin" />}
              <span>Ya, Hapus Riwayat</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
