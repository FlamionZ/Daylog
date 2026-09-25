import { z } from 'zod';

export const blockerAdviceSchema = z.object({
  rootCauseHypotheses: z
    .array(z.string())
    .describe('2-3 kemungkinan penyebab utama masalah, diurutkan dari yang paling memungkinkan.'),
  investigationSteps: z
    .array(z.string())
    .describe('Langkah-langkah investigasi/debugging konkret untuk menguji hipotesis di atas.'),
  potentialSolutions: z
    .array(z.string())
    .describe('Solusi atau perbaikan teknis pragmatis yang dapat dicoba.'),
  howToAskMentor: z
    .string()
    .describe('Template ringkas dan profesional untuk bertanya kepada mentor/senior engineer (latar belakang, apa yang sudah dicoba, dan pertanyaan spesifik).'),
});

export type BlockerAdvice = z.infer<typeof blockerAdviceSchema>;

export const BLOCKER_ADVISOR_SYSTEM_PROMPT = `Anda adalah senior software engineer dan mentor teknis untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah membantu intern mendiagnosis kendala teknis (blocker), merumuskan hipotesis akar masalah, merancang langkah debugging terarah, dan menyusun pertanyaan efektif kepada mentor.

PEDOMAN GAYA BAHASA ALAMI (HUMANIZE):
- Gunakan bahasa yang lugas, solutif, dan ramah khas engineer Indonesia.
- Pada bagian "howToAskMentor", susun kalimat yang sopan, santun, dan natural (misal: "Halo Mas/Kak, izin bertanya terkait kendala..."), bukan terjemahan mesin kaku.

ATURAN KETAT:
1. Gunakan Bahasa Indonesia yang jelas, mendidik, dan berorientasi pemecahan masalah (problem-solving).
2. Pertahankan istilah teknis dalam bahasa aslinya (misal: "stack trace", "memory leak", "race condition", "CORS policy").
3. Jangan memberikan asumsi tanpa dasar; susun hipotesis yang realistis berdasarkan teknologi yang disebutkan.
4. Bagian "howToAskMentor" WAJIB menggunakan format komunikasi profesional:
   - Masalah/gejala yang terjadi
   - Apa yang sudah dicoba dan hasilnya
   - Titik kebuntuan dan pertanyaan spesifik
5. Output WAJIB dalam format JSON yang valid: { "rootCauseHypotheses": [...], "investigationSteps": [...], "potentialSolutions": [...], "howToAskMentor": "..." }.`;

export function buildBlockerAdvisorPrompt(params: {
  blockerText: string;
  technology?: string;
  attemptedSolutions?: string;
}): string {
  const parts: string[] = [
    `Kendala / Error yang Dihadapi:\n"""\n${params.blockerText.trim()}\n"""`,
  ];

  if (params.technology && params.technology.trim()) {
    parts.push(`Teknologi / Stack Terkait: ${params.technology.trim()}`);
  }

  if (params.attemptedSolutions && params.attemptedSolutions.trim()) {
    parts.push(`Langkah yang Sudah Dicoba:\n"""\n${params.attemptedSolutions.trim()}\n"""`);
  }

  parts.push(
    `Berdasarkan informasi di atas, berikan analisis akar masalah, langkah investigasi, alternatif solusi, dan draf pesan untuk bertanya kepada mentor dalam format JSON.`,
  );

  return parts.join('\n\n');
}
