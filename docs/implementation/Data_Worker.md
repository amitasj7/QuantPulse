# Data Worker (Connectors) Implementation Plan

This document outlines the planning strategy and tasks for implementing the isolated Node.js data worker that fetches pricing data, normalizes it, stores it in TimescaleDB, and pushes live ticks to the backend for broadcasting.

## Phase 1: Foundation & Normalizer
- [x] Connect `@quantpulse/database` and `@quantpulse/shared` to the `apps/worker`.
- [x] Define the `NormalizedTick` interface in `packages/shared` if not already present.
- [x] Implement `DataNormalizer` to receive raw data from various sources (MCX INR, Global USD) and transform it into the unified schema.

## Phase 2: Mock Live Connectors 
- [x] Implement `MCXConnector`: An interval-based connector generating realistic price movements for MCX assets (Gold, Silver, Aluminium, Crude Oil).
- [x] Implement `SolarConnector`: A connector simulating lower-frequency data updates for Solar supply chain assets (Polysilicon, Wafer, Cell, Module).
- [x] Write a `WorkerManager` to orchestrate initializing and tearing down these connectors.

## Phase 3: TimescaleDB Persistence
- [x] Write an `OHLCAggregator` or simply use direct Prisma `create` commands to insert incoming ticks into the `PriceHistory` hypertable.
- [x] Optimize Prisma writes (batching if necessary, though single writes initially suffice for mock data).

## Phase 4: Redis Pub/Sub integration (Pushing to Gateway)
- [x] Install `ioredis` in both `apps/worker` and `apps/backend`.
- [x] Worker: Publish newly generated ticks to a Redis channel `market:ticks`.
- [x] Backend: Update `PriceFeedGateway` or a new `RedisSubscriberService` to listen to `market:ticks` and immediately call `broadcastTick()` via Socket.io.
- [x] Run the worker and backend simultaneously and verify data is flowing end-to-end!

---
Executing tasks sequentially...
