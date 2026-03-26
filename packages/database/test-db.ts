import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.commodity.count();
  console.log(`Total Commodities: ${count}`);

  const gold = await prisma.commodity.findUnique({
    where: { assetId: 'MCX_GOLD' },
    include: {
      prices: {
        orderBy: { timestamp: 'desc' },
        take: 3,
      }
    }
  });

  if (gold) {
    console.log(`\nLast 3 prices for ${gold.name}:`);
    gold.prices.forEach(p => {
      console.log(`- Time: ${p.timestamp.toISOString()} | Price (INR): ${p.priceINR.toFixed(2)} | Change: ${p.percentChange?.toFixed(2)}%`);
    });
  }
}

main().finally(() => prisma.$disconnect());
