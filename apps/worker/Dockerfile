FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure devDependencies (typescript) are installed during build
ENV NODE_ENV=development

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Install ALL dependencies (including devDeps like typescript)
RUN pnpm install --frozen-lockfile --filter @quantpulse/worker...

# Copy source code
COPY apps/worker/ ./apps/worker/
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @quantpulse/worker build

# Production stage — only ship compiled JS
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/apps/worker/dist ./dist
COPY --from=base /app/apps/worker/package.json ./
COPY --from=base /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
