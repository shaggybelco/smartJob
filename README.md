# Smart Job Application Tracker

A full-stack web app for tracking job applications through the hiring pipeline.
Register, log applications, monitor interview progress, and view analytics.

**Stack:** Express + TypeScript + Prisma + Postgres (API) · Vite + React + TypeScript + Tailwind + shadcn/ui (web) · pnpm monorepo · Docker for local dev.

---

## Quick start (Docker — recommended)

Requires Docker Desktop.

```bash
docker compose up --build
```

- Web: http://localhost:5173
- API health: http://localhost:4000/api/health
- Postgres: `localhost:5432` (user `smartjob`, password `smartjob`, db `smartjob`)

Hot reload is enabled for both `apps/api` and `apps/web` — edits on the host trigger reloads inside the containers.

To stop and wipe the database volume:

```bash
docker compose down -v
```

## Local dev (without Docker)

Requires Node 20+, pnpm 9+, and a running Postgres.

```bash
pnpm install
cp .env.example .env                      # adjust DATABASE_URL if needed
pnpm --filter api prisma migrate dev
pnpm dev                                  # runs api + web in parallel
```

## Repo layout

```
apps/
  api/         Express + TS + Prisma REST API (port 4000)
  web/         Vite + React + TS + Tailwind (port 5173)
packages/
  shared/      Zod schemas + DTOs shared by api and web
documentation/ Design docs and plans
docker-compose.yml
```

## Scripts (run from repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Run api and web in parallel (no Docker) |
| `pnpm build` | Build both apps |
| `pnpm test` | Run all workspaces' tests |
| `pnpm typecheck` | Typecheck all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm docker:up` | `docker compose up --build` |
| `pnpm docker:down` | `docker compose down -v` |
