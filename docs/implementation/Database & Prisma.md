# Database & Prisma Implementation Plan

This document outlines the tasks required to set up the TimescaleDB database, configure Prisma, and seed the initial market data.

## Phase 1: Database Infrastructure Setup
- [x] Ensure `.env` contains the correct `DATABASE_URL` pointing to the local Docker TimescaleDB instance.
- [x] Ensure the TimescaleDB Docker container can be spun up (using `docker compose`).
- [x] Connect to the database visually/via terminal to ensure it's healthy and accepting connections.

## Phase 2: Prisma Schema & Migrations
- [x] Review `packages/database/prisma/schema.prisma` to verify models match requirements (Commodity, PriceHistory, CommodityNews, ForexRate).
- [x] Generate the initial Prisma migration (`pnpm db:migrate`).
- [x] Create an empty migration (`prisma migrate dev --create-only --name make_hypertable`).
- [x] Modify the empty migration with raw SQL to turn `price_history` into a TimescaleDB hypertable by running `SELECT create_hypertable('price_history', 'timestamp');`.
- [x] Apply the migration to finalize the creation of the hypertable.
- [x] Generate the Prisma Client (`pnpm db:generate`).

## Phase 3: Seeding Initial Data
- [x] Implement `packages/database/prisma/seed.ts`.
- [x] Seed base **Commodities** (MCX Assets: Gold, Silver, Crude Oil, Aluminium, etc.).
- [x] Seed base **Solar Assets** (Polysilicon, Wafer, Cell, Module).
- [x] Seed sample **PriceHistory** for today to quickly get basic charts running on the frontend.
- [x] Run the seed script (`pnpm db:seed`) and verify data is present in TimescaleDB.

## Phase 4: Database Verification & Testing
- [x] Access Prisma Studio (`pnpm run db:studio`) to verify the data structure manually.
- [x] Write a minimal backend controller or test script inside `packages/database` or `backend` to ensure the generated client queries data correctly.
- [x] Establish how the `DataNormalizer` interacts with Prisma when creating new `PriceHistory` records to ensure TimescaleDB insertion speed is optimal.

---

Once we agree on this strategy, we will start picking up tasks sequentially.
