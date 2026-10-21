import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { PosventaModule } from '../posventa/posventa.module';

@Module({
  imports: [PosventaModule],
  controllers: [ContactController],
})
export class ContactModule {}