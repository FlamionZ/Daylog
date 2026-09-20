# Deployment Guide — Internship Companion

## Platform

Vercel (recommended) — compatible with Next.js App Router.

## Prerequisites

1. Vercel account connected to Git repository.
2. Supabase production project.

## Environment Variables

Set the following in Vercel project settings:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service role key |
| `DATABASE_URL` | Production connection string |

## Database Migration

Before first deploy, run migrations against the production database:

```bash
DATABASE_URL=<production-url> pnpm db:migrate
```

## Deploy

Push to `main` branch. Vercel auto-deploys.

## CI Pipeline

Recommended CI steps before deploy:

```yaml
- pnpm install --frozen-lockfile
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
```

## Post-Deploy Checks

1. Verify login works.
2. Check RLS policies on production data.
3. Verify file upload to private bucket.
4. Confirm HTTPS enforced.
5. Check error monitoring (Sentry) receives events.
