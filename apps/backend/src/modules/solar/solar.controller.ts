import { Controller, Get, Param, Query } from '@nestjs/common';
import { SolarService } from './solar.service';

@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Get('supply-chain')
  getSupplyChainMetrics() {
    return this.solarService.getSupplyChainMetrics();
  }

  @Get(':id/prices')
  getPriceHistory(
    @Param('id') id: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.solarService.getPriceHistory(id, limit);
  }
}
