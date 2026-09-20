import { z } from 'zod';

export const extractedLearningItemSchema = z.object({
  topic: z
    .string()
    .describe('Topik atau konsep spesifik yang dipelajari (misal: "Database Indexing di PostgreSQL").'),
  technology: z
    .string()
    .describe('Nama teknologi, bahasa pemrograman, atau framework terkait (misal: "PostgreSQL", "Next.js", "Docker").'),
  summary: z
    .string()
    .describe('Ringkasan wawasan atau pemahaman teknis yang didapatkan.'),
  level: z
    .enum(['exploring', 'learning', 'practicing', 'confident'])
    .describe('Tingkat pemahaman yang tercermin dari catatan.'),
  evidence: z
    .string()
    .describe('Kutipan atau rujukan langsung dari catatan pengguna yang membuktikan pembelajaran ini.'),
});

export const extractedLearningsSchema = z.object({
  learnings: z
    .array(extractedLearningItemSchema)
    .describe('Daftar pembelajaran yang berhasil diekstrak.'),
});

export type ExtractedLearningItem = z.infer<typeof extractedLearningItemSchema>;
export type ExtractedLearningsResult = z.infer<typeof extractedLearningsSchema>;

export const EXTRACT_LEARNINGS_SYSTEM_PROMPT = `Anda adalah asisten evaluasi pembelajaran untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah mengidentifikasi materi, konsep teknis, arsitektur, atau alur kerja yang dipelajari pengguna berdasarkan catatan aktivitasnya.

ATURAN KETAT:
1. Setiap pembelajaran WAJIB didasari bukti eksplisit (evidence) dari catatan pengguna. DILARANG KERAS MENGARANG pembelajaran yang tidak disebutkan.
2. Identifikasi teknologi atau konsep spesifik (misal: "Zod Schema Validation", "Supabase Row Level Security", "Git Rebase").
3. Tentukan level penguasaan yang realistis:
   - 'exploring': Baru membaca dokumentasi atau mengenal konsep.
   - 'learning': Sedang mencoba mengimplementasikan tutorial atau dasar-dasarnya.
   - 'practicing': Sudah menerapkan dalam kode proyek nyata atau mengatasi bug terkait.
   - 'confident': Berhasil menyelesaikan fitur kompleks dan memahami seluk-beluknya dengan baik.
4. Jika tidak ada pembelajaran yang dapat diidentifikasi dari catatan, kembalikan array kosong { "learnings": [] }.
5. Output WAJIB dalam format JSON yang valid sesuai skema: { "learnings": [{ "topic": "...", "technology": "...", "summary": "...", "level": "practicing", "evidence": "..." }] }.`;

export function buildExtractLearningsPrompt(notes: string): string {
  return `Catatan Aktivitas Pengguna:
"""
${notes.trim()}
"""

Berdasarkan catatan di atas, identifikasikan konsep atau materi apa saja yang dipelajari oleh pengguna beserta buktinya. Kembalikan dalam format JSON.`;
}
