import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ArrepentimientoDto, ContactDto } from './dto/contact.dto';
import { TipoSolicitud } from '@prisma/client';
import { ContactController } from './contact.controller';
import { codigoSolicitud } from '../posventa/posventa';
import { mailArrepentimientoClienta, mailContactoTienda } from '../email/avisos-emails';

async function errores<T extends object>(clase: new () => T, body: Record<string, unknown>) {
  return validate(plainToInstance(clase, body), { whitelist: true, forbidNonWhitelisted: true });
}

describe('Botón de arrepentimiento', () => {
  const pedido = { nombre: 'Ana', email: 'ana@ejemplo.com', pedido: 'SCH-123' };

  it('el código identifica la fecha y no se repite', () => {
    const a = codigoSolicitud(TipoSolicitud.ARREPENTIMIENTO, new Date('2026-10-21T12:00:00Z'));
    expect(a).toMatch(/^ARR-20261021-[0-9A-F]{6}$/);
    expect(codigoSolicitud(TipoSolicitud.CAMBIO)).toMatch(/^SOL-/);
    expect(codigoSolicitud(TipoSolicitud.FALLA)).not.toBe(codigoSolicitud(TipoSolicitud.FALLA));
  });

  it('el DTO pide nombre, email y número de pedido', async () => {
    expect(await errores(ArrepentimientoDto, pedido)).toHaveLength(0);
    expect((await errores(ArrepentimientoDto, { ...pedido, pedido: '' })).map((e) => e.property)).toContain('pedido');
    expect((await errores(ArrepentimientoDto, { ...pedido, email: 'no-es-mail' })).map((e) => e.property)).toContain('email');
  });

  const posventa = () => ({ crear: jest.fn().mockResolvedValue({ codigo: 'ARR-20261021-ABC123' }) });

  it('guarda la solicitud y devuelve el código cuando los mails salen', async () => {
    const email = { sendArrepentimiento: jest.fn().mockResolvedValue(undefined) };
    const p = posventa();
    const controller = new ContactController(email as never, p as never);
    const r = await controller.arrepentimiento(pedido as ArrepentimientoDto);
    expect(r).toEqual({ codigo: 'ARR-20261021-ABC123', avisoEnviado: true });
    expect(p.crear).toHaveBeenCalledWith(expect.objectContaining({ tipo: TipoSolicitud.ARREPENTIMIENTO, pedidoNumero: 'SCH-123' }), 'tienda');
    expect(email.sendArrepentimiento).toHaveBeenCalledWith(expect.objectContaining({ pedido: 'SCH-123', codigo: r.codigo }));
  });

  it('si los mails no salen, la solicitud queda guardada y se avisa que no hubo mail', async () => {
    const email = { sendArrepentimiento: jest.fn().mockRejectedValue(new Error('sin Resend')) };
    const p = posventa();
    const controller = new ContactController(email as never, p as never);
    const r = await controller.arrepentimiento(pedido as ArrepentimientoDto);
    expect(p.crear).toHaveBeenCalled();
    expect(r).toEqual({ codigo: 'ARR-20261021-ABC123', avisoEnviado: false });
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
