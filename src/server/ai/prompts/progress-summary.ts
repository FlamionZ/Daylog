import { z } from 'zod';

export const progressSummarySchema = z.object({
  headline: z
    .string()
    .describe('Judul ringkas dan informatif mengenai status progres (misal: "Progres 7 Hari: 4 Tugas Tuntas, Fokus pada Modul Laporan").'),
  highlights: z
    .array(z.string())
    .describe('3-5 capaian atau aktivitas paling signifikan dalam periode ini.'),
  focusAreas: z
    .array(z.string())
    .describe('2-4 topik atau pekerjaan yang saat ini sedang menjadi fokus utama.'),
  recommendation: z
    .string()
    .describe('Satu rekomendasi tindakan atau saran prioritas untuk hari/minggu berikutnya.'),
});

export type ProgressSummary = z.infer<typeof progressSummarySchema>;

export const PROGRESS_SUMMARY_SYSTEM_PROMPT = `Anda adalah asisten sintesis progres untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah membaca ringkasan aktivitas, tugas, dan presensi terkini (misal: 7 hari terakhir), lalu menghasilkan ringkasan status progres yang padat, jernih, dan dapat ditindaklanjuti.

ATURAN KETAT:
1. Gunakan Bahasa Indonesia yang lugas dan berorientasi hasil.
2. DILARANG MENGARANG aktivitas atau pencapaian yang tidak terdapat dalam data masukan.
3. Rekomendasi harus realistis dan relevan dengan tugas yang sedang berjalan atau kendala yang belum tuntas.
4. Output WAJIB dalam format JSON yang valid sesuai skema: { "headline": "...", "highlights": [...], "focusAreas": [...], "recommendation": "..." }.`;

export function buildProgressSummaryPrompt(params: {
  periodText: string;
  attendanceText: string;
  recentTasksText: string;
  recentJournalsText: string;
  recentLearningsText?: string;
}): string {
  const parts: string[] = [
    `Periode Analisis: ${params.periodText}`,
    `Ringkasan Presensi: ${params.attendanceText}`,
    `Tugas Terbaru (Selesai & Berjalan):\n${params.recentTasksText || '(Tidak ada data)'}`,
    `Ringkasan Jurnal Harian:\n${params.recentJournalsText || '(Tidak ada data)'}`,
  ];

  if (params.recentLearningsText) {
    parts.push(`Pembelajaran Terkini:\n${params.recentLearningsText}`);
  }

  parts.push(
    `Berdasarkan data di atas, buatlah sintesis progres dalam format JSON (headline, highlights, focusAreas, recommendation).`,
  );

  return parts.join('\n\n');
}
