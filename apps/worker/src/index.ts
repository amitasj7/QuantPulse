import { PrismaClient } from '@quantpulse/database';
import { NormalizedTick } from '@quantpulse/shared';
import Redis from 'ioredis';
import { TwelveDataConnector } from './connectors/TwelveDataConnector';
import { AlphaVantageConnector } from './connectors/AlphaVantageConnector';
import { ForexConnector } from './connectors/ForexConnector';
import { NewsAPIConnector } from './connectors/NewsAPIConnector';
import { AngelOneConnector } from './connectors/AngelOneConnector';
import { DataNormalizer } from './normalizer/DataNormalizer';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from monorepo root — try multiple paths for turbo/bun compatibility
const envPaths = [
  path.join(__dirname, '../../../.env'),       // from src/ via ts-node-dev
  path.join(process.cwd(), '../../.env'),      // from apps/worker via turbo
  path.join(process.cwd(), '.env'),            // fallback: if CWD is root
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

// Validate required API keys
const TWELVE_API_KEY = process.env.TWELVE_API_KEY?.trim();
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY?.trim();
const USD_INR_API_KEY = process.env.USD_INR_API_KEY?.trim();
const NEWS_API_KEY = process.env.NEWS_API_KEY?.trim();
const BROKER_API_KEY = process.env.BROKER_API_KEY?.trim();
const ANGEL_CLIENT_ID = process.env.ANGEL_CLIENT_ID?.trim();
const ANGEL_PASSWORD = process.env.ANGEL_PASSWORD?.trim();
const ANGEL_TOTP_SECRET = process.env.ANGEL_TOTP_SECRET?.trim();

// Debug: show which keys were found
console.log(`🔑 TWELVE_API_KEY: ${TWELVE_API_KEY ? '✅ found' : '❌ missing'}`);
console.log(`🔑 ALPHA_VANTAGE_API_KEY: ${ALPHA_VANTAGE_API_KEY ? '✅ found' : '❌ missing'}`);
console.log(`🔑 USD_INR_API_KEY: ${USD_INR_API_KEY ? '✅ found' : '❌ missing'}`);
console.log(`🔑 NEWS_API_KEY: ${NEWS_API_KEY ? '✅ found' : '❌ missing'}`);
console.log(`🔑 ANGEL_ONE: ${BROKER_API_KEY && ANGEL_CLIENT_ID && ANGEL_PASSWORD && ANGEL_TOTP_SECRET ? '✅ found (all 4 keys)' : '❌ missing (need API_KEY + CLIENT_ID + PASSWORD + TOTP_SECRET)'}`);

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Buffer for batching TimescaleDB inserts
let tickBuffer: any[] = [];
let dbWriteInterval: NodeJS.Timeout | null = null;
const WRITE_INTERVAL_MS = 15000; // 15 seconds

async function bootstrap() {
  console.log('🚀 QuantPulse Data Worker initializing (LIVE MODE)...');
  
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

    // 2. Buffer for DB persistence
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
  // 1. FOREX CONNECTOR (runs first to get USD/INR rate)
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

  const forex = new ForexConnector(
    USD_INR_API_KEY || '',
    (rate) => {
      // When rate updates, push it to other connectors
      if (twelveData) twelveData.setForexRate(rate);
      if (alphaVantage) alphaVantage.setForexRate(rate);
    },
    forexPersist,
  );

  // ==========================================
  // 2. TWELVE DATA CONNECTOR (MCX commodities)
  // ==========================================
  let twelveData: TwelveDataConnector | null = null;
  if (TWELVE_API_KEY) {
    twelveData = new TwelveDataConnector(processTick, TWELVE_API_KEY);
  }

  // ==========================================
  // 3. ALPHA VANTAGE CONNECTOR (supplementary)
  // ==========================================
  let alphaVantage: AlphaVantageConnector | null = null;
  if (ALPHA_VANTAGE_API_KEY) {
    alphaVantage = new AlphaVantageConnector(processTick, ALPHA_VANTAGE_API_KEY);
  }

  // ==========================================
  // 4. NEWS API CONNECTOR
  // ==========================================
  let newsConnector: NewsAPIConnector | null = null;
  if (NEWS_API_KEY) {
    newsConnector = new NewsAPIConnector(NEWS_API_KEY, async (articles) => {
      // Persist each article to the CommodityNews table
      for (const article of articles) {
        try {
          // Find the matching commodity UUID if assetId was detected
          const commodityId = article.matchedAssetId
            ? assetIdMap.get(article.matchedAssetId) || null
            : null;

          // Check if this article already exists by sourceUrl
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
  // ==========================================
  // 5. ANGEL ONE CONNECTOR (Broker — real MCX data)
  // ==========================================
  let angelOne: AngelOneConnector | null = null;
  const angelReady = BROKER_API_KEY && ANGEL_CLIENT_ID && ANGEL_PASSWORD && ANGEL_TOTP_SECRET;
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
  console.log('\n📡 Starting live data connectors...');
  
  if (USD_INR_API_KEY) {
    forex.start();
    // Wait a moment for forex rate before starting price connectors
    await new Promise(r => setTimeout(r, 3000));
  }
  
  if (twelveData) twelveData.start();
  if (alphaVantage) alphaVantage.start();
  if (newsConnector) newsConnector.start();
  if (angelOne) await angelOne.start();

  console.log('\n✅ All connectors active. Worker is running in LIVE mode.\n');
  console.log('Active connectors:');
  console.log(`  • Forex (ExchangeRate-API): ${USD_INR_API_KEY ? '✅ ACTIVE' : '❌ DISABLED'}`);
  console.log(`  • TwelveData (MCX):         ${TWELVE_API_KEY ? '✅ ACTIVE' : '❌ DISABLED'}`);
  console.log(`  • AlphaVantage:             ${ALPHA_VANTAGE_API_KEY ? '✅ ACTIVE' : '❌ DISABLED'}`);
  console.log(`  • NewsAPI:                  ${NEWS_API_KEY ? '✅ ACTIVE' : '❌ DISABLED'}`);
  console.log(`  • AngelOne (Broker MCX):    ${angelReady ? '✅ ACTIVE' : '❌ DISABLED'}`);
  console.log('');

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
