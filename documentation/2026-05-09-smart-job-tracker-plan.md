# Plan: Smart Job Application Tracker — initial scaffold + Docker

## Context

The user is building a portfolio of two projects. Project 1 is a **Smart Job Application Tracker** — a full-stack web app where users register, log applications, track them through a hiring pipeline, view analytics, and (later) drag cards on a Kanban board. The directory `C:\Users\ShaggySambo\source\repos\SmartJobApplication` is currently empty. The user explicitly asked for Docker so they can spin the app up and test it locally.

This plan scaffolds the initial project: monorepo layout, Express+Prisma API, React+Vite web app, Postgres, and a `docker-compose` that brings everything up with one command. It establishes the foundation; subsequent plans will add features (auth flow, CRUD UIs, analytics, Kanban, etc.) on top.

## Decisions already locked with the user

| Area | Choice |
|---|---|
| Backend | Express + TypeScript |
| Database | Postgres 16 |
| ORM | Prisma |
| Frontend | Vite + React + TypeScript + Tailwind + shadcn/ui |
| Server state | TanStack Query |
| Client state | Zustand (light) |
| Validation | Zod (shared between FE/BE) |
| Auth | JWT in HttpOnly cookies + bcrypt |
| Forms | react-hook-form + Zod |
| Charts | Recharts |
| Kanban DnD | @dnd-kit |
| Package manager | pnpm (workspaces) |
| Repo layout | Monorepo: `apps/api`, `apps/web`, `packages/shared` |
| Testing | Vitest (unit), Playwright (E2E, deferred) |

## Target repo layout

```
SmartJobApplication/
├── apps/
│   ├── api/                       Express + TS + Prisma
│   │   ├── src/
│   │   │   ├── index.ts           server bootstrap
│   │   │   ├── app.ts             express app + middleware wiring
│   │   │   ├── env.ts             zod-validated env loader
│   │   │   ├── db.ts              PrismaClient singleton
│   │   │   ├── middleware/        auth, error, requestLogger
│   │   │   ├── routes/            auth.ts, applications.ts, events.ts,
│   │   │   │                      reminders.ts, analytics.ts
│   │   │   └── lib/               jwt.ts, password.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── tests/                 vitest
│   │   ├── Dockerfile             multi-stage; dev target uses tsx watch
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                       Vite + React + TS
│       ├── src/
│       │   ├── main.tsx, App.tsx, router.tsx, index.css
│       │   ├── api/               TanStack Query hooks per resource
│       │   ├── pages/             login/, register/, dashboard/,
│       │   │                      applications/, board/, settings/
│       │   ├── components/        AppShell, StatusBadge, EmptyState
│       │   ├── components/ui/     shadcn primitives
│       │   ├── features/          kanban/, analytics/
│       │   ├── lib/               auth context, theme, formatters
│       │   ├── stores/            zustand (uiPrefs)
│       │   └── types/             re-exports from @smartjob/shared
│       ├── tests/
│       ├── Dockerfile             dev target runs vite --host
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                    DTOs + Zod schemas, no runtime deps
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml             db + api + web (dev profile)
├── .env.example                   documents required vars
├── .gitignore
├── pnpm-workspace.yaml
├── package.json                   root scripts
├── tsconfig.base.json
└── README.md                      run instructions
```

## Data model (`apps/api/prisma/schema.prisma`)

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  passwordHash  String
  name          String
  createdAt     DateTime      @default(now())
  applications  Application[]
}

model Application {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     String
  role        String
  status      AppStatus    @default(APPLIED)
  source      String?
  salary      Int?
  jobUrl      String?
  location    String?
  notes       String?
  appliedAt   DateTime     @default(now())
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  events      Event[]
  reminders   Reminder[]
  @@index([userId, status])
}

model Event {
  id             String       @id @default(cuid())
  applicationId  String
  application    Application  @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  type           EventType
  occurredAt     DateTime     @default(now())
  notes          String?
}

model Reminder {
  id             String       @id @default(cuid())
  applicationId  String
  application    Application  @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  dueAt          DateTime
  message        String
  completed      Boolean      @default(false)
}

enum AppStatus { APPLIED SCREENING INTERVIEW OFFER REJECTED }
enum EventType { APPLIED SCREENING INTERVIEW OFFER REJECTED NOTE }
```

## API surface (`/api` prefix)

```
POST   /auth/register           public
POST   /auth/login              public  → sets HttpOnly cookie `token`
POST   /auth/logout             auth    → clears cookie
GET    /auth/me                 auth

GET    /applications            auth    ?status= &q= &sort= &page= &pageSize=
POST   /applications            auth
GET    /applications/:id        auth
PATCH  /applications/:id        auth
DELETE /applications/:id        auth

GET    /applications/:id/events auth
POST   /applications/:id/events auth

POST   /applications/:id/reminders  auth
PATCH  /reminders/:id               auth
DELETE /reminders/:id               auth

