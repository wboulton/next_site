# syntax=docker/dockerfile:1
# Production image for the Next.js site.
# Pin the current LTS and Debian release so nsjail and Node use the same ABI.
ARG NODE_VERSION=26.13.1-bookworm-slim

# Build nsjail separately; compilers and source never enter the runtime image.
FROM node:${NODE_VERSION} AS nsjail-builder
ARG NSJAIL_REVISION=f78475530b46d0186111a9096b30725f816b55fe
RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf bison ca-certificates flex g++ gcc git libnl-route-3-dev \
    libprotobuf-dev libtool make pkg-config protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build/nsjail
RUN git init \
    && git remote add origin https://github.com/google/nsjail.git \
    && git fetch --depth 1 origin ${NSJAIL_REVISION} \
    && git checkout --detach FETCH_HEAD \
    && git submodule update --init --depth 1 \
    && make -j2

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

# Git supplies the original blog publication dates during static generation.
# pdflatex (+ packages used by src/app/resume/resume.tex) for the prebuild step
# that compiles the resume into public/resume.pdf. Runtime image does not need
# these, so they live only in the builder stage.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-plain-generic \
    tex-gyre \
    && rm -rf /var/lib/apt/lists/*

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build also generates the resume and Next's types before the explicit check.
RUN npm run lint && npm run build && npm run typecheck

# ============================================
# Stage 3: runtime
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libprotobuf32 libnl-route-3-200 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=nsjail-builder /build/nsjail/nsjail /usr/local/bin/nsjail
COPY docker/nsjail.cfg docker/node.seccomp /etc/nsjail/

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Public assets are served as-is from the standalone server.
COPY --from=builder /app/public ./public

# The standalone bundle already contains a minimal node_modules + server.js.
COPY --from=builder /app/.next/standalone ./
# .next/static is intentionally not part of the standalone trace; copy it
# alongside so the server can serve hashed JS/CSS chunks.
COPY --from=builder /app/.next/static ./.next/static
# The only writable app path is overmounted with a bounded tmpfs by nsjail.
RUN mkdir -p /app/.next/cache && chmod -R a-w /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

ENTRYPOINT ["/usr/local/bin/nsjail", "--config", "/etc/nsjail/nsjail.cfg", "--"]
CMD ["/usr/local/bin/node", "/app/server.js"]
