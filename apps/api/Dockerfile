# ==============================================================================
# Dockerfile — @perpusjal/api (Express + TypeScript + Prisma)
# ==============================================================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app ./
COPY packages/types ./packages/types/
COPY apps/api ./apps/api/

RUN pnpm db:generate
RUN pnpm --filter @perpusjal/types build
RUN pnpm --filter @perpusjal/api build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
