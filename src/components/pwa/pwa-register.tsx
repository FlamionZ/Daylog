'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<boolean>;
  showInstallBanner: boolean;
  dismissBanner: () => void;
  openGuide: () => void;
  closeGuide: () => void;
  isGuideOpen: boolean;
}

const PWAContext = createContext<PWAContextType>({
  isInstalled: false,
  canInstall: false,
  isIOS: false,
  promptInstall: async () => false,
  showInstallBanner: false,
  dismissBanner: () => {},
  openGuide: () => {},
  closeGuide: () => {},
  isGuideOpen: false,
});

export function usePWA() {
  return useContext(PWAContext);
}

const DISMISS_KEY = 'maganghub_pwa_dismissed';

const emptySubscribe = () => () => {};

function getIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(display-mode: standalone)');
  mq.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    mq.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function subscribeDismiss(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getIsDismissedStored(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function PwaRegister({ children }: { children?: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [manualDismiss, setManualDismiss] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const openGuide = useCallback(() => setIsGuideOpen(true), []);
  const closeGuide = useCallback(() => setIsGuideOpen(false), []);

  const isIOS = useSyncExternalStore(emptySubscribe, getIsIOS, () => false);
  const isInstalled = useSyncExternalStore(subscribeStandalone, getIsStandalone, () => false);
  const isStoredDismissed = useSyncExternalStore(subscribeDismiss, getIsDismissedStored, () => false);

  useEffect(() => {
    // 1. Register Service Worker (only in production to avoid caching dev assets)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV !== 'production') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
              console.log('[PWA] Service Worker registered with scope:', reg.scope);
            })
            .catch((err) => {
              console.error('[PWA] Service Worker registration failed:', err);
            });
        });
      }
    }

    // 2. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 3. Listen for appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      try {
        localStorage.setItem(DISMISS_KEY, 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setManualDismiss(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const isDismissed = manualDismiss || isStoredDismissed;
  const showInstallBanner =
    !isInstalled && !isDismissed && (Boolean(deferredPrompt) || isIOS);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        canInstall: Boolean(deferredPrompt),
        isIOS,
        promptInstall,
        showInstallBanner,
        dismissBanner,
        openGuide,
        closeGuide,
        isGuideOpen,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}
