FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @quantpulse/frontend...

COPY apps/frontend/ ./apps/frontend/
COPY packages/shared/ ./packages/shared/
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @quantpulse/frontend build

# Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV production

# Only copy the standalone output and public files
COPY --from=base /app/apps/frontend/public ./apps/frontend/public
COPY --from=base /app/apps/frontend/.next/standalone ./
COPY --from=base /app/apps/frontend/.next/static ./apps/frontend/.next/static

EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
