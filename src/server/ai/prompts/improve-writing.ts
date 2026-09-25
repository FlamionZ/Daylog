import { z } from 'zod';

export type ImproveWritingMode =
  | 'humanize'
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
  humanize:
    'Humanize tulisan agar terdengar 100% natural, luwes, dan seperti ditulis langsung oleh manusia asli (mahasiswa magang software developer). Hilangkan kesan kaku dan robotik khas AI (seperti repetisi awalan "Melakukan...", kata "sinergi", "komprehensif", "mengoptimalkan secara masif"). Variasikan struktur kalimat dan gunakan kosakata kerja aktif yang membumi tanpa mengubah makna faktual maupun istilah teknis.',
  polish: 'Rapikan tulisan agar lebih mengalir, enak dibaca, dan runtut tanpa mengubah makna maupun menambahkan informasi baru.',
  professional: 'Sesuaikan gaya bahasa agar lebih profesional, formal, dan berbobot, cocok untuk laporan magang industri perangkat lunak.',
  summarize: 'Ringkas teks menjadi lebih padat dan to the point tanpa menghilangkan poin esensial atau kata kunci teknis.',
  clarify: 'Perjelas maksud kalimat yang ambigu atau kurang terstruktur agar poin utama tersampaikan secara terang dan gamblang.',
  grammar: 'Perbaiki kesalahan tata bahasa, ejaan kata (EYD/PUEBI), huruf kapital, serta tanda baca yang kurang tepat.',
};

export const IMPROVE_WRITING_SYSTEM_PROMPT = `Anda adalah editor teks profesional dan pakar "Humanizer" tulisan untuk jurnal dan laporan magang Software Developer (peserta MagangHub Kemnaker di PT Tiga Serangkai).
Tugas Anda adalah menyempurnakan teks input yang diberikan pengguna sesuai dengan mode instruksi yang diminta, dengan memastikan hasil tulisan terdengar natural, luwes, dan seperti ditulis oleh manusia asli.

PRINSIP UTAMA HUMANIZE & ANTI-AI LOOK:
1. HINDARI POLA MONOTON: DILARANG mengulang struktur kalimat atau kata awalan yang sama secara berturut-turut (terutama repetisi awalan "Melakukan...", "Melakukan..."). Variasikan bentuk kalimat secara alami.
2. HAPUS KATA KLISE & BUZZWORD AI: Buang frasa berlebihan atau jargon artifisial seperti "sinergi", "komprehensif", "holistik", "mendedikasikan", "ekosistem solusi", "optimalisasi menyeluruh", "dalam rangka meningkatkan efisiensi". Gunakan bahasa manusia yang lugas dan membumi.
3. ALAMI & AUTENTIK: Buat tulisan seperti ditulis langsung oleh seorang mahasiswa magang teknologi yang cerdas, proaktif, dan wajar dalam menceritakan tugas atau aktivitas kerjanya.

ATURAN KETAT:
1. Pertahankan seluruh fakta asli. DILARANG KERAS menambahkan hasil, fitur, atau pencapaian yang tidak disebutkan.
2. Gunakan Bahasa Indonesia yang baik dan benar.
3. Pertahankan istilah teknis dalam istilah aslinya (misal: "bug fix", "database index", "middleware", "props", "hook", "refactoring").
4. Jangan membuat teks menjadi klise dengan kalimat generik (misal: hindari "merevolusi alur kerja", "pengalaman luar biasa").
5. Output WAJIB dalam format JSON yang valid: { "improvedText": "..." }.`;

export function buildImproveWritingPrompt(
  text: string,
  mode: ImproveWritingMode,
): string {
  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.humanize;

  return `Instruksi Khusus: ${instruction}

Teks Asli:
"""
${text.trim()}
"""

Perbaiki teks di atas sesuai instruksi dan kembalikan dalam format JSON { "improvedText": "..." }.`;
}
