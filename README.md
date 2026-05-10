# Smart Job

Two-sided job platform. Applicants browse a public job board, apply with a CV, and track everything in a personal kanban. Recruiters post jobs under a company, manage a multi-job applicant inbox, and monitor a hiring funnel. Status changes mirror live across both sides over Server-Sent Events.

**Stack**
- API: Node 20, Express, Prisma, Postgres, Zod, JWT (HttpOnly cookie), nodemailer
- Web: Vite, React 18, TypeScript, Tailwind, TanStack Query, dnd-kit, Recharts
- Monorepo: pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- CI: GitHub Actions

## Quick start (Docker — recommended)

Requires Docker Desktop.

```bash
docker start smartjob-pg              # Postgres on host port 5433
pnpm install
pnpm --filter api exec prisma db push
pnpm --filter api run prisma:seed
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:4000
- API docs (Swagger): http://localhost:4000/api/docs

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Applicant | `demo@smartjob.local` | `demo1234` |
| Recruiter | `recruiter@smartjob.local` | `demo1234` |

## Repo layout

```
apps/
  api/                   Express + Prisma backend (controller / service / repository per feature)
  web/                   React + Tailwind frontend
packages/
  shared/                Zod schemas + DTOs imported by both apps
.github/workflows/ci.yml CI: typecheck + tests on every push
documentation/           Design notes
```

## Features

- Public job board with full-text search, location filter, salary range slider, remote-only toggle, and skill chips
- Saved jobs (bookmark from any job card; dedicated tab in the applicant nav)
- Applicant kanban with drag-and-drop status changes (off-platform applications); in-platform applications are shown read-only since the recruiter manages status
- Withdraw flow for in-platform applications
- Recruiter posting with skills, salary range, remote flag, and per-job custom application questions
- CV upload (PDF/DOC/DOCX/TXT, 5 MB) with PDF preview rendered inline in the recruiter detail view
- Recruiter inbox: cross-job applicant feed with status filter chips and bulk move/reject
- Per-job recruiter board with drag-and-drop
- Recruiter funnel: pipeline counts, conversion rates per stage, median days to offer, monthly trend
- Public company profile pages with open roles
- Real-time updates via SSE: status changes from the recruiter invalidate the applicant's cache instantly (and vice versa for new applications)
- Email verification + password reset flows (dev: emails go to JSON transport; prod: SMTP env vars)
- OpenAPI doc + Swagger UI at `/api/docs`

## Scripts (root)

| Command | What it does |
|---|---|
| `pnpm dev` | Run api + web in parallel |
| `pnpm build` | Build both apps |
| `pnpm test` | Run all workspace tests |
| `pnpm typecheck` | Typecheck everything |
| `pnpm --filter api run prisma:seed` | Seed demo data |
| `pnpm --filter api exec prisma migrate deploy` | Apply migrations |

## Environment

`apps/api/.env`:

```
DATABASE_URL="postgresql://smartjob:smartjob@localhost:5433/smartjob?schema=public"
JWT_SECRET="change-me-change-me-change-me"
WEB_ORIGIN="http://localhost:5173"

# Optional SMTP (leave unset for JSON transport in dev)
SMTP_HOST=
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM="Smart Job <noreply@smartjob.local>"
```

`apps/web` reads `VITE_API_URL` (defaults to `http://localhost:4000/api`).

## Deploy

The repo is structured for a typical small-app deployment:

### API (Railway / Fly.io / Render)

1. Create a Postgres instance (Neon, Supabase, Railway, or RDS).
2. Set the API service to build from `apps/api`:
   - Build: `pnpm install --frozen-lockfile && pnpm --filter api exec prisma generate && pnpm --filter api run build`
   - Start: `pnpm --filter api exec prisma migrate deploy && pnpm --filter api start`
3. Env vars: `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN` (your web URL), `MAIL_FROM`, `SMTP_*` if you have a transactional email provider.
4. Expose port 4000 and add the public URL to the web app's env.

### Web (Vercel / Netlify / Cloudflare Pages)

1. Build settings:
   - Build command: `pnpm install --frozen-lockfile && pnpm --filter web run build`
   - Output directory: `apps/web/dist`
   - Install command: leave default (the build step covers it)
2. Env vars: `VITE_API_URL=https://<your-api-domain>/api`.
3. Make sure cookies work cross-origin: the API already sets `credentials: include` and the cookie is `SameSite=Lax; Secure` in production. Your API and web domains must both be HTTPS.

### Database (Neon free tier)

1. Create a Neon project, grab the connection string with `?sslmode=require&pgbouncer=true`.
2. From your machine: `pnpm --filter api exec prisma migrate deploy` against the new database.
3. Optionally seed: `DATABASE_URL=... pnpm --filter api run prisma:seed`.

## Testing

```bash
pnpm test                  # all workspaces
pnpm --filter api test     # api only
pnpm --filter web test     # web only
```

Tests cover Zod schema validation, public/auth-gate routing, and pure formatters. CI runs typecheck + tests on every push.
