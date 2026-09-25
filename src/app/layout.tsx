import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/sonner';
import { PwaRegister } from '@/components/pwa/pwa-register';
import { InstallBanner } from '@/components/pwa/install-banner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Daylog — Internship Companion',
    template: '%s — Daylog',
  },
  description:
    'Aplikasi pendamping magang: catat absensi Monev Kemnaker, jurnal harian, tugas, dan asistensi AI Copilot.',
  applicationName: 'Daylog',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daylog',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F4EE' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F14' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <PwaRegister>
            {children}
            <InstallBanner />
          </PwaRegister>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 4500,
              className: 'font-sans text-xs shadow-lg',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
