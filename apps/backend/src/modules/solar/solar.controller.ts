import { Controller, Get } from '@nestjs/common';
import { SolarService } from './solar.service';

@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Get('supply-chain')
  getSupplyChainMetrics() {
    return this.solarService.getSupplyChainMetrics();
  }
}
