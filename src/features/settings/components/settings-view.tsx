'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  User,
  Building2,
  Sun,
  Moon,
  Monitor,
  Save,
  Loader2,
  ShieldAlert,
  Clock,
  MapPin,
  Mail,
  FileText,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { AISettingsCard } from './ai-settings-card';
import { signOut } from '@/features/auth/actions/auth-actions';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import {
  profileSettingsSchema,
  internshipSettingsSchema,
  type ProfileSettingsInput,
  type InternshipSettingsInput,
} from '../schemas/settings-schema';
import {
  updateProfile,
  saveInternship,
  type SettingsData,
} from '../actions/settings-actions';

interface SettingsViewProps {
  initialData: SettingsData;
}

export function SettingsView({ initialData }: SettingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const profileForm = useForm<ProfileSettingsInput>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      fullName: initialData.profile?.fullName || '',
      timezone: initialData.profile?.timezone || 'Asia/Jakarta',
    },
  });

  // Internship Form with sensible defaults if no active internship yet
  const internshipForm = useForm<InternshipSettingsInput>({
    resolver: zodResolver(internshipSettingsSchema),
    defaultValues: {
      companyName:
        initialData.internship?.companyName || 'PT. Tiga Serangkai Pustaka Mandiri',
      roleTitle:
        initialData.internship?.roleTitle ||
        'Software Developer — Fullstack, Frontend, Backend, Mobile & Desktop',
      location: initialData.internship?.location || 'KOTA SURAKARTA',
      mentorName: initialData.internship?.mentorName || '',
      mentorContact: initialData.internship?.mentorContact || '',
      startDate: initialData.internship?.startDate || '2026-09-21',
      endDate: initialData.internship?.endDate || '2027-03-20',
      defaultStartTime: initialData.internship?.defaultStartTime?.slice(0, 5) || '08:00',
      defaultEndTime: initialData.internship?.defaultEndTime?.slice(0, 5) || '17:00',
      notes:
        initialData.internship?.notes ||
        'Program MagangHub Kemnaker RI — Periode 21 September 2026 s/d 20 Maret 2027.',
    },
  });

  const onProfileSubmit = (values: ProfileSettingsInput) => {
    startTransition(async () => {
      const res = await updateProfile(values);
      if (res.success) {
        toast.success(res.message || 'Profil berhasil disimpan');
      } else {
        toast.error(res.error || 'Gagal menyimpan profil');
      }
    });
  };

  const onInternshipSubmit = (values: InternshipSettingsInput) => {
    startTransition(async () => {
      const res = await saveInternship(values, initialData.internship?.id);
      if (res.success) {
        toast.success(res.message || 'Informasi magang berhasil disimpan');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menyimpan informasi magang');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <User className="size-3.5" />
            <span>Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('internship')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'internship'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Magang</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <Sun className="size-3.5" />
            <span>Tampilan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'ai'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Asisten AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'about'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <ShieldAlert className="size-3.5" />
            <span>Tentang</span>
          </button>
        </div>

        {/* Tab 1: Profil Pengguna */}
        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardHeader className="border-b border-border p-6">
                <CardTitle className="text-lg font-extrabold text-foreground">Profil Pengguna</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Kelola informasi akun dan preferensi waktu Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Mail className="size-3.5 text-[#5D7FE8]" />
                    <span>Email Akun</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={initialData.profile?.email || '-'}
                    disabled
                    className="bg-secondary/30 text-muted-foreground cursor-not-allowed rounded-xl border border-border text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email terhubung dengan autentikasi Supabase dan tidak dapat diubah di sini.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <User className="size-3.5 text-[#5D7FE8]" />
                    <span>Nama Lengkap</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Contoh: Muhammad Rakha Abimanyu"
                    className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                    {...profileForm.register('fullName')}
                    aria-invalid={!!profileForm.formState.errors.fullName}
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-xs text-destructive font-semibold">
                      {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Clock className="size-3.5 text-[#5D7FE8]" />
                    <span>Zona Waktu</span>
                  </Label>
                  <Input
                    id="timezone"
                    value="Asia/Jakarta (WIB)"
                    disabled
                    className="bg-secondary/30 text-muted-foreground cursor-not-allowed rounded-xl border border-border text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aplikasi ini dirancang khusus untuk waktu operasional Indonesia Barat (WIB).
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border p-6 bg-secondary/30">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>Simpan Profil</span>
                    </>
                  )}
                </button>
              </CardFooter>
            </form>
          </Card>

          {/* Sesi & Autentikasi */}
          <Card className="mt-4 rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-lg font-extrabold text-foreground">Sesi & Autentikasi</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Kelola sesi aktif kamu pada perangkat ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Keluar dari Akun</p>
                <p className="text-xs text-muted-foreground">Akhiri sesi aktif di peramban ini dan kembali ke halaman login.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await signOut();
                  });
                }}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="size-3.5" />
                    <span>Keluar dari Akun</span>
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Informasi Magang */}
        <TabsContent value="internship" className="mt-6">
          <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
            <form onSubmit={internshipForm.handleSubmit(onInternshipSubmit)}>
              <CardHeader className="border-b border-border p-6">
                <CardTitle className="text-lg font-extrabold text-foreground">
                  {initialData.internship ? 'Program Magang Aktif' : 'Daftarkan Program Magang'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {initialData.internship
                    ? 'Perbarui rincian tempat magang, jadwal kerja, dan informasi kontak pembimbing.'
                    : 'Lengkapi informasi tempat magang Anda untuk mulai mencatat kehadiran, jurnal harian, dan tugas.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Building2 className="size-3.5 text-[#5D7FE8]" />
                      <span>Nama Perusahaan / Instansi</span>
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Contoh: PT Tiga Serangkai"
                      className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('companyName')}
                      aria-invalid={!!internshipForm.formState.errors.companyName}
                    />
                    {internshipForm.formState.errors.companyName && (
                      <p className="text-xs text-destructive font-semibold">
                        {internshipForm.formState.errors.companyName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="roleTitle" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <FileText className="size-3.5 text-[#5D7FE8]" />
                      <span>Posisi / Divisi Magang</span>
                    </Label>
                    <Input
                      id="roleTitle"
                      placeholder="Contoh: Software Developer Intern"
                      className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('roleTitle')}
                      aria-invalid={!!internshipForm.formState.errors.roleTitle}
                    />
                    {internshipForm.formState.errors.roleTitle && (
                      <p className="text-xs text-destructive font-semibold">
                        {internshipForm.formState.errors.roleTitle.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin className="size-3.5 text-[#5D7FE8]" />
                    <span>Lokasi Kantor</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Contoh: Jl. Slamet Riyadi No. 50, Surakarta"
                    className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                    {...internshipForm.register('location')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mentorName" className="text-xs font-bold text-foreground">Nama Pembimbing / Mentor</Label>
                    <Input
                      id="mentorName"
                      placeholder="Contoh: Bpk. Hendro"
                      className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('mentorName')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mentorContact" className="text-xs font-bold text-foreground">Kontak Pembimbing (Email / No. HP)</Label>
                    <Input
                      id="mentorContact"
                      placeholder="Contoh: hendro@tigaserangkai.co.id"
                      className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('mentorContact')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate" className="text-xs font-bold text-foreground">Tanggal Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="rounded-xl border border-border bg-card text-foreground text-xs font-mono placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('startDate')}
                      aria-invalid={!!internshipForm.formState.errors.startDate}
                    />
                    {internshipForm.formState.errors.startDate && (
                      <p className="text-xs text-destructive font-semibold">
                        {internshipForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate" className="text-xs font-bold text-foreground">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="rounded-xl border border-border bg-card text-foreground text-xs font-mono placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('endDate')}
                      aria-invalid={!!internshipForm.formState.errors.endDate}
                    />
                    {internshipForm.formState.errors.endDate && (
                      <p className="text-xs text-destructive font-semibold">
                        {internshipForm.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="defaultStartTime" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Clock className="size-3.5 text-[#5D7FE8]" />
                      <span>Jam Masuk Standar</span>
                    </Label>
                    <Input
                      id="defaultStartTime"
                      type="time"
                      className="rounded-xl border border-border bg-card text-foreground text-xs font-mono placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('defaultStartTime')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="defaultEndTime" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Clock className="size-3.5 text-[#5D7FE8]" />
                      <span>Jam Pulang Standar</span>
                    </Label>
                    <Input
                      id="defaultEndTime"
                      type="time"
                      className="rounded-xl border border-border bg-card text-foreground text-xs font-mono placeholder:text-muted-foreground focus-visible:ring-primary/20"
                      {...internshipForm.register('defaultEndTime')}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-xs font-bold text-foreground">Catatan Tambahan</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Informasi tambahan terkait kebijakan magang, ketentuan pakaian, dsb."
                    className="rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus-visible:ring-primary/20"
                    {...internshipForm.register('notes')}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border p-6 bg-secondary/30">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>{initialData.internship ? 'Simpan Perubahan' : 'Simpan Program Magang'}</span>
                    </>
                  )}
                </button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 3: Tampilan & Tema */}
        <TabsContent value="appearance" className="mt-6">
          <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-lg font-extrabold text-foreground">Preferensi Tampilan</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Pilih tema visual yang paling nyaman untuk mata Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-between p-5 rounded-[22px] transition-all text-center ${
                    theme === 'light'
                      ? 'border-2 border-primary bg-primary/10 text-foreground shadow-xs'
                      : 'border border-border bg-secondary/30 text-foreground hover:bg-card'
                  }`}
                >
                  <Sun className="size-8 mb-3 text-[#5D7FE8]" />
                  <div>
                    <p className="text-sm font-extrabold">Mode Terang</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Kontras bersih untuk siang hari</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-between p-5 rounded-[22px] transition-all text-center ${
                    theme === 'dark'
                      ? 'border-2 border-primary bg-primary/10 text-foreground shadow-xs'
                      : 'border border-border bg-secondary/30 text-foreground hover:bg-card'
                  }`}
                >
                  <Moon className="size-8 mb-3 text-[#7B61FF] dark:text-[#A78BFA]" />
                  <div>
                    <p className="text-sm font-extrabold">Mode Gelap</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Nyaman di mata saat malam</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-between p-5 rounded-[22px] transition-all text-center ${
                    theme === 'system'
                      ? 'border-2 border-primary bg-primary/10 text-foreground shadow-xs'
                      : 'border border-border bg-secondary/30 text-foreground hover:bg-card'
                  }`}
                >
                  <Monitor className="size-8 mb-3 text-[#10B981] dark:text-[#34D399]" />
                  <div>
                    <p className="text-sm font-extrabold">Mengikuti Sistem</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Otomatis sesuai perangkat</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Asisten Magang AI */}
        <TabsContent value="ai" className="mt-6">
          <AISettingsCard />
        </TabsContent>

        {/* Tab 5: Tentang Aplikasi & Disclaimer */}
        <TabsContent value="about" className="mt-6 space-y-6">
          <Card className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-lg font-extrabold text-foreground">Tentang Internship Companion</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Informasi versi, lisensi, dan batasan operasional aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4 text-xs max-w-md">
                <span className="text-muted-foreground">Versi Aplikasi:</span>
                <span className="font-mono font-bold text-foreground">v0.1.0-mvp</span>

                <span className="text-muted-foreground">Zona Waktu Default:</span>
                <span className="font-bold text-foreground">Asia/Jakarta (WIB)</span>

                <span className="text-muted-foreground">Basis Data & Auth:</span>
                <span className="font-bold text-foreground">Supabase PostgreSQL + RLS</span>
              </div>

              {/* Disclaimer Alert */}
              <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-4.5 text-foreground">
                <div className="flex gap-3">
                  <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-amber-700 dark:text-amber-300">Pernyataan Batasan Tanggung Jawab (Disclaimer)</h4>
                    <p className="text-xs leading-relaxed text-foreground/85">
                      <strong>Internship Companion</strong> adalah aplikasi pendamping pribadi mandiri
                      yang dirancang khusus untuk membantu pencatatan, pemantauan tugas, jurnal harian,
                      dan pembuatan laporan magang secara terstruktur. Aplikasi ini <strong>TIDAK</strong>{' '}
                      terafiliasi dengan, disponsori oleh, atau berafiliasi resmi dengan MagangHub Kemnaker,
                      Kementerian Ketenagakerjaan RI, maupun sistem presensi internal perusahaan tempat magang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                Hak Cipta &copy; {new Date().getFullYear()} Internship Companion. Dibangun untuk kebutuhan pribadi
                pengelolaan magang Software Developer.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
