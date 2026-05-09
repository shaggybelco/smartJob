# syntax=docker/dockerfile:1.7

# ─── Base ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
RUN apk add --no-cache openssl

# ─── Deps ─────────────────────────────────────────────────────────────
# Install workspace deps once. Copy only manifests + lockfile + workspace
# config so the layer caches well.
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile=false

# ─── Dev ──────────────────────────────────────────────────────────────
# Volume-mounted source; tsx watches and reloads.
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter api prisma generate
EXPOSE 4000
WORKDIR /app
CMD ["pnpm", "--filter", "api", "dev"]

# ─── Build (prod) ─────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter api prisma generate
RUN pnpm --filter api build

# ─── Runner (prod) ────────────────────────────────────────────────────
FROM node:20-alpine AS prod
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
EXPOSE 4000
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
