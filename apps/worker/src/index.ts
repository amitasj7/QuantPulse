import { PrismaClient } from '@quantpulse/database';
import { NormalizedTick } from '@quantpulse/shared';
import Redis from 'ioredis';
import { TwelveDataConnector } from './connectors/TwelveDataConnector';
import { AlphaVantageConnector } from './connectors/AlphaVantageConnector';
import { ForexConnector } from './connectors/ForexConnector';
import { NewsDataConnector } from './connectors/NewsDataConnector';
import { AngelOneConnector } from './connectors/AngelOneConnector';
import { DataNormalizer } from './normalizer/DataNormalizer';
import * as dotenv from 'dotenv';
import path from 'path';

/**
 * QuantPulse Data Worker — "Gold Standard" Architecture
 * 
 * ┌─────────────────────┬──────────────┬────────────┬───────────┬───────────────────────────┐
 * │ Data Source          │ Provider     │ Frequency  │ Method    │ Storage                   │
 * ├─────────────────────┼──────────────┼────────────┼───────────┼───────────────────────────┤
 * │ Indian MCX          │ Angel One    │ Real-time  │ WebSocket │ Redis + TimescaleDB (1m)  │
 * │ Global Spot (XAU)   │ Twelve Data  │ 5 minutes  │ REST      │ TimescaleDB               │
 * │ Forex (USD/INR)     │ Twelve Data  │ 30 minutes │ REST      │ Redis (Global Var)        │
 * │ Market News         │ NewsData.io  │ 2 hours    │ REST      │ Postgres                  │
 * └─────────────────────┴──────────────┴────────────┴───────────┴───────────────────────────┘
 */

// Load .env from monorepo root
const envPaths = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

// ==========================================
// API Keys
// ==========================================
const TWELVE_API_KEY = process.env.TWELVE_API_KEY?.trim();
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY?.trim();
const NEWS_API_KEY = process.env.NEWS_API_KEY?.trim(); // NewsData.io key
const BROKER_API_KEY = process.env.BROKER_API_KEY?.trim();
const ANGEL_CLIENT_ID = process.env.ANGEL_CLIENT_ID?.trim();
const ANGEL_PASSWORD = process.env.ANGEL_PASSWORD?.trim();
const ANGEL_TOTP_SECRET = process.env.ANGEL_TOTP_SECRET?.trim();

console.log('\n🔑 API Key Status:');
console.log(`  TWELVE_API_KEY:  ${TWELVE_API_KEY ? '✅' : '❌'} (Global Spot + Forex)`);
console.log(`  ALPHA_VANTAGE:   ${ALPHA_VANTAGE_API_KEY ? '✅' : '❌'} (Supplementary)`);
console.log(`  NEWS_API_KEY:    ${NEWS_API_KEY ? '✅' : '❌'} (NewsData.io)`);
const angelReady = !!(BROKER_API_KEY && ANGEL_CLIENT_ID && ANGEL_PASSWORD && ANGEL_TOTP_SECRET);
console.log(`  ANGEL_ONE:       ${angelReady ? '✅' : '❌'} (MCX WebSocket)\n`);

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Buffer for batching TimescaleDB inserts
let tickBuffer: any[] = [];
let dbWriteInterval: NodeJS.Timeout | null = null;
const WRITE_INTERVAL_MS = 15000; // 15 seconds

