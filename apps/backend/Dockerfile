FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure devDependencies (typescript, @nestjs/cli) are installed during build
ENV NODE_ENV=development

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile --filter @quantpulse/backend...

COPY apps/backend/ ./apps/backend/
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN pnpm --filter @quantpulse/database db:generate

# Build
RUN pnpm --filter @quantpulse/backend build

# Production — only ship compiled JS
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/apps/backend/dist ./dist
COPY --from=base /app/apps/backend/package.json ./
COPY --from=base /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/main.js"]
