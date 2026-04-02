import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SolarService {
  constructor(private readonly prisma: PrismaService) {}

  async getSupplyChainMetrics() {
    return this.prisma.commodity.findMany({
      where: { category: 'SOLAR' },
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPriceHistory(assetId: string, limit: number) {
    const parsedLimit = Number(limit) || 100;

    const history = await this.prisma.priceHistory.findMany({
      where: {
        commodity: { assetId },
      },
      orderBy: { timestamp: 'desc' },
      take: parsedLimit,
    });

    return history.reverse();
  }
}
