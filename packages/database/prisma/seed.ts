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
  console.log('🌱 Seeding QuantPulse database (asset catalog only)...');

  // Seed Commodities — upsert so it's safe to re-run
  const allAssets = [...MCX_ASSETS, ...SOLAR_ASSETS];

  for (const asset of allAssets) {
    await prisma.commodity.upsert({
      where: { assetId: asset.assetId },
      update: { name: asset.name, symbol: asset.symbol, category: asset.category, unit: asset.unit, exchange: asset.exchange },
      create: asset,
    });
  }

  console.log(`✅ Seeded ${allAssets.length} commodity definitions.`);

  // --- Seed Default Admin ---
  console.log('🌱 Seeding Default Admin...');
  const bcrypt = await import('bcrypt');
  const adminPassword = process.env.ADMIN_PASSWORD || 'quantpulse2026';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  await prisma.admin.upsert({
    where: { email: 'admin@quantpulse.com' },
    update: { passwordHash },
    create: {
      name: 'Super Admin',
      email: 'admin@quantpulse.com',
      mobile: '1234567890',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Default admin created: admin@quantpulse.com`);

  console.log('');
  console.log('ℹ️  No fake price history generated.');
  console.log('    Real prices will be fetched by the Worker using your API keys.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });