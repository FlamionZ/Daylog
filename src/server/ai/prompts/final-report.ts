import { z } from 'zod';

export const finalReportDraftSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Ringkasan eksekutif menyeluruh mengenai peran, tanggung jawab, dan kontribusi selama magang.'),
  projectContributions: z
    .array(
      z.object({
        featureOrModule: z.string().describe('Nama modul, fitur, atau sistem yang dikembangkan.'),
        roleAndResponsibility: z.string().describe('Tanggung jawab yang dijalankan dalam modul tersebut.'),
        technicalDetails: z.string().describe('Teknologi, pustaka, atau pola desain yang diterapkan.'),
        outcome: z.string().describe('Hasil atau dampak konkret dari pekerjaan tersebut.'),
      }),
    )
    .describe('Daftar kontribusi proyek/fitur utama.'),
  skillsAcquired: z
    .array(
      z.object({
        category: z.string().describe('Kategori: Frontend, Backend, Database, Tools/DevOps, atau Soft Skills.'),
        skillName: z.string().describe('Nama keahlian atau teknologi.'),
        description: z.string().describe('Penjelasan penguasaan dan penerapannya dalam proyek.'),
      }),
    )
    .describe('Keahlian dan kompetensi yang berhasil dikembangkan.'),
  challengesAndSolutions: z
    .array(
      z.object({
        challenge: z.string().describe('Tantangan teknis atau hambatan alur kerja yang dihadapi.'),
        solution: z.string().describe('Langkah atau metode yang diambil untuk mengatasi tantangan tersebut.'),
      }),
    )
    .describe('Tantangan penting dan penyelesaiannya.'),
  conclusion: z
    .string()
    .describe('Kesimpulan akhir, refleksi profesional, dan saran untuk pengembangan sistem selanjutnya.'),
});

export type FinalReportDraft = z.infer<typeof finalReportDraftSchema>;

export const FINAL_REPORT_SYSTEM_PROMPT = `Anda adalah asisten penyusun Laporan Akhir Magang (Final Internship Report) untuk peserta magang program MagangHub Kemnaker di PT. Tiga Serangkai Pustaka Mandiri.
Tugas Anda adalah mensintesis seluruh riwayat aktivitas magang (proyek yang dikerjakan, pembelajaran, kendala yang diatasi, serta metrik kehadiran) menjadi draf laporan akhir yang komprehensif, akademis, dan profesional.

ATURAN KETAT:
1. Gunakan Bahasa Indonesia formal yang baku dan terstruktur.
2. DILARANG MENGARANG proyek atau teknologi yang tidak ada dalam data riwayat.
3. Seluruh angka statistik dan total jam kerja bersifat final dan tidak boleh dimanipulasi.
4. Format output WAJIB berupa JSON sesuai skema: { "executiveSummary": "...", "projectContributions": [...], "skillsAcquired": [...], "challengesAndSolutions": [...], "conclusion": "..." }.`;

export function buildFinalReportPrompt(params: {
  internshipRole: string;
  companyName: string;
  durationText: string;
  totalHours: string;
  tasksCompletedSummary: string;
  learningsSummary: string;
  journalsSummary: string;
}): string {
  return `Profil Magang:
- Posisi: ${params.internshipRole}
- Perusahaan: ${params.companyName}
- Durasi & Kehadiran: ${params.durationText} (${params.totalHours})

Daftar Tugas & Proyek yang Diselesaikan:
${params.tasksCompletedSummary || '(Tidak ada data tugas terinci)'}

Kompilasi Topik Pembelajaran:
${params.learningsSummary || '(Tidak ada data pembelajaran terinci)'}

Ikhtisar Jurnal Harian:
${params.journalsSummary || '(Tidak ada catatan jurnal)'}

Berdasarkan seluruh riwayat di atas, susunlah draf Laporan Akhir Magang dalam format JSON terstruktur (executiveSummary, projectContributions, skillsAcquired, challengesAndSolutions, conclusion).`;
}
