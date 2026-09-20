# Internship Companion

Aplikasi pribadi untuk mengelola aktivitas magang sebagai Software Developer Intern di PT Tiga Serangkai, Surakarta.

> **Disclaimer:** Aplikasi ini bukan aplikasi resmi MagangHub Kemnaker atau PT Tiga Serangkai. Ini adalah proyek pribadi untuk membantu pencatatan aktivitas magang.

## Fitur

- 📋 Dashboard aktivitas magang
- ⏰ Pencatatan kehadiran (check-in/check-out)
- 📝 Jurnal harian terstruktur
- ✅ Task tracker dengan status dan prioritas
- 📚 Learning tracker
- 📊 Laporan mingguan, bulanan, dan akhir magang
- 📁 Penyimpanan dokumen
- 📄 Export laporan ke Markdown dan PDF

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Testing | Vitest, React Testing Library, Playwright |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- pnpm 10+
- Supabase project (free tier)

## Local Development

```bash
# Clone repository
git clone <repo-url>
cd MagangHub

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase credentials

# Run development server
pnpm dev

# Open http://localhost:3000
```

## Environment Variables

See `.env.example` for required variables:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Server only |
| `DATABASE_URL` | PostgreSQL connection string | For migrations |

## Database

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Seed development data
pnpm db:seed
```

## Testing

```bash
# Unit + integration tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Authentication routes
│   ├── (dashboard)/  # Protected dashboard routes
│   └── api/          # API routes
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # Navigation, headers
│   └── feedback/     # Empty states, skeletons
├── features/         # Domain-specific features
├── server/           # Server actions, services, repositories
├── db/               # Database schema, migrations, seed
├── lib/              # Utilities, validation, date helpers
├── providers/        # React context providers
├── types/            # Shared TypeScript types
└── test/             # Test utilities
```

## Security Notes

- Row Level Security (RLS) aktif pada seluruh tabel
- Service role key hanya digunakan di server
- File storage menggunakan private bucket dengan signed URL
- Tidak menyimpan source code, credential, atau informasi rahasia perusahaan
- Markdown di-sanitasi sebelum render

## Deployment

Lihat `DEPLOYMENT.md` untuk panduan deployment ke Vercel.

## License

Private project — not for redistribution.
