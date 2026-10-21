import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { InicioService } from './inicio.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly inicio: InicioService,
  ) {}

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.dashboardService.getStats();
  }

  /** Inicio del backoffice: lo pendiente del día y los últimos 30 días contra los 30 anteriores. */
  @Get('hoy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getHoy() {
    return this.inicio.hoy();
  }

  /** Guía de puesta en marcha: qué falta configurar (solo sí/no, nunca valores). */
  @Get('puesta-en-marcha')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getPuestaEnMarcha() {
    return this.inicio.puestaEnMarcha();
  }
}
