import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InicioService } from './inicio.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, InicioService],
})
export class DashboardModule {}