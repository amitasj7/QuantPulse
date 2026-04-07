FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure devDependencies (typescript, @nestjs/cli) are installed during build
ENV NODE_ENV=development

# Copy ALL workspace package.json files for full install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Install ALL workspace dependencies (ensures workspace symlinks are correct)
RUN pnpm install --frozen-lockfile

COPY apps/backend/ ./apps/backend/
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY tsconfig.base.json ./

# Manually create workspace symlinks directly in the app folder to override broken pnpm stubs
RUN mkdir -p apps/backend/node_modules/@quantpulse && \
    ln -sfn ../../../../packages/shared apps/backend/node_modules/@quantpulse/shared && \
    ln -sfn ../../../../packages/database apps/backend/node_modules/@quantpulse/database

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build shared types, then database, then backend
RUN cd packages/shared && npm run build
RUN cd packages/database && npm run build
RUN cd apps/backend && npm run build

# Production — only ship compiled JS
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app /app

EXPOSE 4000
CMD npx prisma@6 migrate deploy --schema=./packages/database/prisma/schema.prisma && node apps/backend/dist/main.js
