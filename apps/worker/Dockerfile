FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure devDependencies (typescript) are installed during build
ENV NODE_ENV=development

# Copy ALL workspace package.json files for install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN pnpm install

# Copy source code
COPY apps/worker/ ./apps/worker/
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY tsconfig.base.json ./

# Manually create workspace symlinks directly in the app folder to override broken pnpm stubs
RUN mkdir -p apps/worker/node_modules/@quantpulse && \
    ln -sfn ../../../../packages/shared apps/worker/node_modules/@quantpulse/shared && \
    ln -sfn ../../../../packages/database apps/worker/node_modules/@quantpulse/database

# Generate Prisma client (must happen before @quantpulse/database can compile)
RUN cd packages/database && npx prisma generate

# Build shared types, then database, then worker
RUN cd packages/shared && npm run build
RUN cd packages/database && npm run build

# Debug symlinks and package content
RUN ls -la apps/worker/node_modules/@quantpulse/shared/ || echo "SYMLINK IS DEAD"
RUN cat apps/worker/node_modules/@quantpulse/shared/package.json || echo "NO PACKAGE JSON"
RUN ls -la packages/shared/dist/ || echo "SHARED NOT BUILT"

RUN cd apps/worker && npm run build

# Production stage — only ship compiled JS
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/apps/worker/dist ./dist
COPY --from=base /app/apps/worker/package.json ./
COPY --from=base /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
