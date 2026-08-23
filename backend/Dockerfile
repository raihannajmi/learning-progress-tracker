# -------------------------------------------------------------------
# Production Dockerfile for Backend (Easypanel / Coolify / Docker VPS)
# -------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Allow build scripts (esbuild, etc.) — required for pnpm v10+ in Docker
RUN pnpm config set ignore-scripts false

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and config
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Build TypeScript to dist
RUN pnpm build

# -------------------------------------------------------------------
# Runner Stage
# -------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

RUN npm install -g pnpm

# Allow build scripts in runner stage too
RUN pnpm config set ignore-scripts false

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built files and migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 5001

# Start server
CMD ["node", "dist/index.js"]
