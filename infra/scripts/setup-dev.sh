#!/bin/bash
# QuantPulse — Local Development Setup
set -e

echo "🚀 Setting up QuantPulse development environment..."

# Check prerequisites
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Install: npm i -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found. You'll need to run databases manually."; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy env file if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example — please update with your credentials"
fi

# Start databases (if Docker available)
if command -v docker &> /dev/null; then
  echo "🐳 Starting TimescaleDB and Redis..."
  docker compose -f infra/docker/docker-compose.yml up -d timescaledb redis
  echo "⏳ Waiting for databases to be ready..."
  sleep 5
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

echo ""
echo "✅ Setup complete! Run 'pnpm dev' to start all services."
