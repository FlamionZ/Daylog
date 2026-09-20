# Product Design — Internship Companion

## 1. Design Direction

Aplikasi dirancang sebagai workspace pribadi yang tenang, cepat, dan profesional. Visual tidak meniru MagangHub agar tidak menimbulkan kesan sebagai aplikasi resmi. Fokus utama adalah pencatatan harian dengan friksi rendah.

### Design keywords

- Focused
- Calm
- Technical
- Trustworthy
- Compact, tetapi tidak padat
- Mobile-friendly

## 2. Product Identity

### Working name

**Internship Companion**

Alternatif: **InternLog**, **Devtern**, atau **MagangLog**.

### Disclaimer

Tampilkan pada halaman About/Settings:

> Aplikasi pribadi untuk membantu pencatatan aktivitas magang. Tidak terafiliasi dengan atau menggantikan MagangHub Kemnaker maupun sistem internal perusahaan.

### Tone of voice

- Ringkas dan membantu.
- Menggunakan Bahasa Indonesia yang natural.
- Hindari istilah administratif yang tidak perlu.
- Error menjelaskan tindakan berikutnya.

Contoh:

- “Kehadiran hari ini sudah tercatat.”
- “Kamu belum check-out. Catat sebelum menutup hari?”
- “Jurnal tersimpan sebagai draft.”

## 3. Visual Foundation

### Color palette

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| `background` | `#F7F8FA` | `#0B0F14` | Latar aplikasi |
| `surface` | `#FFFFFF` | `#121821` | Card dan panel |
| `foreground` | `#172033` | `#EDF2F7` | Teks utama |
| `muted` | `#667085` | `#98A2B3` | Teks sekunder |
| `border` | `#E4E7EC` | `#293241` | Border |
| `primary` | `#2563EB` | `#60A5FA` | Aksi utama |
| `success` | `#15803D` | `#4ADE80` | Selesai/berhasil |
| `warning` | `#B45309` | `#FBBF24` | Deadline/peringatan |
| `danger` | `#B42318` | `#F87171` | Error/urgent |
| `info` | `#0369A1` | `#38BDF8` | Informasi |

Jangan bergantung pada warna saja untuk menyampaikan status; gunakan label dan ikon.

### Typography

- Font utama: **Inter** atau system sans-serif.
- Font monospace: **Geist Mono** atau **JetBrains Mono** untuk branch/commit.
- Base size: 16 px.
- Heading page: 28/34, semibold.
- Heading section: 20/28, semibold.
- Body: 15–16/24.
- Caption: 12–13/18.

### Spacing and radius

- Grid dasar: 4 px.
- Spacing umum: 8, 12, 16, 24, 32 px.
- Card radius: 12 px.
- Input/button radius: 8 px.
- Jangan menggunakan shadow berat; prioritaskan border halus.

## 4. Information Architecture

```text
Dashboard
Attendance
Journals
Tasks
Learnings
Reports
Documents
Settings
```

### Desktop navigation

- Sidebar kiri 240 px.
- Logo/nama aplikasi di atas.
- Navigasi utama di tengah.
- Profil dan Settings di bawah.

### Mobile navigation

Bottom navigation menampilkan maksimal lima item:

1. Home
2. Attendance
3. Tasks
4. Journal
5. More

Menu More berisi Learnings, Reports, Documents, dan Settings.

## 5. Core Layout

### App shell

- Sidebar atau bottom navigation.
- Header berisi judul halaman, tanggal, dan primary action.
- Lebar konten maksimum 1440 px.
- Dashboard menggunakan 12-column grid pada desktop dan satu kolom pada mobile.

### Page header pattern

```text
[Judul halaman]                     [Primary action]
[Deskripsi singkat / rentang waktu] [Secondary action]
```

Pada mobile, action utama menjadi sticky button atau floating action button jika relevan.

## 6. Dashboard Design

### Hierarchy

1. Salam, posisi, serta hari ke-n magang.
2. Attendance card hari ini.
3. Quick actions.
4. Tugas prioritas.
5. Weekly progress.
6. Jurnal terbaru dan learning highlights.

### Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ Selamat malam, Rakha                      Minggu ke-3 dari 12 │
│ Software Developer Intern · PT Tiga Serangkai                │
├───────────────────────────────┬──────────────────────────────┤
│ Attendance hari ini           │ Progress minggu ini          │
│ Check-in 08:02 · WFO          │ 4/5 jurnal · 6 tugas selesai │
│ [Check-out]                   │ [Lihat laporan]              │
├───────────────────────────────┴──────────────────────────────┤
│ [+ Jurnal] [+ Tugas] [+ Learning]                            │
├──────────────────────────────────────┬───────────────────────┤
│ Tugas prioritas                     │ Deadline terdekat     │
│ • Fix validation error · Review     │ 21 Sep · API docs     │
│ • Implement dashboard · In Progress │ 23 Sep · Unit tests   │
├──────────────────────────────────────┼───────────────────────┤
│ Aktivitas 7 hari                    │ Jurnal terbaru        │
│ [compact bar/line visualization]    │ Ringkasan hari ini    │
└──────────────────────────────────────┴───────────────────────┘
```

### Empty state

Jika belum ada data:

- Judul: “Mulai hari pertamamu”
- Deskripsi: “Atur periode magang, lalu catat kehadiran atau tugas pertama.”
- CTA: “Lengkapi profil magang”

## 7. Attendance Experience

### States

- Belum check-in.
- Sedang bekerja.
- Selesai bekerja.
- Izin/sakit/libur.
- Membutuhkan koreksi.

### Interaction

**Check-in modal:**

- Mode kerja.
- Waktu sekarang sebagai default.
- Lokasi opsional.
- Catatan opsional.

**Check-out modal:**

- Waktu sekarang sebagai default.
- Durasi istirahat.
- Ringkasan singkat opsional.
- CTA sekunder: “Buat jurnal hari ini”.

### Attendance list

Gunakan calendar strip untuk mobile dan tabel ringkas untuk desktop. Kolom desktop:

- Tanggal
- Mode
- Check-in
- Check-out
- Durasi
- Status
- Aksi

## 8. Journal Experience

### Journal editor

Gunakan form terstruktur, bukan editor kosong sepenuhnya:

1. Ringkasan hari ini.
2. Apa yang dikerjakan?
3. Apa yang dipelajari?
4. Kendala yang ditemui.
5. Solusi atau tindak lanjut.
6. Rencana berikutnya.
7. Tugas terkait.

### UX details

- Autosave dengan indikator “Tersimpan”.
- Keyboard shortcut `Cmd/Ctrl + S`.
- Tombol “Selesaikan jurnal”.
- Template prompt singkat pada setiap field.
- Jangan menghapus draft saat pengguna berpindah halaman.
- Pada mobile, gunakan accordion section agar form tidak terasa panjang.

## 9. Task Experience

### MVP list view

Toolbar:

- Search.
- Filter status.
- Filter prioritas.
- Filter deadline.
- Sort.
- Tombol “Tambah tugas”.

Setiap task row/card menampilkan:

- Judul.
- Status chip.
- Prioritas.
- Deadline.
- Link indicator.
- Tombol quick status change.

### Status colors

| Status | Treatment |
|---|---|
| Backlog | Gray |
| Todo | Blue outline |
| In Progress | Blue filled subtle |
| Review | Purple |
| Blocked | Red |
| Done | Green |

### Task detail drawer

Di desktop, buka side drawer agar konteks list tetap terlihat. Di mobile, gunakan full-screen sheet.

Bagian:

- Description.
- Status/priority/deadline.
- Time estimate/actual.
- Links.
- Related journals.
- Activity timestamps.

## 10. Learnings Experience

Tampilan berupa searchable card list atau timeline.

Learning card:

- Topic dan technology.
- Level badge.
- Tanggal.
- Ringkasan dua baris.
- Source link.
- Relasi ke task/journal.

Level tidak divisualkan sebagai skor presisi. Gunakan empat tahap yang mudah dimengerti.

## 11. Reports Experience

### Report list

- Group berdasarkan bulan.
- Badge Draft/Final.
- Rentang tanggal.
- Statistik utama.
- Aksi preview, edit, export.

### Report builder

Layout desktop dua panel:

- Kiri: konfigurasi dan sumber data.
- Kanan: live preview laporan.

Pada mobile, gunakan step flow:

1. Pilih rentang.
2. Review data.
3. Edit laporan.
4. Export.

Finalisasi harus menggunakan confirmation dialog karena snapshot laporan akan dikunci.

## 12. Documents Experience

- Drag-and-drop pada desktop dan file picker pada mobile.
- Tampilkan batas ukuran dan tipe file sebelum upload.
- Progress bar selama upload.
- Filter kategori.
- Gunakan list view agar metadata mudah dipindai.
- Jangan menampilkan URL storage mentah.

## 13. Component Inventory

### Navigation

- `AppSidebar`
- `MobileBottomNav`
- `PageHeader`
- `Breadcrumbs`

### Feedback

- `Toast`
- `InlineAlert`
- `EmptyState`
- `Skeleton`
- `ConfirmDialog`
- `SaveStatus`

### Data display

- `MetricCard`
- `StatusBadge`
- `PriorityBadge`
- `ProgressRing`
- `ActivityTimeline`
- `DataTable`

### Forms

- `DatePicker`
- `TimePicker`
- `MarkdownTextarea`
- `TaskCombobox`
- `FileUploader`
- `SegmentedControl`

### Domain

- `AttendanceCard`
- `JournalEditor`
- `TaskCard`
- `TaskDetailDrawer`
- `LearningCard`
- `ReportPreview`

## 14. Responsive Behavior

Breakpoints yang disarankan:

- Mobile: `< 640px`
- Tablet: `640–1023px`
- Desktop: `≥ 1024px`

Aturan:

- Tabel berubah menjadi stacked cards pada mobile.
- Drawer berubah menjadi full-screen sheet.
- Dua kolom menjadi satu kolom.
- Primary action tetap mudah dijangkau ibu jari.
- Touch target minimum 44×44 px.
- Hindari horizontal scroll untuk form dan konten utama.

## 15. Accessibility

- Kontras teks mengikuti WCAG AA.
- Seluruh input memiliki label terlihat.
- Status tidak hanya dibedakan oleh warna.
- Focus ring minimal 2 px dan terlihat pada light/dark mode.
- Modal memerangkap fokus dan dapat ditutup dengan Escape.
- Icon-only button memiliki accessible name.
- Error form ditampilkan dekat field dan diumumkan melalui `aria-live`.
- Grafik memiliki ringkasan tekstual.
- Animasi menghormati `prefers-reduced-motion`.

## 16. Motion

Gunakan animasi hanya untuk membantu orientasi:

- Page transition: 150–200 ms fade.
- Drawer/sheet: 200–250 ms.
- Status update: subtle highlight.
- Hindari confetti atau motion berlebihan pada penggunaan harian.

## 17. Content Guidelines

### Date and time

- Tanggal: `20 Sep 2026`.
- Waktu: `08.00`.
- Durasi: `7j 30m`.
- Gunakan zona waktu Asia/Jakarta dan tampilkan jika berpotensi ambigu.

### Labels

Pilih kata kerja yang jelas:

- “Tambah tugas”, bukan “Buat”.
- “Simpan draft”.
- “Selesaikan jurnal”.
- “Finalisasi laporan”.
- “Export PDF”.

### Confirmations

Konfirmasi hanya untuk tindakan berisiko:

- Menghapus data.
- Finalisasi laporan.
- Mengganti file.
- Membatalkan perubahan yang belum tersimpan.

## 18. Dark Mode

- Ikuti preferensi sistem sebagai default.
- Pengguna dapat memilih Light, Dark, atau System.
- Warna status harus tetap terbaca pada kedua mode.
- Jangan hanya membalik warna; kurangi kontras border dan tingkatkan separation antar-surface.

## 19. Design Acceptance Checklist

- Semua alur utama dapat diselesaikan pada layar mobile.
- Pengguna dapat check-in dalam maksimal dua interaksi setelah membuka dashboard.
- Jurnal dapat dibuat tanpa memulai dari halaman kosong.
- State loading, empty, error, success, dan disabled tersedia.
- Tidak ada elemen yang mengklaim afiliasi resmi dengan MagangHub/Kemnaker.
- Seluruh komponen interaktif dapat diakses keyboard.
- Informasi rahasia perusahaan tidak diminta oleh UI.
- Desain konsisten dengan token warna, spacing, dan typography.
