FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure devDependencies are installed during build
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

COPY apps/frontend/ ./apps/frontend/
COPY packages/shared/ ./packages/shared/
COPY tsconfig.base.json ./

# Manually create workspace symlinks directly in the app folder
RUN mkdir -p apps/frontend/node_modules/@quantpulse && \
    ln -sfn ../../../../packages/shared apps/frontend/node_modules/@quantpulse/shared

# Build dependency packages first
RUN cd packages/shared && npm run build

# Build the frontend (NODE_ENV must be 'production' for Next.js prerender)
RUN cd apps/frontend && NODE_ENV=production npm run build

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
