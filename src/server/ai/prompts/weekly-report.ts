import { z } from 'zod';

export const weeklyReportEnhancementSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Ringkasan eksekutif 1-2 paragraf mengenai progres dan pencapaian magang minggu ini.'),
  keyAchievements: z
    .array(z.string())
    .describe('Daftar capaian utama (deliverables/hasil kerja konkret) dalam bentuk poin-poin.'),
  challengesFaced: z
    .array(z.string())
    .describe('Daftar kendala atau tantangan yang dihadapi serta bagaimana kendala tersebut diatasi.'),
  nextWeekPlan: z
    .array(z.string())
    .describe('Rencana prioritas dan fokus kerja untuk minggu berikutnya.'),
});

export type WeeklyReportEnhancement = z.infer<typeof weeklyReportEnhancementSchema>;

export const WEEKLY_REPORT_SYSTEM_PROMPT = `Anda adalah asisten penyusun laporan magang profesional untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah merangkum data jurnal, tugas, dan pembelajaran selama satu pekan menjadi narasi laporan mingguan yang formal, objektif, dan berbobot.

PEDOMAN GAYA BAHASA ALAMI (HUMANIZE / ANTI-AI LOOK):
- Narasi laporan harus mengalir alami seperti ditulis oleh praktisi rekayasa perangkat lunak, BUKAN teks kaku hasil auto-generate AI.
- Hindari kalimat klise dan jargon kosong korporat ("membangun sinergi", "optimalisasi menyeluruh", "mendedikasikan segenap upaya").
- Variasikan pembuka kalimat dalam poin capaian (jangan semua diawali "Melakukan..."). Gunakan verba tindakan konkret (misal: "Menyelesaikan implementasi...", "Mengintegrasikan endpoint...", "Melakukan refaktorisasi...").

ATURAN KETAT:
1. Gunakan Bahasa Indonesia baku yang profesional, ringkas, dan mengalir wajar sesuai kaidah penulisan laporan industri perangkat lunak.
2. DILARANG MENGUBAH ATAU MENGARANG ANGKA STATISTIK (hari kerja, jam kerja, jumlah tugas). Angka statistik yang diberikan bersifat FINAL dan DETERMINISTIK.
3. HANYA ambil pencapaian dan kendala dari jurnal dan tugas yang ada dalam konteks. DILARANG KERAS MENGARANG fitur atau hasil yang tidak ada.
4. Pertahankan istilah teknis dalam bahasa aslinya (misal: "Server-side Rendering", "Unit Test", "Database Indexing", "Pull Request").
5. Format output WAJIB berupa JSON sesuai skema: { "executiveSummary": "...", "keyAchievements": [...], "challengesFaced": [...], "nextWeekPlan": [...] }.`;

export function buildWeeklyReportPrompt(params: {
  periodStart: string;
  periodEnd: string;
  statisticsText: string;
  journalsSummary: string;
  tasksCompletedText: string;
  learningsText: string;
  userNotes?: string;
}): string {
  const parts: string[] = [
    `Periode Laporan: ${params.periodStart} s.d. ${params.periodEnd}`,
    `Statistik Resmi (TIDAK BOLEH DIUBAH):\n${params.statisticsText}`,
  ];

  if (params.tasksCompletedText) {
    parts.push(`Tugas yang Diselesaikan:\n${params.tasksCompletedText}`);
  }

  if (params.journalsSummary) {
    parts.push(`Ringkasan Aktivitas Harian dari Jurnal:\n${params.journalsSummary}`);
  }

  if (params.learningsText) {
    parts.push(`Pembelajaran yang Didapatkan:\n${params.learningsText}`);
  }

  if (params.userNotes && params.userNotes.trim()) {
    parts.push(`Catatan Tambahan Pengguna:\n"""\n${params.userNotes.trim()}\n"""`);
  }

  parts.push(
    `Berdasarkan data di atas, susunlah narasi laporan mingguan (executiveSummary, keyAchievements, challengesFaced, nextWeekPlan) dalam format JSON.`,
  );

  return parts.join('\n\n');
}