async function bootstrap() {
  console.log('🚀 QuantPulse Data Worker — "Gold Standard" Mode\n');
  
  await prisma.$connect();
  console.log('✅ Connected to TimescaleDB');

  // Build assetId → UUID mapping from database
  const commodities = await prisma.commodity.findMany();
  const assetIdMap = new Map<string, string>();
  commodities.forEach((c: { assetId: string; id: string }) => {
    assetIdMap.set(c.assetId, c.id);
  });
  console.log(`📦 Loaded ${assetIdMap.size} asset mappings from DB`);

  // Handle incoming ticks from any connector
  const processTick = (rawTick: any) => {
    const tick: NormalizedTick = DataNormalizer.normalize(rawTick);

    // 1. Push to Redis for real-time WebSocket broadcast
    redis.publish('market:ticks', JSON.stringify(tick));

    // 2. Also store latest tick in Redis for instant access
    redis.set(`tick:${tick.assetId}`, JSON.stringify(tick));

    // 3. Buffer for DB persistence
    tickBuffer.push(tick);
  };

  // Start background flush to TimescaleDB
  dbWriteInterval = setInterval(async () => {
    if (tickBuffer.length > 0) {
      const batch = [...tickBuffer];
      tickBuffer = [];
      
      const dbRecords = batch
        .filter(t => assetIdMap.has(t.assetId))
        .map(t => ({
          commodityId: assetIdMap.get(t.assetId)!,
          priceINR: t.priceINR,
          priceUSD: t.priceUSD,
          open: t.open,
          high: t.high,
          low: t.low,
          close: t.close,
          volume: t.volume,
          percentChange: t.percentChange,
          sourceProvider: t.sourceProvider,
          interval: t.interval,
          timestamp: t.timestamp,
        }));

      if (dbRecords.length > 0) {
        try {
          await prisma.priceHistory.createMany({ data: dbRecords });
          console.log(`[DB] Flushed ${dbRecords.length} ticks to TimescaleDB.`);
        } catch (error) {
          console.error('[DB] Failed to insert ticks', error);
        }
      }
    }
  }, WRITE_INTERVAL_MS);

  // ==========================================
  // 1. FOREX — Twelve Data (every 30 min → Redis)
  // ==========================================
  const forexPersist = async (pair: string, rate: number, timestamp: Date) => {
    try {
      await prisma.forexRate.create({
        data: { pair, rate, timestamp },
      });
    } catch (e) {
      console.error('[DB] Failed to persist forex rate', e);
    }
  };

  let twelveData: TwelveDataConnector | null = null;
  let alphaVantage: AlphaVantageConnector | null = null;

  const forex = new ForexConnector(
    TWELVE_API_KEY || '',
    (rate) => {
      // Push forex rate to all connectors that need it
      if (twelveData) twelveData.setForexRate(rate);
      if (alphaVantage) alphaVantage.setForexRate(rate);
    },
    forexPersist,
    redis, // Pass Redis for global variable storage
  );

  // ==========================================
  // 2. GLOBAL SPOT — Twelve Data (every 5 min → TimescaleDB)
  // ==========================================
  if (TWELVE_API_KEY) {
    twelveData = new TwelveDataConnector(processTick, TWELVE_API_KEY);
  }

  // ==========================================
  // 3. ALPHA VANTAGE — Supplementary (every 5 min)
  // ==========================================
  if (ALPHA_VANTAGE_API_KEY) {
    alphaVantage = new AlphaVantageConnector(processTick, ALPHA_VANTAGE_API_KEY);
  }

  // ==========================================
  // 4. NEWS — NewsData.io (every 2 hours → Postgres)
  // ==========================================
  let newsConnector: NewsDataConnector | null = null;
  if (NEWS_API_KEY) {
    newsConnector = new NewsDataConnector(NEWS_API_KEY, async (articles) => {
      for (const article of articles) {
        try {
          const commodityId = article.matchedAssetId
            ? assetIdMap.get(article.matchedAssetId) || null
            : null;

          const existing = await prisma.commodityNews.findFirst({
            where: { sourceUrl: article.sourceUrl },
          });

          if (!existing) {
            await prisma.commodityNews.create({
              data: {
                commodityId,
                title: article.title,
                summary: article.summary,
                sourceUrl: article.sourceUrl,
                sourceName: article.sourceName,
                sentiment: article.sentiment,
                publishedAt: article.publishedAt,
              },
            });
          }
        } catch (e: any) {
          console.error('[DB] Failed to persist news article', e.message);
        }
      }
      console.log(`[DB] Persisted ${articles.length} news articles.`);
    });
  }

  // ==========================================
  // 5. ANGEL ONE — MCX WebSocket (real-time → Redis + TimescaleDB)
  // ==========================================
  let angelOne: AngelOneConnector | null = null;
  if (angelReady) {
    angelOne = new AngelOneConnector(processTick, {
      apiKey: BROKER_API_KEY!,
      clientId: ANGEL_CLIENT_ID!,
      password: ANGEL_PASSWORD!,
      totpSecret: ANGEL_TOTP_SECRET!,
    });
  }

  // ==========================================
  // START ALL CONNECTORS
  // ==========================================
  console.log('\n📡 Starting live data connectors...\n');

  // Forex first (other connectors need the rate)
  if (TWELVE_API_KEY) {
    forex.start();
    await new Promise(r => setTimeout(r, 3000));
  }

  // Global spot prices
  if (twelveData) twelveData.start();
  if (alphaVantage) alphaVantage.start();

  // News
  if (newsConnector) newsConnector.start();

  // MCX broker (Angel One WebSocket)
  if (angelOne) await angelOne.start();

  // Print final status table
  console.log('\n' + '═'.repeat(60));
  console.log('  QuantPulse Worker — Active Connectors');
  console.log('═'.repeat(60));
  console.log(`  MCX (Angel One):    ${angelReady ? '✅ WebSocket + REST' : '❌ DISABLED'}`);
  console.log(`  Global Spot:        ${TWELVE_API_KEY ? '✅ Every 5 min' : '❌ DISABLED'}`);
  console.log(`  Forex (USD/INR):    ${TWELVE_API_KEY ? '✅ Every 30 min → Redis' : '❌ DISABLED'}`);
  console.log(`  Market News:        ${NEWS_API_KEY ? '✅ Every 2 hours' : '❌ DISABLED'}`);
  console.log(`  Supplementary:      ${ALPHA_VANTAGE_API_KEY ? '✅ AlphaVantage' : '❌ DISABLED'}`);
  console.log('═'.repeat(60) + '\n');

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('\nShutting down Data Worker...');
    forex.stop();
    if (twelveData) twelveData.stop();
    if (alphaVantage) alphaVantage.stop();
    if (newsConnector) newsConnector.stop();
    if (angelOne) angelOne.stop();
    if (dbWriteInterval) clearInterval(dbWriteInterval);
    redis.quit();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Data Worker failed to start', err);
  process.exit(1);
});
