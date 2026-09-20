import { z } from 'zod';

export type ImproveWritingMode =
  | 'polish'
  | 'professional'
  | 'summarize'
  | 'clarify'
  | 'grammar';

export const improveWritingSchema = z.object({
  improvedText: z
    .string()
    .describe('Teks hasil perbaikan yang telah disempurnakan sesuai instruksi.'),
});

export type ImproveWritingResult = z.infer<typeof improveWritingSchema>;

const MODE_INSTRUCTIONS: Record<ImproveWritingMode, string> = {
  polish: 'Rapikan tulisan agar lebih mengalir, enak dibaca, dan runtut tanpa mengubah makna maupun menambahkan informasi baru.',
  professional: 'Sesuaikan gaya bahasa agar lebih profesional, formal, dan berbobot, cocok untuk laporan magang industri perangkat lunak.',
  summarize: 'Ringkas teks menjadi lebih padat dan to the point tanpa menghilangkan poin esensial atau kata kunci teknis.',
  clarify: 'Perjelas maksud kalimat yang ambigu atau kurang terstruktur agar poin utama tersampaikan secara terang dan gamblang.',
  grammar: 'Perbaiki kesalahan tata bahasa, ejaan kata (EYD/PUEBI), huruf kapital, serta tanda baca yang kurang tepat.',
};

export const IMPROVE_WRITING_SYSTEM_PROMPT = `Anda adalah editor teks profesional untuk jurnal dan laporan magang Software Developer.
Tugas Anda adalah menyempurnakan teks input yang diberikan pengguna sesuai dengan mode instruksi yang diminta.

ATURAN KETAT:
1. Pertahankan seluruh fakta asli. DILARANG KERAS menambahkan hasil, fitur, atau pencapaian yang tidak disebutkan.
2. Gunakan Bahasa Indonesia yang baik dan benar.
3. Pertahankan istilah teknis dalam istilah aslinya (misal: "bug fix", "database index", "middleware", "props", "hook").
4. Jangan membuat teks menjadi klise dengan kalimat generik (misal: hindari "merevolusi alur kerja", "pengalaman luar biasa").
5. Output WAJIB dalam format JSON yang valid: { "improvedText": "..." }.`;

export function buildImproveWritingPrompt(
  text: string,
  mode: ImproveWritingMode,
): string {
  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.polish;

  return `Instruksi Khusus: ${instruction}

Teks Asli:
"""
${text.trim()}
"""

Perbaiki teks di atas sesuai instruksi dan kembalikan dalam format JSON { "improvedText": "..." }.`;
}
