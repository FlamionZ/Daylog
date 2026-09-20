import { z } from 'zod';

export const extractedTaskItemSchema = z.object({
  title: z
    .string()
    .describe('Judul tugas yang ringkas, jelas, dan berorientasi aksi (misal: "Refactor modul auth").'),
  description: z
    .string()
    .describe('Deskripsi singkat mengenai rincian tugas yang perlu dikerjakan.'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .describe('Prioritas tugas berdasarkan urgensi yang disebutkan.'),
});

export const extractedTasksSchema = z.object({
  tasks: z
    .array(extractedTaskItemSchema)
    .describe('Daftar tugas yang berhasil diidentifikasi dari catatan pengguna.'),
});

export type ExtractedTaskItem = z.infer<typeof extractedTaskItemSchema>;
export type ExtractedTasksResult = z.infer<typeof extractedTasksSchema>;

export const EXTRACT_TASKS_SYSTEM_PROMPT = `Anda adalah asisten manajemen tugas untuk Software Developer Intern di PT Tiga Serangkai.
Tugas Anda adalah mengekstrak action items (tugas yang perlu dikerjakan, bug yang harus diperbaiki, atau rencana lanjutan) dari catatan bebas pengguna.

ATURAN KETAT:
1. HANYA ekstrak tugas yang secara eksplisit atau jelas tersirat dari catatan pengguna. JANGAN MENGARANG TUGAS yang tidak ada hubungannya.
2. Judul tugas harus berorientasi tindakan (kata kerja), ringkas, dan jelas (maksimal 10 kata).
3. Tentukan prioritas secara objektif:
   - 'urgent': Jika terdapat blocker kritis atau deadline mendesak hari ini.
   - 'high': Jika merupakan fitur utama atau bug yang menghambat alur kerja.
   - 'medium': Untuk pekerjaan reguler atau tugas standar.
   - 'low': Untuk optimasi minor, perapian kode, atau dokumentasi opsional.
4. Jika diberikan daftar tugas yang sudah ada, JANGAN buat tugas duplikat.
5. Jika tidak ada tugas yang dapat diekstrak dari teks, kembalikan array kosong { "tasks": [] }.
6. Output WAJIB dalam format JSON yang valid sesuai skema: { "tasks": [{ "title": "...", "description": "...", "priority": "medium" }] }.`;

export function buildExtractTasksPrompt(
  notes: string,
  existingTasks?: string[],
): string {
  const parts: string[] = [];

  if (existingTasks && existingTasks.length > 0) {
    parts.push(
      `Daftar Tugas yang Sudah Ada (JANGAN DUPLIKASI):\n${existingTasks.map((t) => `- ${t}`).join('\n')}`,
    );
  }

  parts.push(`Catatan Aktivitas Pengguna:\n"""\n${notes.trim()}\n"""`);
  parts.push(
    `Berdasarkan catatan di atas, identifikasikan tugas-tugas baru yang perlu dikerjakan. Kembalikan dalam format JSON.`,
  );

  return parts.join('\n\n');
}
