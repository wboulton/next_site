# syntax=docker/dockerfile:1.7
# Production image for the Next.js site.
# Three stages: install deps, build, then a slim runtime that only contains
# the standalone server + public assets + static chunks.

# Bump to the current Node LTS when convenient.
ARG NODE_VERSION=24.13.0-slim

# ============================================
# Stage 1: install dependencies
# ============================================
FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Only the lockfile + manifest, so this layer caches until deps change.
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ============================================
# Stage 2: build the app
# ============================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Requires `output: 'standalone'` in next.config.ts so this populates
# .next/standalone with a self-contained server bundle.
RUN npm run build

# ============================================
# Stage 3: runtime
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Public assets are served as-is from the standalone server.
COPY --from=builder --chown=node:node /app/public ./public

# Next writes the prerender cache here at runtime, so it must exist and be
# writable by the non-root user before we drop privileges.
RUN mkdir .next && chown node:node .next

# The standalone bundle already contains a minimal node_modules + server.js.
COPY --from=builder --chown=node:node /app/.next/standalone ./
# .next/static is intentionally not part of the standalone trace; copy it
# alongside so the server can serve hashed JS/CSS chunks.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
