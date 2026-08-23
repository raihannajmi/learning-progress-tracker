# -------------------------------------------------------------------
# Production Dockerfile for Backend (Easypanel / Coolify / Docker VPS)
# -------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack (bundled with Node 22, auto-manages pnpm version)
RUN corepack enable

# CI=true: pnpm non-interactive mode, respects allowBuilds in pnpm-workspace.yaml
ENV CI=true

# Copy manifests + workspace config (pnpm-workspace.yaml must be present
# BEFORE pnpm install so allowBuilds is respected — pnpm v11 requirement)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all deps (esbuild build script now allowed via pnpm-workspace.yaml)
RUN pnpm install --frozen-lockfile

# Copy source code and build config
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Compile TypeScript → dist/
RUN pnpm build

# -------------------------------------------------------------------
# Runner Stage (lean production image, no devDeps)
# -------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001
ENV CI=true

RUN corepack enable

# Production deps only — also needs workspace yaml so esbuild (if any prod dep needs it) is allowed
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled output and SQL migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 5001

CMD ["node", "dist/index.js"]
