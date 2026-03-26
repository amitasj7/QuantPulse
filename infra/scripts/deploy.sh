#!/bin/bash
# QuantPulse — Deployment Script
set -e

echo "🚀 Deploying QuantPulse..."

# Build all services
echo "🔨 Building all packages..."
pnpm build

# Build and push Docker images
echo "🐳 Building Docker images..."
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.prod.yml build

echo "✅ Build complete. Push images and restart services on your server."
