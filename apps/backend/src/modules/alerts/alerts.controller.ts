import { Controller, Get, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('forex')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('latest')
  getLatestRate(@Query('pair') pair: string = 'USD_INR') {
    return this.alertsService.getLatestForexRate(pair);
  }

  @Get('history')
  getHistory(
    @Query('pair') pair: string = 'USD_INR',
    @Query('limit') limit: number = 50,
  ) {
    return this.alertsService.getForexHistory(pair, limit);
  }
}
