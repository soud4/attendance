# ==========================================
# Stage 1: Build & Assets (Tailwind CSS)
# ==========================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency manifests and TypeScript/Bun configs
COPY package.json bun.lock* tsconfig.json bunfig.toml ./

# Install all dependencies (including devDependencies for Tailwind CLI)
RUN bun install --frozen-lockfile || bun install

# Copy source and public assets
COPY src ./src
COPY public ./public

# Compile minified production CSS
RUN bun run build:css

# ==========================================
# Stage 2: Ultra-minimal Production Runner
# ==========================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/data.sqlite

# Install production dependencies and copy runtime configs
COPY package.json bun.lock* tsconfig.json bunfig.toml ./
RUN bun install --production --frozen-lockfile || bun install --production

# Copy compiled public assets from builder
COPY --from=builder /app/public ./public

# Copy application source code
COPY src ./src

# Create data directory for SQLite persistence and set permissions
RUN mkdir -p /app/data && chown -R bun:bun /app

# Use non-root bun user for security
USER bun

# Expose server port
EXPOSE 3000

# Declare persistent data volume for Dokploy
VOLUME ["/app/data"]

# Lightweight healthcheck using Bun native fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e 'fetch("http://localhost:3000/").then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))'

# Start the Hono server
CMD ["bun", "run", "src/index.ts"]
