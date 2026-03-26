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
}
