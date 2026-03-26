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
COPY --from=base /app/apps/frontend/.next ./.next
COPY --from=base /app/apps/frontend/public ./public
COPY --from=base /app/apps/frontend/package.json ./
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
