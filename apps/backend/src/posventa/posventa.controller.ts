import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PosventaService } from './posventa.service';
import { ActualizarSolicitudDto, CrearSolicitudDto, ListarSolicitudesDto } from './dto/solicitud.dto';

/** Devoluciones y arrepentimientos desde el backoffice (solo admin). */
@ApiTags('Posventa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('posventa')
export class PosventaController {
  constructor(private readonly posventa: PosventaService) {}

  @Get()
  listar(@Query() query: ListarSolicitudesDto) {
    return this.posventa.listar(query.estado);
  }

  @Post()
  crear(@Body() dto: CrearSolicitudDto) {
    return this.posventa.crear(dto, 'panel');
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarSolicitudDto) {
    return this.posventa.actualizar(id, dto);
  }
}
