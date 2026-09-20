import { getDb } from '../index';
import {
  profiles,
  internships,
  attendanceRecords,
  tasks,
  taskLinks,
  journals,
  journalTasks,
  learnings,
  reports,
} from '../schema';

/**
 * Development seed script per Schema.md §9
 * Run via: pnpm db:seed
 */
async function seed() {
  console.log('🌱 Starting database seed...');
  const db = getDb();

  const devUserId = 'a0000000-0000-0000-0000-000000000001';

  // 1. Profile
  console.log('Creating profile...');
  await db
    .insert(profiles)
    .values({
      userId: devUserId,
      fullName: 'Rakha Pratama',
      avatarPath: null,
      timezone: 'Asia/Jakarta',
    })
    .onConflictDoNothing();

  // 2. Internship
  console.log('Creating internship...');
  const [internship] = await db
    .insert(internships)
    .values({
      userId: devUserId,
      companyName: 'PT Tiga Serangkai',
      roleTitle: 'Software Developer Intern',
      location: 'Surakarta, Jawa Tengah',
      mentorName: 'Budi Santoso',
      mentorContact: 'budi.santoso@tigaserangkai.co.id',
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      defaultStartTime: '08:00:00',
      defaultEndTime: '17:00:00',
      isActive: true,
      notes: 'Program magang 3 bulan di divisi teknologi informasi.',
    })
    .onConflictDoNothing()
    .returning();

  const internshipId = internship?.id;
  if (!internshipId) {
    console.log('Internship already exists or failed to return id.');
    return;
  }

  // 3. Tasks
  console.log('Creating 10 tasks across statuses...');
  const taskData = [
    {
      title: 'Setup repositori dan arsitektur awal',
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: '2026-09-05',
      estimateMinutes: 240,
      actualMinutes: 210,
    },
    {
      title: 'Eksplorasi skema database dan Drizzle ORM',
      status: 'done' as const,
      priority: 'medium' as const,
      dueDate: '2026-09-08',
      estimateMinutes: 180,
      actualMinutes: 160,
    },
    {
      title: 'Integrasi sistem autentikasi Supabase & RLS',
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: '2026-09-15',
      estimateMinutes: 300,
    },
    {
      title: 'Implementasi modul pencatatan kehadiran',
      status: 'in_progress' as const,
      priority: 'urgent' as const,
      dueDate: '2026-09-18',
      estimateMinutes: 360,
    },
    {
      title: 'Desain editor jurnal harian terstruktur',
      status: 'review' as const,
      priority: 'medium' as const,
      dueDate: '2026-09-20',
      estimateMinutes: 240,
    },
    {
      title: 'Sinkronisasi offline-first untuk form kehadiran',
      status: 'blocked' as const,
      priority: 'low' as const,
      dueDate: '2026-09-25',
      description: 'Menunggu klarifikasi kebijakan browser caching dari tim mentor.',
    },
    {
      title: 'Pembuatan generator laporan mingguan deterministik',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: '2026-09-28',
      estimateMinutes: 420,
    },
    {
      title: 'Implementasi manajemen dokumen dan unggah file',
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: '2026-10-02',
      estimateMinutes: 240,
    },
    {
      title: 'Audit kepatuhan aksesibilitas WCAG AA',
      status: 'backlog' as const,
      priority: 'medium' as const,
      dueDate: '2026-10-15',
    },
    {
      title: 'Export laporan ke format PDF',
      status: 'backlog' as const,
      priority: 'low' as const,
      dueDate: '2026-10-25',
    },
  ];

  const createdTasks = await db
    .insert(tasks)
    .values(
      taskData.map((t, idx) => ({
        userId: devUserId,
        internshipId,
        sortOrder: String(idx + 1),
        ...t,
      })),
    )
    .returning();

  // 4. Task Links
  if (createdTasks[0]) {
    await db.insert(taskLinks).values({
      userId: devUserId,
      taskId: createdTasks[0].id,
      linkType: 'repository',
      label: 'GitHub Repo',
      url: 'https://github.com/rakha/internship-companion',
    });
  }

  // 5. Attendance Records (7 days)
  console.log('Creating 7 attendance records...');
  await db.insert(attendanceRecords).values([
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-08',
      workMode: 'wfo',
      checkInAt: '2026-09-08T01:05:00Z', // 08:05 WIB
      checkOutAt: '2026-09-08T10:15:00Z', // 17:15 WIB
      breakMinutes: 60,
      location: 'Kantor Pusat PT Tiga Serangkai',
      notes: 'Orientasi hari pertama.',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-09',
      workMode: 'wfo',
      checkInAt: '2026-09-09T00:58:00Z', // 07:58 WIB
      checkOutAt: '2026-09-09T10:05:00Z', // 17:05 WIB
      breakMinutes: 60,
      location: 'Kantor Pusat PT Tiga Serangkai',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-10',
      workMode: 'wfo',
      checkInAt: '2026-09-10T01:10:00Z', // 08:10 WIB
      checkOutAt: '2026-09-10T10:30:00Z', // 17:30 WIB
      breakMinutes: 60,
      location: 'Kantor Pusat PT Tiga Serangkai',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-11',
      workMode: 'wfh',
      checkInAt: '2026-09-11T01:00:00Z', // 08:00 WIB
      checkOutAt: '2026-09-11T10:00:00Z', // 17:00 WIB
      breakMinutes: 60,
      location: 'Rumah',
      notes: 'WFH sesuai jadwal divisi.',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-12',
      workMode: 'wfo',
      checkInAt: '2026-09-12T00:55:00Z', // 07:55 WIB
      checkOutAt: '2026-09-12T09:30:00Z', // 16:30 WIB
      breakMinutes: 60,
      location: 'Kantor Pusat PT Tiga Serangkai',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-15',
      workMode: 'wfo',
      checkInAt: '2026-09-15T01:02:00Z', // 08:02 WIB
      checkOutAt: '2026-09-15T10:10:00Z', // 17:10 WIB
      breakMinutes: 60,
      location: 'Kantor Pusat PT Tiga Serangkai',
    },
    {
      userId: devUserId,
      internshipId,
      workDate: '2026-09-16',
      workMode: 'wfo',
      checkInAt: '2026-09-16T01:00:00Z', // 08:00 WIB
      checkOutAt: null, // Still working today
      breakMinutes: 0,
      location: 'Kantor Pusat PT Tiga Serangkai',
      notes: 'Hari aktif sedang berjalan.',
    },
  ]);

  // 6. Journals (6 journals: 4 completed, 2 draft)
  console.log('Creating 6 journals...');
  const createdJournals = await db
    .insert(journals)
    .values([
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-08',
        title: 'Orientasi & Pengenalan Tim Pengembang',
        summary: 'Mengikuti sesi onboarding dan setup lingkungan kerja lokal.',
        activities: '- Pengenalan anggota tim dan struktur divisi TI\n- Pemasangan tooling dan dependency proyek\n- Review SOP kerja magang',
        learnings: 'Memahami arsitektur aplikasi monolitik yang digunakan tim.',
        status: 'completed',
        completedAt: '2026-09-08T10:15:00Z',
      },
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-09',
        title: 'Eksplorasi Basis Data dan Skema ERD',
        summary: 'Mempelajari relasi database dan alur data utama.',
        activities: '- Analisis ERD dan relasi antar tabel\n- Membaca dokumentasi API internal',
        learnings: 'Penggunaan composite key dan partial unique index di PostgreSQL.',
        status: 'completed',
        completedAt: '2026-09-09T10:05:00Z',
      },
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-10',
        title: 'Setup Autentikasi dan Kebijakan RLS',
        summary: 'Mengonfigurasi auth guard dan proteksi rute di Next.js App Router.',
        activities: '- Membuat middleware auth refresh\n- Menyusun policy Row Level Security',
        learnings: 'Pentingnya validasi sesi di middleware Next.js menggunakan Supabase SSR.',
        status: 'completed',
        completedAt: '2026-09-10T10:30:00Z',
      },
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-11',
        title: 'Pembangunan Komponen Antarmuka Pengguna',
        summary: 'Membangun komponen UI berbasis design system tokens.',
        activities: '- Membuat Button, Card, Dialog, Input\n- Menguji dark mode toggle',
        learnings: 'Implementasi Tailwind CSS v4 dengan variabel CSS HSL.',
        status: 'completed',
        completedAt: '2026-09-11T10:00:00Z',
      },
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-12',
        title: 'Pencatatan Kehadiran & Form Check-In',
        summary: 'Mendesain modal interaktif untuk check-in dan check-out.',
        activities: '- Membuat modal check-in dengan default waktu lokal Asia/Jakarta',
        status: 'draft',
      },
      {
        userId: devUserId,
        internshipId,
        journalDate: '2026-09-15',
        title: 'Review Sprint Mingguan & Refactoring',
        summary: 'Mengevaluasi progres mingguan bersama mentor.',
        activities: '- Diskusi progres tugas\n- Refactoring utilitas penanggalan',
        status: 'draft',
      },
    ])
    .returning();

  // 7. Journal Tasks junction
  if (createdJournals[0] && createdTasks[0]) {
    await db.insert(journalTasks).values([
      {
        userId: devUserId,
        journalId: createdJournals[0].id,
        taskId: createdTasks[0].id,
      },
    ]);
  }

  // 8. Learnings (5 records)
  console.log('Creating 5 learnings...');
  await db.insert(learnings).values([
    {
      userId: devUserId,
      internshipId,
      topic: 'Next.js App Router & Turbopack',
      technology: 'Next.js',
      summary: 'Memahami arsitektur server components, routing groups, dan dynamic rendering.',
      level: 'practicing',
      learnedOn: '2026-09-08',
    },
    {
      userId: devUserId,
      internshipId,
      topic: 'PostgreSQL Row Level Security (RLS)',
      technology: 'PostgreSQL',
      summary: 'Mengimplementasikan keamanan multi-tenant pada level baris database menggunakan auth.uid().',
      level: 'practicing',
      learnedOn: '2026-09-10',
    },
    {
      userId: devUserId,
      internshipId,
      topic: 'Tailwind CSS v4 CSS Variables Token System',
      technology: 'Tailwind CSS',
      summary: 'Mengonfigurasi tema warna berbasis HSL tanpa file konfigurasi JS lama.',
      level: 'confident',
      learnedOn: '2026-09-11',
    },
    {
      userId: devUserId,
      internshipId,
      topic: 'Drizzle ORM Type-Safe Queries & Relations',
      technology: 'Drizzle ORM',
      summary: 'Mendefinisikan skema, relasi, dan migrasi SQL otomatis yang aman.',
      level: 'practicing',
      learnedOn: '2026-09-12',
    },
    {
      userId: devUserId,
      internshipId,
      topic: 'Web Accessibility & WCAG AA Standards',
      technology: 'Accessibility',
      summary: 'Menjamin kontras warna, focus ring yang terlihat, dan navigasi keyboard yang ramah pembaca layar.',
      level: 'learning',
      learnedOn: '2026-09-15',
    },
  ]);

  // 9. Draft Report
  console.log('Creating draft weekly report...');
  await db.insert(reports).values({
    userId: devUserId,
    internshipId,
    reportType: 'weekly',
    periodStart: '2026-09-08',
    periodEnd: '2026-09-12',
    title: 'Laporan Mingguan — Minggu ke-1 (8 Sep - 12 Sep 2026)',
    contentMarkdown: `## Ringkasan Minggu ke-1\nMinggu pertama magang difokuskan pada orientasi, setup lingkungan pengembang, dan penyusunan arsitektur dasar aplikasi.\n\n### Pencapaian:\n1. Menyelesaikan setup repositori dan konfigurasi Next.js 16.\n2. Mendesain dan memvalidasi skema database 10 tabel di PostgreSQL.\n3. Mengimplementasikan token sistem desain sesuai pedoman visual.\n\n### Kendala:\nTidak ada kendala berarti pada minggu pertama.`,
    statistics: {
      workingDays: 5,
      workedMinutes: 2280,
      completedTasks: 2,
      blockedTasks: 0,
      completedJournals: 4,
    },
    status: 'draft',
  });

  console.log('✅ Database seed completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
