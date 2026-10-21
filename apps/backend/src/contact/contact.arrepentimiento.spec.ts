import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ServiceUnavailableException } from '@nestjs/common';
import { ArrepentimientoDto, ContactDto } from './dto/contact.dto';
import { ContactController, codigoDeArrepentimiento } from './contact.controller';
import { mailArrepentimientoClienta, mailContactoTienda } from '../email/avisos-emails';

async function errores<T extends object>(clase: new () => T, body: Record<string, unknown>) {
  return validate(plainToInstance(clase, body), { whitelist: true, forbidNonWhitelisted: true });
}

describe('Botón de arrepentimiento', () => {
  const pedido = { nombre: 'Ana', email: 'ana@ejemplo.com', pedido: 'SCH-123' };

  it('el código identifica la fecha y no se repite', () => {
    const a = codigoDeArrepentimiento(new Date('2026-10-21T12:00:00Z'));
    expect(a).toMatch(/^ARR-20261021-[0-9A-F]{6}$/);
    expect(codigoDeArrepentimiento()).not.toBe(codigoDeArrepentimiento());
  });

  it('el DTO pide nombre, email y número de pedido', async () => {
    expect(await errores(ArrepentimientoDto, pedido)).toHaveLength(0);
    expect((await errores(ArrepentimientoDto, { ...pedido, pedido: '' })).map((e) => e.property)).toContain('pedido');
    expect((await errores(ArrepentimientoDto, { ...pedido, email: 'no-es-mail' })).map((e) => e.property)).toContain('email');
  });

  it('devuelve el código cuando los mails salen', async () => {
    const email = { sendArrepentimiento: jest.fn().mockResolvedValue(undefined) };
    const controller = new ContactController(email as never);
    const { codigo } = await controller.arrepentimiento(pedido as ArrepentimientoDto);
    expect(codigo).toMatch(/^ARR-/);
    expect(email.sendArrepentimiento).toHaveBeenCalledWith(expect.objectContaining({ pedido: 'SCH-123', codigo }));
  });

  it('si los mails no salen, falla en vez de dar el pedido por recibido', async () => {
    const email = { sendArrepentimiento: jest.fn().mockRejectedValue(new Error('sin Resend')) };
    const controller = new ContactController(email as never);
    await expect(controller.arrepentimiento(pedido as ArrepentimientoDto)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('el mail a la clienta lleva el código y escapa lo que escribió', () => {
    const { html } = mailArrepentimientoClienta({ ...pedido, nombre: '<script>x</script>', codigo: 'ARR-1' });
    expect(html).toContain('ARR-1');
    expect(html).not.toContain('<script>');
  });
});

describe('Formulario de contacto', () => {
  it('rechaza campos de más y mensajes vacíos', async () => {
    const base = { name: 'Ana', email: 'ana@ejemplo.com', message: 'Hola' };
    expect(await errores(ContactDto, base)).toHaveLength(0);
    expect((await errores(ContactDto, { ...base, message: '   ' })).map((e) => e.property)).toContain('message');
    expect((await errores(ContactDto, { ...base, extra: 1 })).map((e) => e.property)).toContain('extra');
  });

  it('el aviso a la tienda escapa el HTML del mensaje', () => {
    const { html } = mailContactoTienda({ name: 'Ana', email: 'a@b.com', message: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });
});
