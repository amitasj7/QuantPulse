import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CommoditiesModule } from './modules/commodities/commodities.module';
import { SolarModule } from './modules/solar/solar.module';
import { NewsModule } from './modules/news/news.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { GatewayModule } from './modules/gateway/gateway.module';

@Module({
  imports: [
    PrismaModule,
    CommoditiesModule,
    SolarModule,
    NewsModule,
    AlertsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
