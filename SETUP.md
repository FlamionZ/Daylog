# Setup Guide — Internship Companion

## Prerequisites

1. **Node.js 18+** — [Download](https://nodejs.org/)
2. **pnpm 10+** — `npm install -g pnpm`
3. **Supabase account** — [supabase.com](https://supabase.com/)

## 1. Clone & Install

```bash
git clone <repo-url>
cd MagangHub
pnpm install
```

## 2. Supabase Setup

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Salin URL dan anon key dari **Settings → API**.
3. Salin connection string dari **Settings → Database → Connection String → URI**.

## 3. Environment Variables

```bash
cp .env.example .env.local
```

Isi variabel berikut di `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

> ⚠️ Jangan commit `.env.local` ke repository.

## 4. Database Migration

```bash
pnpm db:push    # Development: push schema langsung
pnpm db:migrate # Production: run generated migrations
```

## 5. Seed Data (Development)

```bash
pnpm db:seed
```

## 6. Run Development Server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

## 7. Verify Setup

```bash
pnpm typecheck  # TypeScript check
pnpm lint       # ESLint
pnpm test       # Unit tests
pnpm build      # Production build
```
