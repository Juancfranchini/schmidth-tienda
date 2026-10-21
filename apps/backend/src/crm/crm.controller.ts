import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CrmService } from './crm.service';
import { ActualizarFichaDto, EmailDto, FiltroContactosDto, NuevaNotaDto } from './dto/crm.dto';

/**
 * CRM de la tienda. Solo el administrador: las notas y los datos de las
 * personas no son para el personal del punto de venta.
 */
@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('crm')
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Get('contactos')
  listar(@Query() filtro: FiltroContactosDto) {
    return this.crm.listar(filtro);
  }

  @Get('contacto')
  detalle(@Query() { email }: EmailDto) {
    return this.crm.detalle(email);
  }

  @Patch('contacto')
  actualizar(@Body() dto: ActualizarFichaDto) {
    return this.crm.actualizarFicha(dto);
  }

  @Post('notas')
  agregarNota(@Body() dto: NuevaNotaDto, @CurrentUser() usuario: { name?: string }) {
    return this.crm.agregarNota(dto.email, dto.texto, usuario?.name || 'Administrador');
  }

  @Delete('notas/:id')
  borrarNota(@Param('id') id: string) {
    return this.crm.borrarNota(id);
  }
}
