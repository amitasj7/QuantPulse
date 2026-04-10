import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class CommoditiesService {
  private redisPublisher: Redis;

  constructor(private readonly prisma: PrismaService) {
    this.redisPublisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

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
      ? Math.max(...last24hPrices.map((p: any) => p.high ?? p.priceINR))
      : null;
    const low24h = last24hPrices.length > 0
      ? Math.min(...last24hPrices.map((p: any) => p.low ?? p.priceINR))
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

  async create(data: any) {
    const existing = await this.prisma.commodity.findUnique({
      where: { assetId: data.assetId || data.symbol },
    });

    if (existing) {
      throw new ConflictException('Commodity symbol already exists');
    }

    const commodity = await this.prisma.commodity.create({
      data: {
        assetId: data.assetId || data.symbol,
        symbol: data.symbol,
        name: data.name || data.symbol,
        exchange: data.exchange || 'MCX',
        category: data.category || 'METAL',
        unit: data.unit || 'INR/Kg',
        isActive: true,
      },
    });

    this.redisPublisher.publish('market:system', JSON.stringify({
      action: 'UPDATE_ASSET',
      assetId: commodity.assetId,
      symbol: commodity.symbol,
      isActive: true,
    }));

    return commodity;
  }

  async toggleStatus(id: string, isActive: boolean) {
    // Note: ID could be the assetId string OR the uuid
    const commodity = await this.prisma.commodity.updateMany({
      where: { 
        OR: [{ id: id }, { assetId: id }]
      },
      data: { isActive },
    });

    if (commodity.count === 0) {
      throw new NotFoundException('Commodity not found');
    }

    const updated = await this.prisma.commodity.findFirst({
      where: { OR: [{ id: id }, { assetId: id }] }
    });

    if (updated) {
      this.redisPublisher.publish('market:system', JSON.stringify({
        action: 'UPDATE_ASSET',
        assetId: updated.assetId,
        symbol: updated.symbol,
        isActive,
      }));
    }

    return updated;
  }
}
