FROM node:20-slim AS base
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production dependencies only (for worker)
FROM base AS prod-deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then npm ci --only=production; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile --prod; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
RUN npx prisma generate

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  python3-pip \
  python3-venv \
  poppler-utils \
  graphicsmagick \
  ghostscript \
  curl \
  openssl \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy production node_modules (ensures bullmq, ioredis, tsx, prisma client libs are present)
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy Prisma Generated Client (if not in standalone)
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated

# Copy Worker and Utils
COPY --chown=nextjs:nodejs lib ./lib
COPY --chown=nextjs:nodejs worker.ts ./worker.ts
COPY --chown=nextjs:nodejs prisma ./prisma

# Create uploads and markdown directories and set permissions
RUN mkdir -p /app/uploads /app/markdown /app/temp && chown -R nextjs:nodejs /app/uploads /app/markdown /app/temp

# --- OCR Service Setup ---
COPY --chown=nextjs:nodejs ocr-service ./ocr-service

# Setup Python Environment (stay as root to create venv, then switch to nextjs)
RUN python3 -m venv /app/venv && chown -R nextjs:nodejs /app/venv

USER nextjs
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r ocr-service/requirements.txt

# Copy start script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3000 8001

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
