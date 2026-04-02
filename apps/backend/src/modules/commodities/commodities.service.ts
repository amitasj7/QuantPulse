import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommoditiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.commodity.findMany({
      where: category ? { category } : undefined,
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const commodity = await this.prisma.commodity.findUnique({
      where: { assetId: id },
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!commodity) {
      throw new NotFoundException(`Commodity with ID ${id} not found`);
    }

    // 24h summary
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hPrices = await this.prisma.priceHistory.findMany({
      where: {
        commodityId: commodity.id,
        timestamp: { gte: twentyFourHoursAgo },
      },
      select: { high: true, low: true, priceINR: true },
    });

    const high24h = last24hPrices.length > 0
      ? Math.max(...last24hPrices.map((p: { high: number | null; low: number | null; priceINR: number }) => p.high ?? p.priceINR))
      : null;
    const low24h = last24hPrices.length > 0
      ? Math.min(...last24hPrices.map((p: { high: number | null; low: number | null; priceINR: number }) => p.low ?? p.priceINR))
      : null;

    return {
      ...commodity,
      summary24h: { high24h, low24h, tickCount: last24hPrices.length },
    };
  }

  async getPriceHistory(id: string, interval: string, limit: number) {
    const parsedLimit = Number(limit) || 100;

    const history = await this.prisma.priceHistory.findMany({
      where: {
        commodity: { assetId: id },
      },
      orderBy: { timestamp: 'desc' },
      take: parsedLimit,
    });

    return history.reverse();
  }
}
