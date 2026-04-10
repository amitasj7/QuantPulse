import { Controller, Get, Param, Query, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { CommoditiesService } from './commodities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('commodities')
export class CommoditiesController {
  constructor(private readonly commoditiesService: CommoditiesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.commoditiesService.findAll(category);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() createCommodityDto: any) {
    const data = await this.commoditiesService.create(createCommodityDto);
    return {
      status: 'success',
      message: 'Commodity added successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    const data = await this.commoditiesService.toggleStatus(id, isActive);
    return {
      status: 'success',
      message: isActive ? 'Commodity tracking enabled' : 'Commodity tracking disabled',
      data,
    };
  }
}
