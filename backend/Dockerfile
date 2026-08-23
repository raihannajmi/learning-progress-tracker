# -------------------------------------------------------------------
# Production Dockerfile for Backend (Easypanel / Coolify / Docker VPS)
# -------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack (ships with Node 22, manages pnpm version automatically)
RUN corepack enable

# Set CI=true so pnpm respects onlyBuiltDependencies without interactive prompts
ENV CI=true

# Install dependencies — copy manifests first for layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build config
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Compile TypeScript → dist/
RUN pnpm build

# -------------------------------------------------------------------
# Runner Stage (lean production image)
# -------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001
ENV CI=true

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled output and SQL migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 5001

CMD ["node", "dist/index.js"]
