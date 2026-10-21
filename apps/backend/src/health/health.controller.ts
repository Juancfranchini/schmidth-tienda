// GET /api/health  público. Railway lo usa para saber que el server arrancó
// antes de pasarle tráfico (healthcheckPath en railway.toml). No toca la base:
// un corte momentáneo de Postgres no tiene que frenar un deploy.

import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
