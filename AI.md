# AI Internship Assistant — Technical & Product Documentation

Dokumentasi lengkap untuk arsitektur, fitur, privasi, dan pedoman integrasi **AI Internship Assistant** di dalam aplikasi **Internship Companion**.

---

## 1. Ikhtisar & Filosofi Desain

**AI Internship Assistant** dirancang khusus sebagai *copilot pribadi* bagi mahasiswa/siswa magang posisi **Software Developer** di **PT Tiga Serangkai, Surakarta**.

### Prinsip Utama (Non-Negotiable)

1. **Human-in-the-Loop (AI Proposes, Human Confirms)**:
   - AI **TIDAK PERNAH** melakukan mutasi basis data secara otomatis (no auto-insert / auto-update).
   - Seluruh keluaran AI disajikan sebagai draf interaktif yang wajib ditinjau, diedit, atau disetujui pengguna sebelum disimpan.
2. **Privacy-First & Zero-Leakage**:
   - Tidak ada integrasi langsung ke repositori kode internal PT Tiga Serangkai.
   - Redaksi otomatis di sisi server (*server-side redaction*) untuk menyamarkan rahasia, token API, kredensial koneksi, email, dan nomor telepon sebelum prompt dikirim ke model.
   - Riwayat percakapan tidak disimpan secara *default* (`save_history = false`).
3. **Deterministic Truth**:
   - Data presensi (jam kerja, hari masuk, keterlambatan) dan jumlah tugas dihitung secara deterministik langsung dari PostgreSQL.
   - AI tidak diperkenankan menghitung atau memanipulasi metrik numerik presensi.
4. **Provider Agnostic**:
   - Arsitektur berbasis antarmuka (*interface*) `AIProvider` yang memungkinkan pergantian penyedia model (Google Gemini, Anthropic, OpenAI, Ollama lokal, atau Mock) tanpa mengubah kode logika bisnis.

---

## 2. Arsitektur Teknis

```
src/
├── lib/
│   └── env.ts                       # Validasi skema env (AI_PROVIDER, GEMINI_API_KEY, dll.)
├── server/
│   └── ai/
│       ├── providers/
│       │   ├── ai-provider.ts       # Interface AIProvider & AIError taxonomy
│       │   ├── gemini.ts            # Google Gemini REST client dengan fallback chain 6 model
│       │   ├── mock.ts              # Offline mock provider untuk testing/CI
│       │   └── provider.ts          # Provider factory: getAIProvider()
│       ├── safety/
│       │   └── redactor.ts          # Server-side regex sanitizer (API keys, DB URIs, PII)
│       ├── services/
│       │   ├── usage-service.ts     # In-memory daily rate limiter & token usage tracking
│       │   └── preferences-service.ts# User AI preferences (save_history, tone, dll.)
│       └── prompts/
│           ├── journal.ts           # Draf jurnal & saran dari catatan kasar
│           ├── improve-writing.ts   # 5 mode perbaikan tulisan
│           ├── blocker-advisor.ts   # Diagnosis kendala teknis & draf pesan mentor
│           ├── daily-reflection.ts  # Refleksi terpandu siklus Gibbs (5 tahap)
│           ├── extract-tasks.ts     # Ekstraksi tugas terstruktur dari catatan
│           ├── extract-learnings.ts # Ekstraksi poin pembelajaran magang
│           ├── weekly-report.ts     # Sintesis draf laporan mingguan
│           ├── final-report.ts      # Sintesis draf laporan akhir magang
│           └── progress-summary.ts  # Ringkasan progres pencapaian mingguan
├── features/
│   └── ai/
│       ├── actions/
│       │   └── ai-actions.ts        # Next.js Server Actions dengan error handling & rate limit
│       └── components/
│           ├── ai-hub-view.tsx      # Command Center Asisten AI (/assistant)
│           ├── journal-ai-modal.tsx # Modal draf jurnal harian
│           ├── improve-writing-menu.tsx # Menu dropdown perbaikan tulisan
│           ├── blocker-advisor-modal.tsx# Modal diagnosis kendala & pesan mentor
│           ├── daily-reflection-modal.tsx# Modal refleksi terpandu Gibbs
│           ├── task-extraction-modal.tsx# Modal ekstraksi tugas dengan checkbox seleksi
│           ├── learning-extraction-modal.tsx# Modal ekstraksi pembelajaran
│           ├── quick-capture-card.tsx# Kartu tangkapan cepat di Dashboard
│           ├── progress-summary-card.tsx# Kartu ringkasan progres di Dashboard
│           └── weekly-report-ai-modal.tsx# Modal generator laporan mingguan AI
```

