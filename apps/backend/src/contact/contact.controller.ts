import { Controller, Post, Body, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { ArrepentimientoDto, ContactDto } from './dto/contact.dto';

/** Código que identifica una solicitud de arrepentimiento (se le manda a la clienta). */
export function codigoDeArrepentimiento(ahora = new Date()): string {
  const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '');
  return 'ARR-' + fecha + '-' + randomBytes(3).toString('hex').toUpperCase();
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendMessage(@Body() body: ContactDto) {
    try {
      await this.emailService.sendContactNotification(body);
      return { success: true, message: 'Mensaje recibido correctamente' };
    } catch (error) {
      this.logger.error('No se pudo enviar el mensaje de contacto: ' + String(error));
      return { success: false, message: 'Error al enviar el mensaje' };
    }
  }

  /**
   * Botón de arrepentimiento. Responde el código solo si los dos mails (a la
   * tienda y a la clienta) salieron; si no, 503 para que la tienda muestre
   * cómo hacerlo por otra vía en vez de dar por recibido algo que se perdió.
   */
  @Post('arrepentimiento')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async arrepentimiento(@Body() body: ArrepentimientoDto) {
    const codigo = codigoDeArrepentimiento();
    try {
      await this.emailService.sendArrepentimiento({ ...body, codigo });
    } catch (error) {
      this.logger.error('Arrepentimiento ' + codigo + ' sin enviar: ' + String(error));
      throw new ServiceUnavailableException('No pudimos registrar tu pedido. Escribinos por mail o WhatsApp.');
    }
    return { codigo };
  }
}
