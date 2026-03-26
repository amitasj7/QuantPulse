import { PrismaClient } from '@quantpulse/database';
import { NormalizedTick } from '@quantpulse/shared';
import Redis from 'ioredis';
import { MCXConnector } from './connectors/MCXConnector';
import { SolarConnector } from './connectors/SolarConnector';
import { DataNormalizer } from './normalizer/DataNormalizer';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Buffer for batching TimescaleDB inserts specifically
let tickBuffer: any[] = [];
let dbWriteInterval: NodeJS.Timeout | null = null;
const WRITE_INTERVAL_MS = 10000;

async function bootstrap() {
  console.log('🚀 QuantPulse Data Worker initializing...');
  
  await prisma.$connect();
  console.log('✅ Connected to TimescaleDB');

  // Handle incoming ticks from anywhere
  const processTick = (rawTick: any) => {
    const tick: NormalizedTick = DataNormalizer.normalize(rawTick);

    // 1. Immediately push tick to Redis for Real-time WebSocket clients
    // Emit stringified tick along with assetId as key
    redis.publish('market:ticks', JSON.stringify(tick));

    // 2. Buffer for DB persistence
    // Fast inserts logic: accumulate in buffer, flush periodically
    // Note: We need the asset UUID id from the DB, but for scale we should
    // ideally cache the assetId -> UUID mapping in memory using Redis or a Map.
    tickBuffer.push(tick);
  };

  // We need a mapping from string assetId (e.g., 'MCX_GOLD') to the DB UUID
  const commodities = await prisma.commodity.findMany();
  const assetIdMap = new Map();
  commodities.forEach((c: { assetId: any; id: any; }) => {
    assetIdMap.set(c.assetId, c.id);
  });

  // Start background flush to TimescaleDB
  dbWriteInterval = setInterval(async () => {
    if (tickBuffer.length > 0) {
      const batch = [...tickBuffer];
      tickBuffer = []; // reset
      
      const dbRecords = batch
        .filter(t => assetIdMap.has(t.assetId))
        .map(t => ({
          commodityId: assetIdMap.get(t.assetId),
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
          // push back to buffer recursively if needed (skipped for simplicity here)
        }
      }
    }
  }, WRITE_INTERVAL_MS);


  // Setup Connectors
  const mcx = new MCXConnector(processTick);
  const solar = new SolarConnector(processTick);

  mcx.start();
  solar.start();

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('Shutting down Data Worker...');
    mcx.stop();
    solar.stop();
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
