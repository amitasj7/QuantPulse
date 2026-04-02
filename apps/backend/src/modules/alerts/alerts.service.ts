import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestForexRate(pair: string) {
    return this.prisma.forexRate.findFirst({
      where: { pair },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getForexHistory(pair: string, limit = 50) {
    const parsedLimit = Number(limit) || 50;

    const history = await this.prisma.forexRate.findMany({
      where: { pair },
      orderBy: { timestamp: 'desc' },
      take: parsedLimit,
    });

    return history.reverse();
  }
}
