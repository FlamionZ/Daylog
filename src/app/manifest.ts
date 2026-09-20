import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MagangHub — Daylog Internship Companion',
    short_name: 'MagangHub',
    description:
      'Aplikasi pendamping magang: catat absensi Monev Kemnaker, jurnal harian, tugas, dan asistensi AI Gemini.',
    start_url: '/dashboard',
    id: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F4EE',
    theme_color: '#F7F4EE',
    orientation: 'portrait-primary',
    categories: ['productivity', 'education', 'utilities'],
    lang: 'id',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Presensi Kehadiran',
        short_name: 'Presensi',
        description: 'Buka checklist presensi harian magang',
        url: '/attendance',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Jurnal Harian',
        short_name: 'Jurnal',
        description: 'Tulis atau lihat jurnal magang',
        url: '/journals',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Asisten AI',
        short_name: 'AI Hub',
        description: 'Bantuan Gemini AI untuk jurnal & blocker',
        url: '/assistant',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
