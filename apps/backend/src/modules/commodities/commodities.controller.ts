import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommoditiesService } from './commodities.service';

@Controller('commodities')
export class CommoditiesController {
  constructor(private readonly commoditiesService: CommoditiesService) {}

  @Get()
  findAll() {
    return this.commoditiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commoditiesService.findOne(id);
  }

  @Get(':id/prices')
  getPriceHistory(
    @Param('id') id: string,
    @Query('interval') interval: string = '1h',
    @Query('limit') limit: number = 100,
  ) {
    return this.commoditiesService.getPriceHistory(id, interval, limit);
  }
}
