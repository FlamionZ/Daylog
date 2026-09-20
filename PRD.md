# Product Requirements Document — Internship Companion

## 1. Ringkasan

**Internship Companion** adalah aplikasi pribadi untuk membantu peserta magang mengelola aktivitas selama menjalani program di PT Tiga Serangkai, Surakarta sebagai Software Developer. Aplikasi berfungsi sebagai pendamping administratif dan produktivitas, bukan pengganti atau integrasi resmi dengan MagangHub Kemnaker.

## 2. Latar Belakang

Aktivitas magang tersebar dalam berbagai media: pencatatan kehadiran, tugas, jurnal harian, tautan pekerjaan, dokumentasi, dan laporan berkala. Kondisi ini menyulitkan pengguna untuk menjaga konsistensi pencatatan dan menyusun laporan akhir. Dibutuhkan satu aplikasi pribadi yang menyatukan seluruh aktivitas tersebut.

## 3. Tujuan Produk

- Menjadi sumber data utama untuk seluruh aktivitas magang.
- Mempermudah pencatatan jurnal dan kehadiran setiap hari.
- Membantu pengguna memantau tugas dan proyek.
- Menghasilkan laporan mingguan, bulanan, dan akhir magang.
- Menyimpan bukti pekerjaan dan dokumen penting secara terstruktur.
- Menjadi proyek portofolio yang menunjukkan kemampuan fullstack pengguna.

## 4. Non-Goals

- Menggantikan fungsi MagangHub atau sistem internal perusahaan.
- Mengirim data otomatis ke MagangHub pada versi awal.
- Mengambil data melalui scraping atau endpoint tidak resmi.
- Menjadi sistem HR untuk banyak perusahaan.
- Menjadi alat evaluasi resmi tanpa persetujuan perusahaan.

## 5. Target Pengguna

### Pengguna utama

Satu peserta magang yang menggunakan aplikasi secara pribadi.

### Pengguna tambahan — fase berikutnya

- Mentor yang melihat laporan melalui tautan read-only.
- Peserta magang lain jika produk dikembangkan menjadi multi-user.

## 6. Permasalahan Pengguna

1. Sulit mengingat aktivitas yang dikerjakan setiap hari.
2. Jurnal harian sering ditulis terlambat atau tidak konsisten.
3. Tugas, pull request, dokumentasi, dan catatan tersebar.
4. Rekap kehadiran dan laporan mingguan harus dibuat manual.
5. Bukti hasil kerja sulit ditemukan saat menyusun laporan akhir.

## 7. User Stories

- Sebagai peserta magang, saya ingin check-in dan check-out agar kehadiran tercatat.
- Sebagai peserta magang, saya ingin menulis jurnal harian dengan cepat agar aktivitas tidak terlupakan.
- Sebagai developer, saya ingin menghubungkan tugas dengan repository, branch, commit, dan pull request.
- Sebagai peserta magang, saya ingin melihat tugas berdasarkan status agar mengetahui prioritas berikutnya.
- Sebagai peserta magang, saya ingin mencatat pembelajaran dan kendala agar perkembangan saya terdokumentasi.
- Sebagai peserta magang, saya ingin membuat laporan otomatis agar tidak menyusun ulang seluruh catatan.
- Sebagai peserta magang, saya ingin menyimpan dokumen penting agar mudah ditemukan.

## 8. Ruang Lingkup MVP

### 8.1 Autentikasi dan profil

- Login menggunakan email dan password atau magic link.
- Profil berisi nama, posisi, perusahaan, lokasi, mentor, tanggal mulai, dan tanggal selesai.
- Zona waktu default: Asia/Jakarta.

### 8.2 Dashboard

- Hari ke-n dan sisa hari magang.
- Status kehadiran hari ini.
- Daftar tugas prioritas dan mendekati deadline.
- Jumlah tugas berdasarkan status.
- Ringkasan jurnal tujuh hari terakhir.
- Tombol cepat: check-in, tambah jurnal, dan tambah tugas.

### 8.3 Kehadiran

- Check-in dan check-out.
- Tipe kerja: WFO, WFH, hybrid, izin, sakit, atau libur.
- Lokasi dan catatan opsional.
- Durasi kerja dihitung otomatis.
- Pengguna dapat mengoreksi catatan miliknya.
- Rekap mingguan dan bulanan.

### 8.4 Jurnal harian

- Satu jurnal utama per tanggal.
- Field: ringkasan, aktivitas, pembelajaran, kendala, solusi, dan rencana berikutnya.
- Jurnal dapat dikaitkan dengan tugas.
- Status draft atau selesai.
- Markdown sederhana untuk isi jurnal.

### 8.5 Task tracker

- Membuat, mengubah, dan menghapus tugas.
- Status: Backlog, Todo, In Progress, Review, Blocked, dan Done.
- Prioritas: Low, Medium, High, dan Urgent.
- Deadline, estimasi, serta waktu aktual.
- Tautan repository, branch, commit, pull request, deployment, atau dokumentasi.
- Tampilan list sebagai MVP; Kanban menjadi fitur berikutnya.

### 8.6 Learning tracker

- Mencatat topik, teknologi, sumber belajar, dan ringkasan.
- Level pemahaman: Exploring, Learning, Practicing, dan Confident.
- Dapat dikaitkan dengan jurnal atau tugas.

### 8.7 Laporan

