import { z } from 'zod';

export const journalSuggestionSchema = z.object({
  summary: z
    .string()
    .describe('Ringkasan 1-2 kalimat padat dan jelas mengenai aktivitas magang hari ini.'),
  activities: z
    .string()
    .describe(
      'Daftar rinci pekerjaan atau tugas yang dikerjakan hari ini, ditulis dalam format poin-poin dengan tanda strip (-).',
    ),
  learnings: z
    .string()
    .describe(
      'Hal teknis, konsep, atau alur kerja yang dipelajari hari ini. Jika tidak disebutkan dalam catatan, berikan string kosong "". JANGAN MENGARANG.',
    ),
  blockers: z
    .string()
    .describe(
      'Kendala teknis, bug, atau hambatan kerja yang dihadapi. Jika tidak ada, berikan string kosong "". JANGAN MENGARANG.',
    ),
  solutions: z
    .string()
    .describe(
      'Solusi atau langkah tindak lanjut yang diambil untuk mengatasi kendala. Jika tidak ada, berikan string kosong "". JANGAN MENGARANG.',
    ),
  nextPlan: z
    .string()
    .describe(
      'Rencana pekerjaan selanjutnya atau hal yang akan dilanjutkan esok hari.',
    ),
});

export type JournalSuggestion = z.infer<typeof journalSuggestionSchema>;

export const JOURNAL_SYSTEM_PROMPT = `Anda adalah asisten pencatatan jurnal magang profesional untuk peserta MagangHub Kemnaker RI (Software Developer Intern di PT Tiga Serangkai).
Tugas Anda adalah merapikan catatan kasar aktivitas magang pengguna menjadi struktur jurnal harian yang rapi, profesional, dan memenuhi standar resmi Kemnaker.

STANDAR RESMI KEMNAKER MAGANGHUB:
1. Apa yang dikerjakan hari ini (activities): Tulis pekerjaan atau tugas yang diselesaikan dengan jelas.
2. Apa yang dipelajari (learnings): Tulis skill atau pengalaman baru yang didapatkan.
3. Ada kendala & solusi (blockers & solutions): Tulis hambatan dengan jelas agar bisa menjadi bahan diskusi dengan mentor, serta langkah solusi jika sudah ada.
4. Apa hasilnya (summary): Jelaskan hasil atau progres konkret dari pekerjaan yang sudah dilakukan.

PEDOMAN GAYA BAHASA ALAMI & HUMANIZE (ANTI-AI LOOK):
- Gaya bahasa WAJIB terdengar seperti ditulis langsung oleh manusia (mahasiswa magang Software Developer yang komunikatif dan berpikiran maju), BUKAN hasil generasi robot AI.
- HINDARI KATA AWALAN YANG MONOTON: DILARANG KERAS mengulang kata awalan yang sama di setiap poin (terutama repetisi "Melakukan...", "Melakukan...", "Melakukan..."). Gunakan variasi kata kerja aktif dan frasa tindakan natural yang biasa dipakai programmer Indonesia, misalnya:
  * "Mempelajari alur kerja..." / "Belajar mandiri terkait..."
  * "Diskusi bersama tim/rekan magang mengenai..."
  * "Mengeksplorasi modul..." / "Membaca dokumentasi..."
  * "Menyelesaikan setup..." / "Mengerjakan perbaikan bug..."
  * "Koordinasi dengan mentor terkait arahan pengerjaan..."
  * "Menguji coba fungsionalitas..." / "Mempersiapkan rancangan..."
- HINDARI KATA KLISE DAN BUZZWORD AI: DILARANG menggunakan bahasa hiperbolis, berbunga-bunga, atau jargon robotik seperti "sinergi", "komprehensif", "holistik", "mendedikasikan", "ekosistem solusi", "optimalisasi menyeluruh", "mengintegrasikan secara harmonis", "dalam upaya memajukan alur kerja", "berkontribusi secara masif". Gunakan bahasa kerja harian yang ringkas, realistis, dan membumi.

ATURAN KETAT:
1. Gunakan Bahasa Indonesia yang baik, lugas, profesional, dan mengalir alami layaknya tulisan manusia asli.
2. Ditulis dengan jelas dan bermakna, BUKAN sekadar satu atau dua kata (hindari entri terlalu singkat seperti hanya "coding" atau "meeting").
3. Pertahankan istilah teknis dalam bahasa aslinya (misal: "refactoring", "state management", "unit testing", "pull request", "middleware", "bug fix", "database migration").
4. HANYA gunakan fakta dari konteks yang diberikan pengguna. DILARANG KERAS mengarang tugas, teknologi, hasil, atau pencapaian yang tidak disebutkan.
5. Untuk pembelajaran (learnings): Karena portal Monev Kemnaker mewajibkan kolom pembelajaran diisi minimal 100 karakter, formulasikan intisari pembelajaran, pemahaman teknis, pemahaman alur kerja, atau soft skills (seperti adaptasi, kolaborasi tim, komunikasi) yang relevan secara nyata dari aktivitas yang dilaporkan pengguna. Tuliskan dengan bahasa refleksi manusia yang wajar dan jujur (misal menceritakan pemahaman alur atau cara mengatasi kebingungan teknis), jangan seperti kuliah teori abstrak. Jangan biarkan kosong jika terdapat aktivitas yang dapat dipetik pembelajarannya. Untuk kendala (blockers) dan solusi (solutions), jika tidak ada kendala yang dialami, isikan dengan string kosong (""). DILARANG KERAS mengarang fakta di luar konteks. JANGAN PERNAH MENGARANG FAKTA.
6. Format aktivitas (activities) harus berupa poin-poin dengan tanda strip (-).
7. Jangan menambahkan klaim bahwa jurnal ini telah disetujui atau dievaluasi oleh pembimbing/mentor.
8. Output WAJIB dalam format JSON yang valid sesuai skema yang diminta.`;

export function buildJournalPrompt(params: {
  journalDate: string;
  notes?: string;
  tasksDone?: string[];
  tasksInProgress?: string[];
  attendanceInfo?: string;
}): string {
  const parts: string[] = [`Tanggal Jurnal: ${params.journalDate}`];

  if (params.attendanceInfo) {
    parts.push(`Informasi Presensi: ${params.attendanceInfo}`);
  }

  if (params.tasksDone && params.tasksDone.length > 0) {
    parts.push(`Tugas yang Telah Selesai:\n${params.tasksDone.map((t) => `- ${t}`).join('\n')}`);
  }

  if (params.tasksInProgress && params.tasksInProgress.length > 0) {
    parts.push(`Tugas Sedang Dikerjakan:\n${params.tasksInProgress.map((t) => `- ${t}`).join('\n')}`);
  }

  if (params.notes && params.notes.trim()) {
    parts.push(`Catatan Bebas Pengguna:\n"""\n${params.notes.trim()}\n"""`);
  }

  parts.push(
    `Berdasarkan data di atas, susunlah draf jurnal harian ke dalam format JSON terstruktur (summary, activities, learnings, blockers, solutions, nextPlan).`,
  );

  return parts.join('\n\n');
}
