import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommoditiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.commodity.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const commodity = await this.prisma.commodity.findUnique({
      where: { assetId: id },
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Currently returning latest price only, can be expanded
        },
      },
    });

    if (!commodity) {
      throw new NotFoundException(`Commodity with ID ${id} not found`);
    }

    return commodity;
  }

  async getPriceHistory(id: string, interval: string, limit: number) {
    // Currently fetching raw history from TimescaleDB based on the hypertable.
    // In production, interval parsing maps to TimescaleDB continuous aggregates (time_bucket).
    
    // Convert limit from string if needed
    const parsedLimit = Number(limit) || 100;

    const history = await this.prisma.priceHistory.findMany({
      where: {
        commodity: { assetId: id },
      },
      orderBy: { timestamp: 'desc' },
      take: parsedLimit,
    });

    return history.reverse(); // Return oldest to newest for charts
  }
}