### 2.1. Mekanisme Multi-Model Fallback Chain
Untuk menjamin ketersediaan layanan saat kuota model utama habis atau mengalami *rate limit* (HTTP 429), `GeminiProvider` menerapkan rantai *fallback* otomatis berurutan:

1. **Gemini 3.8 Flash** (`gemini-3.8-flash`) — Model utama (reasoning & software engineering).
2. **Gemini 3.7 Flash** (`gemini-3.7-flash`) — Fallback tingkat 1.
3. **Gemini 3.6 Flash** (`gemini-3.6-flash`) — Fallback tingkat 2.
4. **Gemini 3.5 Flash** (`gemini-3.5-flash`) — Fallback tingkat 3.
5. **Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`) — Fallback tingkat 4.
6. **Gemini 3.1 Flash Lite** (`gemini-3.1-flash-lite`) — Fallback tingkat 5 (ultra-ringan).

Jika model saat ini mengembalikan kode status 429 (*Rate Limit / Quota Exceeded*) atau 404 (*Model Not Found*), sistem secara otomatis mencoba model berikutnya tanpa menghentikan atau menampilkan pesan error pada pengguna. Model yang berhasil merespons akan dicatat secara transparan pada metadata hasil generasi.

---

## 3. Fitur-Fitur Asisten AI

### 3.1. Journal Assistant & Writing Enhancer
- **Bantu Tulis Jurnal**: Mengubah catatan kasar atau bullet points menjadi narasi jurnal terstruktur yang rapi dan profesional sesuai standar pelaporan magang.
- **5 Mode Perbaikan Tulisan (`improveWritingAction`)**:
  1. *Formal & Profesional*: Nada bahasa resmi untuk laporan institusi.
  2. *Ringkas & Padat*: Mengeliminasi kata mubazir, fokus pada hasil akhir.
  3. *Teknis & Deskriptif*: Memperjelas terminologi rekayasa perangkat lunak (komponen, API, alur logika).
  4. *Berorientasi Tindakan*: Menggunakan kata kerja aktif yang menggambarkan kontribusi nyata.
  5. *Bahasa Baku (KBBI)*: Merapikan tata bahasa, ejaan, dan tanda baca sesuai kaidah Bahasa Indonesia.

### 3.2. Blocker Advisor & Mentor Communication
- **Diagnosis Kendala Teknis**:
  - Menganalisis pesan kesalahan (*error message*), gejala bug, dan hipotesis akar penyebab (*root cause*).
  - Memberikan 3–5 langkah debugging sistematis yang dapat dicoba sendiri sebelum bertanya.
  - Menyusun *Escalation Checklist* (apa saja yang wajib disiapkan sebelum menghubungi mentor).
- **Template Pesan Mentor**:
  - Menghasilkan draf pesan sopan, ringkas, dan jelas dalam Bahasa Indonesia santun yang siap disalin ke Slack/WhatsApp mentor (e.g. *Mas Farhan*).
  - Format pesan menyertakan: Konteks tugas, kendala spesifik yang dihadapi, langkah yang telah dicoba sendiri, dan bagian spesifik di mana bantuan dibutuhkan.

### 3.3. Daily Reflection Assistant (Siklus Gibbs)
- Mengimplementasikan metodologi refleksi terstruktur 5 tahap:
  1. *Deskripsi*: Apa pengalaman atau tantangan yang paling berkesan hari ini?
  2. *Perasaan & Pola Pikir*: Bagaimana emosi atau tingkat kepercayaan diri saat menghadapinya?
  3. *Evaluasi*: Apa yang berjalan dengan baik dan apa yang masih kurang optimal?
  4. *Analisis Teknis*: Pelajaran rekayasa perangkat lunak apa yang dapat dipetik?
  5. *Rencana Tindakan*: Apa yang akan dilakukan secara berbeda jika menghadapi situasi serupa di masa depan?

### 3.4. Quick Capture: Task & Learning Extraction
- Ditempatkan langsung pada halaman utama **Dashboard**.
- **Ekstraksi Tugas**: Mengurai catatan kasar intern menjadi daftar tugas terstruktur beserta estimasi prioritas (`high`, `medium`, `low`) dan tag teknis. Pengguna dapat mencentang tugas yang relevan sebelum menyimpannya ke daftar tugas.
- **Ekstraksi Pembelajaran**: Mengidentifikasi poin-poin pembelajaran penting (kategori: *Technical*, *Workflow/Git*, atau *Soft Skills*) untuk langsung disimpan ke modul Pembelajaran.

### 3.5. Weekly & Final Report Synthesis
- **Sintesis Laporan Mingguan**:
  - Mengambil data deterministik dari PostgreSQL untuk rentang tanggal yang dipilih: jurnal terverifikasi, tugas terselesaikan, pembelajaran tercatat, dan total jam kerja presensi.
  - Menghasilkan ringkasan eksekutif (*executive summary*), pencapaian utama, kendala & solusi, serta rencana minggu depan.
  - Dapat langsung dimasukkan ke dalam editor Laporan Mingguan (*Report Builder*).
- **Sintesis Laporan Akhir**:
  - Membantu menyusun draf bab-bab laporan akhir magang berdasarkan kumpulan seluruh aktivitas selama periode magang.

### 3.6. Asisten AI Command Center (`/assistant`)
- Pusat kendali terintegrasi dengan akses cepat ke seluruh 6 instrumen AI.
- Menampilkan status kuota harian, model aktif, jaminan privasi, dan indikator pemakaian.

---

## 4. Keamanan & Privasi (Privacy-First)

### 4.1. Server-Side Redactor (`redactor.ts`)
Setiap masukan teks yang dikirim pengguna dipindai terlebih dahulu menggunakan ekspresi reguler (*regex*) dengan sensitivitas tinggi untuk mendeteksi:
- **API Keys & Secrets**: OpenAI (`sk-...`), Google Gemini (`AIzaSy...`), AWS Access Keys (`AKIA...`), GitHub Personal Access Tokens (`ghp_...`), JWT Tokens, Generic Bearer Tokens.
- **Database Connection Strings**: PostgreSQL, MySQL, MongoDB, Redis URIs (lengkap dengan kata sandi yang disamarkan).
- **Informasi Pribadi (PII)**: Alamat email dan nomor telepon Indonesia (+62 / 08xx).

Jika data sensitif ditemukan:
1. Bagian rahasia diganti dengan tag `[REDACTED]`.
2. Pengguna mendapatkan pesan peringatan (*warning banner*) yang menjelaskan tipe data apa yang telah disamarkan demi keamanan.

### 4.2. Pengaturan Simpan Riwayat (`save_history`)
- Pengguna memiliki kontrol penuh atas penyimpanan data percakapan AI melalui menu **Pengaturan -> Asisten AI**.
- *Default*: **Mati** (mode privasi maksimal; prompt dan hasil AI hanya diproses secara transien di memori server).
- Tombol **Hapus Riwayat AI**: Menghapus seluruh log generasi dan token yang tersimpan di akun pengguna secara permanen.

---

## 5. Rate Limiting & Kuota Penggunaan

Untuk mencegah penyalahgunaan dan lonjakan biaya API:
- Setiap pengguna dibatasi maksimal **50 request AI per hari** (dapat disesuaikan melalui konfigurasi sistem).
- Kuota direset otomatis setiap pukul **00:00 WIB**.
- Bilah progres kuota harian ditampilkan di Command Center Asisten AI (`/assistant`) dan di kartu pengaturan AI.

---

## 6. Panduan Menambah Fitur AI Baru

Jika Anda ingin menambahkan modul AI baru di masa depan:

1. **Buat Prompt & Schema**:
   Buat file baru di `src/server/ai/prompts/[nama-fitur].ts`. Definisikan skema Zod keluaran terstruktur dan fungsi pembangun prompt.
2. **Buat Server Action**:
   Tambahkan server action di `src/features/ai/actions/ai-actions.ts`.
   - Periksa otentikasi user dengan `supabase.auth.getUser()`.
   - Panggil `checkDailyLimit(user.id)`.
   - Pindai masukan dengan `redactText(input)`.
   - Panggil `provider.generateStructuredOutput(...)`.
   - Catat penggunaan dengan `recordUsage(...)` dan `recordAIGeneration(...)`.
3. **Buat Komponen UI**:
   Buat modal dialog atau kartu interaktif di `src/features/ai/components/`. Gunakan pola review-before-save: tampilkan draf, berikan kontrol edit, dan simpan hanya setelah tombol konfirmasi ditekan.
4. **Tulis Unit Test**:
   Tambahkan pengujian unit di `src/server/ai/__tests__/` menggunakan `MockProvider` untuk memverifikasi isolasi dan penanganan kesalahan.
