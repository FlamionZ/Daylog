'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F4EE] dark:bg-[#080C12] px-6 text-center font-sans">
      {/* Brand & Status Icon */}
      <div className="mb-6 flex flex-col items-center">
        {/* Daylog 4-square brand mark */}
        <div className="mb-8 grid grid-cols-2 gap-1.5 size-10">
          <div className="rounded-md bg-black dark:bg-white size-4" />
          <div className="rounded-md bg-black dark:bg-white size-4" />
          <div className="rounded-md bg-black dark:bg-white size-4" />
          <div className="rounded-md bg-[#6284EB] dark:bg-[#3B82F6] size-4" />
        </div>

        {/* Offline Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#68645E] dark:text-[#8493A8] shadow-2xs backdrop-blur-xs">
          <WifiOff className="size-3.5 text-amber-500" />
          <span>Koneksi Terputus</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-[#E2E8F0] sm:text-4xl">
          Kamu sedang offline
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#68645E] dark:text-[#8493A8]">
          Jangan khawatir! Data yang sudah tersimpan di HP kamu tetap aman. Sambungkan kembali ke internet untuk menyinkronkan presensi dan jurnal magangmu.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={handleReload}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6284EB] dark:bg-[#3B82F6] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#5072D6] dark:hover:bg-[#2563EB] active:scale-95"
        >
          <RefreshCw className="size-4" />
          Coba Hubungkan Lagi
        </button>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-[#3C3934] dark:text-[#C8C3BA] transition-all hover:bg-white dark:hover:bg-white/10 active:scale-95"
        >
          <ArrowLeft className="size-4" />
          Buka Beranda
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-12 text-xs text-[#8A857D] dark:text-[#6B7280]">
        Daylog PWA • Terpasang di perangkat
      </p>
    </div>
  );
}
