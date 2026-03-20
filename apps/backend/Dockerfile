FROM node:18-slim AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/

RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -g nodejs nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

COPY --chown=nestjs:nodejs apps/backend/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["./start.sh"]
