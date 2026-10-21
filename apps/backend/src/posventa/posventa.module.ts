import { Module } from '@nestjs/common';
import { PosventaController } from './posventa.controller';
import { PosventaService } from './posventa.service';

@Module({
  controllers: [PosventaController],
  providers: [PosventaService],
  exports: [PosventaService],
})
export class PosventaModule {}