- Laporan mingguan berdasarkan kehadiran, jurnal, dan tugas.
- Rentang tanggal dapat dipilih.
- Pengguna dapat mengedit hasil sebelum finalisasi.
- Ekspor Markdown dan PDF.
- Template laporan berisi ringkasan, pekerjaan selesai, progres, pembelajaran, kendala, dan rencana selanjutnya.

### 8.8 Dokumen

- Upload file atau menyimpan tautan eksternal.
- Kategori: administrasi, laporan, sertifikat, hasil kerja, dan lainnya.
- Nama, deskripsi, tanggal, dan ukuran file.

## 9. Fitur Setelah MVP

- Kanban board dengan drag-and-drop.
- Integrasi GitHub resmi menggunakan OAuth.
- AI untuk merapikan jurnal dan menyusun draft laporan.
- Reminder jurnal dan check-out.
- Tautan laporan read-only untuk mentor.
- PWA dan dukungan offline.
- Import/export JSON sebagai backup.
- Multi-user dan multi-internship.

## 10. Alur Utama

### Daily flow

1. Pengguna membuka dashboard.
2. Pengguna melakukan check-in dan memilih mode kerja.
3. Pengguna melihat atau memperbarui tugas aktif.
4. Pada akhir hari, pengguna melakukan check-out.
5. Sistem menawarkan pembuatan jurnal dari tugas yang diperbarui hari itu.
6. Pengguna melengkapi jurnal dan menandainya selesai.

### Weekly report flow

1. Pengguna memilih minggu laporan.
2. Sistem mengumpulkan data kehadiran, jurnal, dan tugas.
3. Sistem membuat draft laporan deterministik.
4. Pengguna mengedit dan memfinalisasi laporan.
5. Pengguna mengekspor laporan ke Markdown atau PDF.

## 11. Functional Requirements

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Pengguna dapat login dan logout | Must |
| FR-02 | Pengguna dapat mengatur profil magang | Must |
| FR-03 | Pengguna dapat check-in dan check-out | Must |
| FR-04 | Sistem menghitung durasi kerja | Must |
| FR-05 | Pengguna dapat membuat dan mengedit jurnal | Must |
| FR-06 | Pengguna dapat mengelola tugas | Must |
| FR-07 | Pengguna dapat menautkan tugas dengan jurnal | Must |
| FR-08 | Dashboard menampilkan ringkasan aktivitas | Must |
| FR-09 | Pengguna dapat membuat laporan mingguan | Must |
| FR-10 | Pengguna dapat mengekspor laporan | Must |
| FR-11 | Pengguna dapat mengelola catatan pembelajaran | Should |
| FR-12 | Pengguna dapat menyimpan dokumen | Should |
| FR-13 | Pengguna dapat mencari dan memfilter data | Should |
| FR-14 | Pengguna menerima reminder | Could |
| FR-15 | AI membantu menyusun teks | Could |

## 12. Non-Functional Requirements

- **Responsif:** nyaman digunakan pada mobile mulai lebar 360 px.
- **Performa:** halaman utama mencapai LCP di bawah 2,5 detik pada koneksi normal.
- **Keamanan:** seluruh data hanya dapat diakses pemiliknya melalui Row Level Security.
- **Reliabilitas:** operasi penting memberikan status sukses/gagal yang jelas.
- **Aksesibilitas:** target WCAG 2.1 AA untuk kontras, fokus, label, dan navigasi keyboard.
- **Privasi:** tidak menyimpan source code, credential, atau informasi rahasia perusahaan.
- **Backup:** pengguna dapat mengekspor data utama.
- **Observability:** error aplikasi dicatat tanpa merekam isi jurnal atau data sensitif.

## 13. Success Metrics

- Jurnal selesai minimal 80% dari hari kerja.
- Waktu membuat jurnal harian kurang dari lima menit.
- Waktu menyusun laporan mingguan kurang dari sepuluh menit.
- Tidak ada kehilangan data pada penggunaan normal.
- Minimal 70% tugas memiliki bukti atau tautan hasil kerja.

## 14. Acceptance Criteria MVP

MVP dianggap selesai jika:

- Pengguna dapat login dan mengatur profil magang.
- Pengguna dapat mencatat kehadiran dan melihat rekapnya.
- Pengguna dapat membuat jurnal serta mengaitkannya dengan tugas.
- Pengguna dapat mengelola tugas melalui seluruh status.
- Dashboard menampilkan ringkasan yang akurat.
- Sistem dapat membuat laporan mingguan dari data yang tersimpan.
- Laporan dapat diekspor ke Markdown dan PDF.
- Akses data antar-user terisolasi meskipun MVP hanya dipakai satu orang.
- Aplikasi berhasil di-deploy dan dapat digunakan melalui mobile.

## 15. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Pencatatan terlalu rumit | Gunakan quick actions dan nilai default |
| Data perusahaan sensitif masuk ke aplikasi | Tampilkan peringatan dan panduan klasifikasi data |
| Lupa check-out | Sediakan reminder dan koreksi manual |
| Scope berkembang terlalu cepat | Bekukan scope MVP dan pindahkan ide ke backlog |
| Ketergantungan pada AI | Laporan dasar tetap dibuat tanpa AI |
| Dianggap aplikasi resmi | Gunakan disclaimer “personal companion, bukan aplikasi resmi” |

## 16. Milestone

1. **Foundation:** repository, autentikasi, database, dan design system.
2. **Core tracking:** profil, kehadiran, jurnal, dan tugas.
3. **Insights:** dashboard, learning tracker, dan filter.
4. **Reporting:** generator laporan serta ekspor.
5. **Hardening:** RLS, testing, accessibility, monitoring, dan deployment.