GET    /analytics/summary       auth
```

All non-auth routes pass through an `auth` middleware that reads the JWT from the cookie, verifies it, and attaches `req.user`. Validation is Zod-based; schemas live in `packages/shared` and are imported by both the API and the web app.

## Docker setup

**`docker-compose.yml`** (single file, dev-focused — production builds added later):

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: smartjob
      POSTGRES_PASSWORD: smartjob
      POSTGRES_DB: smartjob
    ports: ["5432:5432"]
    volumes: ["db_data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U smartjob"]
      interval: 5s
      retries: 10

  api:
    build: { context: ., dockerfile: apps/api/Dockerfile, target: dev }
    environment:
      DATABASE_URL: postgresql://smartjob:smartjob@db:5432/smartjob
      JWT_SECRET: dev-secret-change-me
      WEB_ORIGIN: http://localhost:5173
      PORT: 4000
    ports: ["4000:4000"]
    depends_on:
      db: { condition: service_healthy }
    volumes:
      - ./apps/api:/app/apps/api
      - ./packages/shared:/app/packages/shared
      - /app/node_modules
      - /app/apps/api/node_modules
    command: sh -c "pnpm --filter api prisma migrate deploy && pnpm --filter api dev"

  web:
    build: { context: ., dockerfile: apps/web/Dockerfile, target: dev }
    environment:
      VITE_API_URL: http://localhost:4000/api
    ports: ["5173:5173"]
    depends_on: [api]
    volumes:
      - ./apps/web:/app/apps/web
      - ./packages/shared:/app/packages/shared
      - /app/node_modules
      - /app/apps/web/node_modules
    command: pnpm --filter web dev -- --host

volumes:
  db_data:
```

**Dockerfiles** are multi-stage with a `dev` target that runs `tsx watch` (api) / `vite --host` (web), and a `prod` target that builds and runs the compiled output. Only the `dev` target is wired into `docker-compose.yml` for now.

**How the user runs it:**
```
cp .env.example .env          # not strictly required for dev (defaults are baked into compose)
docker compose up --build
# api → http://localhost:4000/api/health
# web → http://localhost:5173
```

Hot reload works in both containers because source is volume-mounted. `node_modules` are kept in named volumes so the host's OS doesn't fight the container's installed deps.

## Testing strategy

- **API unit/integration**: Vitest + Supertest. Runs against a separate Postgres test database (`smartjob_test`) using Prisma's `migrate deploy` in a setup hook.
- **Web unit**: Vitest + Testing Library for components and hooks. MSW for mocking API calls.
- **E2E**: Playwright deferred to a later plan — out of scope for this scaffold.
- **CI**: GitHub Actions workflow stub with `lint → typecheck → test` jobs; the job uses a `services: postgres` for API tests. Wired in this plan; can be extended later.

## Implementation phases (for the follow-on plan)

1. **Workspace skeleton** — `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.env.example`, `README.md`, `git init`.
2. **`packages/shared`** — Zod schemas + DTOs for User, Application, Event, Reminder; tsconfig with `"composite": true`.
3. **`apps/api` skeleton** — Express app, env loader, error middleware, `/api/health` route, Prisma init, first migration.
4. **Auth slice end-to-end** — bcrypt + JWT, `/auth/register|login|logout|me`, auth middleware, Vitest test for the happy path.
5. **Applications CRUD** — routes, Zod validation, ownership checks, list filters.
6. **Events + reminders + analytics summary**.
7. **`apps/web` skeleton** — Vite, Tailwind, shadcn init, router, AppShell, auth context, login/register pages.
8. **Applications UI** — list table, create/edit form, detail page, TanStack Query hooks.
9. **Dashboard** (Recharts) and **Kanban board** (@dnd-kit).
10. **Dockerfiles + docker-compose.yml + README run instructions** — verify `docker compose up --build` brings the whole stack live.
11. **CI workflow stub.**

The user can stop the implementation at any phase and still have a runnable, demoable subset.

## Verification

End-to-end smoke test the user runs after the scaffold lands:

1. `docker compose up --build` from repo root — all three services come up, no errors in logs.
2. `curl http://localhost:4000/api/health` returns `{ "ok": true }`.
3. Open `http://localhost:5173` — login page renders without console errors.
4. Register a user via the UI; a row appears in the `User` table (`docker compose exec db psql -U smartjob -d smartjob -c 'select id, email from "User";'`).
5. `pnpm --filter api test` and `pnpm --filter web test` both pass (only seed tests at scaffold time).
6. Edit a file under `apps/api/src/` — container reloads; edit a file under `apps/web/src/` — Vite HMR updates the browser.

## Critical files this plan creates

- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`
- `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md`
- `packages/shared/src/index.ts` + package config
- `apps/api/src/{index,app,env,db}.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/routes/*.ts`
- `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts`
- `apps/api/Dockerfile`
- `apps/web/src/{main,App,router}.tsx`, `apps/web/src/lib/auth.tsx`, `apps/web/src/api/*`
- `apps/web/Dockerfile`, `apps/web/vite.config.ts`, `apps/web/tailwind.config.ts`

## Out of scope for this plan

- Resume upload / file storage
- Email notifications and PDF reports
- Production Dockerfile targets and deployment (Render/Fly/Railway)
- Playwright E2E suite
- Project 2 (Employee Leave Management System)
