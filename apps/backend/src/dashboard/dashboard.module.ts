import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InicioService } from './inicio.service';
import { PosventaModule } from '../posventa/posventa.module';

@Module({
  imports: [PosventaModule],
  controllers: [DashboardController],
  providers: [DashboardService, InicioService],
})
export class DashboardModule {}