import { z } from 'zod';

export const dailyReflectionSchema = z.object({
  description: z
    .string()
    .describe('Ringkasan objektif mengenai peristiwa utama dan capaian kerja hari ini.'),
  feelingsAndChallenges: z
    .string()
    .describe('Refleksi konstruktif mengenai aspek emosional atau tekanan yang dirasakan, serta kendala yang menguji kesabaran/kemampuan.'),
  evaluation: z
    .string()
    .describe('Evaluasi kritis: apa yang berjalan dengan sangat baik dan apa yang seharusnya bisa ditangani lebih baik.'),
  analysis: z
    .string()
    .describe('Wawasan atau hikmah mendalam mengenai pola kerja, komunikasi tim, atau pengambilan keputusan teknis.'),
  actionPlan: z
    .string()
    .describe('Rencana aksi konkret untuk perbaikan diri dan efektivitas kerja esok hari.'),
});

export type DailyReflection = z.infer<typeof dailyReflectionSchema>;

export const DAILY_REFLECTION_SYSTEM_PROMPT = `Anda adalah fasilitator refleksi profesional dan coach pengembangan diri untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah memandu intern melakukan refleksi harian terstruktur yang mendalam (diadaptasi dari Gibbs Reflective Cycle) berdasarkan aktivitas, pembelajaran, dan kendala yang dialami hari ini.

PEDOMAN GAYA BAHASA ALAMI (HUMANIZE):
- Gunakan nada bicara yang manusiawi, tulus, dan suportif. Hindari kalimat yang kaku atau terdengar seperti artikel generik buatan AI.
- Refleksikan pengalaman nyata seorang mahasiswa magang: akui momen ketika bingung, rasa lega saat bug terpecahkan, atau dinamika adaptasi dengan tim.
- Hindari frasa motivasi kosong atau jargon korporat klise (seperti "sinergi maksimal", "optimalisasi potensi", "langkah revolusioner").

ATURAN KETAT:
1. Gunakan Bahasa Indonesia yang reflektif, suportif, dan membangun pola pikir bertumbuh (growth mindset).
2. Fokus pada pembelajaran nyata dan perbaikan berkelanjutan, bukan sekadar pujian kosong.
3. Hindari kalimat klise atau motivasi murahan; berikan wawasan yang relevan dengan realitas kerja software engineering.
4. Output WAJIB dalam format JSON yang valid sesuai skema: { "description": "...", "feelingsAndChallenges": "...", "evaluation": "...", "analysis": "...", "actionPlan": "..." }.`;

export function buildDailyReflectionPrompt(params: {
  date: string;
  summary: string;
  learnings?: string;
  blockers?: string;
  activities?: string;
}): string {
  const parts: string[] = [
    `Tanggal Aktivitas: ${params.date}`,
    `Ringkasan Pekerjaan Hari Ini:\n"""\n${params.summary.trim()}\n"""`,
  ];

  if (params.activities && params.activities.trim()) {
    parts.push(`Daftar Aktivitas:\n${params.activities.trim()}`);
  }

  if (params.learnings && params.learnings.trim()) {
    parts.push(`Pembelajaran yang Didapatkan:\n${params.learnings.trim()}`);
  }

  if (params.blockers && params.blockers.trim()) {
    parts.push(`Kendala / Hambatan yang Dirasakan:\n${params.blockers.trim()}`);
  }

  parts.push(
    `Berdasarkan pengalaman di atas, susunlah refleksi harian terstruktur (description, feelingsAndChallenges, evaluation, analysis, actionPlan) dalam format JSON.`,
  );

  return parts.join('\n\n');
}
