#!/bin/bash
# QuantPulse — Database Seeding
set -e

echo "🌱 Seeding QuantPulse database..."

# Run Prisma migrations
pnpm db:migrate

# Seed data
pnpm db:seed

echo "✅ Database seeded successfully!"
