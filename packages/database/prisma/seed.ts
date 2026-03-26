import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MCX_ASSETS = [
  { assetId: 'MCX_ALUMINIUM', name: 'Aluminium', symbol: 'ALUM', category: 'METAL', unit: 'INR/Kg', exchange: 'MCX' },
  { assetId: 'MCX_SILVER', name: 'Silver', symbol: 'SILV', category: 'METAL', unit: 'INR/Kg', exchange: 'MCX' },
  { assetId: 'MCX_GOLD', name: 'Gold', symbol: 'GOLD', category: 'METAL', unit: 'INR/10g', exchange: 'MCX' },
  { assetId: 'MCX_STEEL', name: 'Steel', symbol: 'STEL', category: 'INDUSTRIAL', unit: 'INR/Kg', exchange: 'MCX' },
  { assetId: 'MCX_COPPER', name: 'Copper', symbol: 'COPP', category: 'METAL', unit: 'INR/Kg', exchange: 'MCX' },
  { assetId: 'MCX_CEMENT', name: 'Cement', symbol: 'CEM', category: 'INDUSTRIAL', unit: 'INR/Bag', exchange: 'MCX' },
  { assetId: 'MCX_CRUDEOIL', name: 'Crude Oil', symbol: 'OIL', category: 'ENERGY', unit: 'INR/Barrel', exchange: 'MCX' },
];

const SOLAR_ASSETS = [
  { assetId: 'POLYSILICON_USD', name: 'Polysilicon', symbol: 'POLY', category: 'SOLAR', unit: 'USD/Kg', exchange: 'GLOBAL' },
  { assetId: 'SOLAR_WAFER', name: 'Wafer (Mono N-Type CZ)', symbol: 'WAFR', category: 'SOLAR', unit: 'USD/Piece', exchange: 'GLOBAL' },
  { assetId: 'SOLAR_CELL', name: 'Solar Cell', symbol: 'CELL', category: 'SOLAR', unit: 'USD/Watt', exchange: 'GLOBAL' },
  { assetId: 'SOLAR_MODULE_WATT', name: 'Solar Module', symbol: 'MOD', category: 'SOLAR', unit: 'USD/Watt', exchange: 'GLOBAL' },
  { assetId: 'SOLAR_FINISHED', name: 'Finished Product', symbol: 'FIN', category: 'SOLAR', unit: 'USD/Watt', exchange: 'GLOBAL' },
];

async function main() {
  console.log('🌱 Seeding QuantPulse database...');

  // 1. Seed Commodities
  console.log('Inserting commodities...');
  const allAssets = [...MCX_ASSETS, ...SOLAR_ASSETS];
  const commodityRecords = [];

  for (const asset of allAssets) {
    const record = await prisma.commodity.upsert({
      where: { assetId: asset.assetId },
      update: {},
      create: asset,
    });
    commodityRecords.push(record);
  }

  // 2. Generate and Seed Sample Price History for MCX_GOLD
  console.log('Generating sample price history...');
  const gold = commodityRecords.find(c => c.assetId === 'MCX_GOLD');
  
  if (gold) {
    const prices = [];
    let currentPrice = 62450; // Starting INR price
    const now = new Date();
    
    // Generate 100 hourly candles
    for (let i = 100; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const open = currentPrice;
      const change = (Math.random() - 0.5) * 500; // Random fluctuation
      currentPrice += change;
      const close = currentPrice;
      const high = Math.max(open, close) + Math.random() * 200;
      const low = Math.min(open, close) - Math.random() * 200;

      prices.push({
        commodityId: gold.id,
        priceINR: close,
        priceUSD: close / 83.5, // Mock conversion rate
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000) + 100,
        percentChange: (change / open) * 100,
        sourceProvider: 'BROKER',
        interval: '1h',
        timestamp,
      });
    }

    // Insert historical prices
    await prisma.priceHistory.createMany({
      data: prices,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
