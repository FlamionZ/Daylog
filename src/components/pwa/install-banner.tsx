'use client';

import { useState } from 'react';
import { usePWA } from './pwa-register';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function InstallBanner() {
  const {
    isInstalled,
    canInstall,
    isIOS,
    promptInstall,
    showInstallBanner,
    dismissBanner,
    openGuide,
    closeGuide,
    isGuideOpen,
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canInstall) {
      setIsInstalling(true);
      const success = await promptInstall();
      setIsInstalling(false);
      if (success) {
        setInstalledSuccess(true);
      }
    } else {
      openGuide();
    }
  };

  return (
    <>
      {/* Floating Bottom / Banner Prompt (Mobile / Tablet) */}
      {showInstallBanner && !installedSuccess && (
        <aside
          aria-label="Pemasangan Aplikasi PWA"
          className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 lg:bottom-6 lg:right-6 lg:left-auto"
        >
          <div className="relative flex items-center justify-between gap-3.5 rounded-2xl border border-border bg-card/95 text-card-foreground p-4 shadow-xl backdrop-blur-md">
            {/* App Icon */}
            <div className="grid grid-cols-2 gap-1 size-10 shrink-0 rounded-xl bg-secondary/60 p-2 border border-border">
              <div className="rounded-xs bg-foreground size-2.5" />
              <div className="rounded-xs bg-foreground size-2.5" />
              <div className="rounded-xs bg-foreground size-2.5" />
              <div className="rounded-xs bg-[#6284EB] dark:bg-[#3B82F6] size-2.5" />
            </div>

            {/* Copy */}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold tracking-tight text-foreground">
                Pasang Daylog di HP
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                Akses cepat dari homescreen &amp; bisa offline
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex items-center gap-1.5 rounded-full bg-[#6284EB] dark:bg-[#3B82F6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#5072D6] dark:hover:bg-[#2563EB] active:scale-95 disabled:opacity-50"
              >
                <Download className="size-3.5" />
                <span>{isInstalling ? 'Memasang...' : 'Pasang'}</span>
              </button>

              <button
                onClick={dismissBanner}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                aria-label="Tutup saran pemasangan"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Global Persistent Install Guide Modal */}
      <Dialog open={isGuideOpen} onOpenChange={(open) => (open ? openGuide() : closeGuide())}>
        <DialogContent className="max-w-md border-border bg-card text-card-foreground rounded-[28px] p-6 shadow-2xl z-50">
          <DialogHeader className="text-left pb-2">
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-[#DDE7FE] dark:bg-[#1E2D4A] text-[#3B66E8] dark:text-[#60A5FA]">
              <Smartphone className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Pasang Daylog di {isIOS ? 'iPhone / iPad' : 'HP Kamu'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isIOS
                ? 'Ikuti 3 langkah mudah berikut melalui browser Safari:'
                : 'Pasang aplikasi ke layar utama ponsel kamu untuk akses cepat:'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Step 1 */}
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#DED8FA] dark:bg-[#2D2544] text-xs font-bold text-[#2B1E4A] dark:text-[#A78BFA]">
                1
              </div>
              <div className="text-sm text-muted-foreground">
                <span>Ketuk menu browser: </span>
                <strong className="inline-flex items-center gap-1 font-semibold text-foreground">
                  {isIOS ? (
                    <>
                      <Share2 className="size-3.5 text-[#6284EB] dark:text-[#3B82F6] inline" /> Bagikan (Share)
                    </>
                  ) : (
                    'Titik tiga (⋮) di sudut atas'
                  )}
                </strong>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FBE892] dark:bg-[#3D3415] text-xs font-bold text-[#3E340D] dark:text-[#FACC15]">
                2
              </div>
              <div className="text-sm text-muted-foreground">
                <span>Pilih opsi </span>
                <strong className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <PlusSquare className="size-3.5 text-foreground inline" />
                  {isIOS ? 'Tambah ke Layar Utama' : 'Install Aplikasi / Tambahkan ke Layar Utama'}
                </strong>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#BCE8D3] dark:bg-[#1A3329] text-xs font-bold text-[#163A2B] dark:text-[#34D399]">
                3
              </div>
              <div className="text-sm text-muted-foreground">
                <span>Ketuk </span>
                <strong className="font-semibold text-foreground">Tambah / Install</strong>
                <span>. Ikon Daylog akan muncul di layar utama HP kamu!</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={closeGuide}
              className="w-full rounded-full bg-[#6284EB] dark:bg-[#3B82F6] py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#5072D6] dark:hover:bg-[#2563EB] active:scale-95 transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Notification after install */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-[#BCE8D3] dark:bg-[#1A3329] px-4 py-2 text-xs font-bold text-[#163A2B] dark:text-[#34D399] shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="size-4" />
          <span>Daylog berhasil dipasang di HP!</span>
        </div>
      )}
    </>
  );
}

/**
 * Dedicated button component to trigger install from Sidebar or Mobile Drawer
 */
export function InstallButton({
  className = '',
  onAction,
}: {
  className?: string;
  onAction?: () => void;
}) {
  const { isInstalled, canInstall, promptInstall, openGuide } = usePWA();

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    onAction?.();
    if (canInstall) {
      await promptInstall();
    } else {
      openGuide();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      title="Pasang aplikasi Daylog di ponsel kamu"
    >
      <Smartphone className="size-4 shrink-0" />
      <span>Install Aplikasi</span>
    </button>
  );
}
