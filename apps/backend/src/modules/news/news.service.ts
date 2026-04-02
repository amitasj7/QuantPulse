import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit = 20, commodityId?: string) {
    const parsedLimit = Number(limit) || 20;

    return this.prisma.commodityNews.findMany({
      where: commodityId
        ? { commodity: { assetId: commodityId } }
        : undefined,
      include: {
        commodity: {
          select: { assetId: true, name: true, symbol: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: parsedLimit,
    });
  }

  async findByCommodity(assetId: string, limit = 10) {
    const parsedLimit = Number(limit) || 10;

    return this.prisma.commodityNews.findMany({
      where: {
        commodity: { assetId },
      },
      include: {
        commodity: {
          select: { assetId: true, name: true, symbol: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: parsedLimit,
    });
  }
}
