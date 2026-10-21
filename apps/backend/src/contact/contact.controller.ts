import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TipoSolicitud } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PosventaService } from '../posventa/posventa.service';
import { ArrepentimientoDto, ContactDto } from './dto/contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly posventa: PosventaService,
  ) {}

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
   * Botón de arrepentimiento. Primero se guarda la solicitud (queda en
   * Devoluciones del panel con su código), después se intentan los mails a la
   * tienda y a la clienta. Si los mails fallan el pedido no se pierde: se
   * responde igual el código y `avisoEnviado: false` para que la tienda le
   * pida a la clienta que lo guarde.
   */
  @Post('arrepentimiento')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async arrepentimiento(@Body() body: ArrepentimientoDto) {
    const solicitud = await this.posventa.crear(
      { tipo: TipoSolicitud.ARREPENTIMIENTO, nombre: body.nombre, email: body.email, telefono: body.telefono, pedidoNumero: body.pedido, motivo: body.motivo },
      'tienda',
    );
    let avisoEnviado = true;
    try {
      await this.emailService.sendArrepentimiento({ ...body, codigo: solicitud.codigo });
    } catch (error) {
      avisoEnviado = false;
      this.logger.error('Arrepentimiento ' + solicitud.codigo + ' guardado, pero sin mails: ' + String(error));
    }
    return { codigo: solicitud.codigo, avisoEnviado };
  }
}
