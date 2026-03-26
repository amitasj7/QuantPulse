# Backend API Implementation Plan

This document outlines the planning strategy and tasks for implementing the NestJS backend to serve commodity and solar market data to the frontend, along with the WebSocket gateway for real-time prices.

## Phase 1: Foundation & Database Connection
- [x] Connect `@quantpulse/database` Prisma client to NestJS by creating a global `PrismaModule` and `PrismaService`.
- [x] Update `package.json` in `apps/backend` to ensure `@quantpulse/shared` and `@quantpulse/database` are correctly linked if not working seamlessly.
- [x] Implement CORS in `main.ts` so the Next.js frontend (`localhost:3000`) can successfully communicate with the NestJS API.

## Phase 2: REST API Implementation (Data Fetching)
- [x] **CommoditiesModule**: Update `findAll` to query the database and return a list of MCX commodities.
- [x] **CommoditiesModule**: Update `getPriceHistory(id, interval)` to query the TimescaleDB `price_history` hypertable, retrieving historical candlesticks in chronological order.
- [x] **SolarModule**: Implement basic endpoints to fetch the solar asset supply chain metrics (Polysilicon, Wafer, Cell, Module).

## Phase 3: Real-time WebSocket Gateway
- [x] Install `@nestjs/websockets` and `@nestjs/platform-socket.io`.
- [x] Implement `PriceFeedGateway` with Socket.io configuration to allow Next.js users to connect.
- [x] Create socket events (`subscribe-ticker`, `unsubscribe-ticker`).
- [x] Prepare an internal `broadcastTick()` method inside the gateway that the background worker service will later call when it pushes live data into the backend.

## Phase 4: Integration & Testing
- [x] Build and start the NestJS backend via `pnpm run dev`.
- [x] Verify REST endpoints using terminal (curl) or a quick test controller.
- [x] Verify that the `dev` script in `turbo.json` or `package.json` correctly bootstraps everything without errors.

---
Executing tasks sequentially...
