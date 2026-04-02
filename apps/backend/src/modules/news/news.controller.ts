import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query('limit') limit: number = 20,
    @Query('commodityId') commodityId?: string,
  ) {
    return this.newsService.findAll(limit, commodityId);
  }

  @Get('commodity/:assetId')
  findByCommodity(
    @Param('assetId') assetId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.newsService.findByCommodity(assetId, limit);
  }
}
