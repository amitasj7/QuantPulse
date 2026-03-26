# 📊 QuantPulse

**High-frequency commodity and solar market intelligence platform.**

A professional-grade financial dashboard showing commodity prices, spot prices, market trends, prediction insights, and solar industry data — built in the style of MCX and TradingView.

---

## 🏗️ Architecture

| Layer | Technology | Deploy Target |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui | Vercel |
| **Backend** | NestJS + Socket.io | EC2 / DigitalOcean |
| **Worker** | Node.js + BullMQ | EC2 / DigitalOcean |
| **Database** | TimescaleDB (PostgreSQL) | Managed / Docker |
| **Cache** | Redis | Upstash / Docker |

## 📁 Project Structure

```
QuantPulse/
├── apps/
│   ├── frontend/       # Next.js 15 web app
│   ├── backend/        # NestJS REST + WebSocket API
│   └── worker/         # Data feed ingestion worker
├── packages/
│   ├── shared/         # Shared types, utils, constants
│   └── database/       # Prisma schema + client
├── infra/              # Docker, nginx, deploy scripts
└── docs/               # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose (for local databases)

### Setup

```bash
# Install dependencies
pnpm install

# Start all services in dev mode
pnpm dev

# Or start individually
pnpm dev:frontend
pnpm dev:backend
pnpm dev:worker
```

## 📜 License

UNLICENSED — Private project.
