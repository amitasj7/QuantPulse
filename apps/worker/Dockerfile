FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @quantpulse/worker...

# Copy source code
COPY apps/worker/ ./apps/worker/
COPY packages/shared/ ./packages/shared/
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @quantpulse/worker build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/apps/worker/dist ./dist
COPY --from=base /app/apps/worker/package.json ./
COPY --from=base /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
