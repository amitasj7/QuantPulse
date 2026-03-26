# Frontend Implementation Plan

This document outlines the planning strategy and tasks for connecting the Next.js frontend to the NestJS backend and integrating real-time market data across the UI.

## Phase 1: Foundations & API Client
- [x] Install required dependencies (`axios`, `socket.io-client`, `zustand`, `lightweight-charts`).
- [x] Create a `socket.ts` or `socket-client.ts` utility to handle the generic Socket.io connection to the Backend API.
- [x] Build a generic API utility to fetch commodities, solar data, and historical OHLC records from the REST backend.

## Phase 2: State Management (Zustand)
- [x] Set up a Zustand store (`useMarketStore`) to efficiently manage global state without excessive re-renders across multiple components.
- [x] Inside the store handle fetching initial static prices (from the REST API) and handle incoming dynamic WebSocket updates, merging the live price (`tick`) onto existing assets dynamically.

## Phase 3: TradingView Chart Integration
- [x] Create a reusable `LightweightChart` React component wrapping TradingView's `lightweight-charts` library.
- [x] Connect the chart to the backend history (`getPriceHistory`) and hook the latest live price updates to continuously append/update the chart on the fly.

## Phase 4: UI Data Binding
- [x] Update `TickerTape.tsx` to read from `useMarketStore` instead of hardcoded data.
- [x] Update `page.tsx` Dashboard Summary Cards to read from the live socket data.
- [x] Ensure formatting utilities (INR and USD currency) handle incoming numeric data cleanly.
- [x] Verify entirely real-time system working from Worker -> Redis -> Backend -> Frontend WebSocket -> React Component.

---
Executing tasks sequentially...
