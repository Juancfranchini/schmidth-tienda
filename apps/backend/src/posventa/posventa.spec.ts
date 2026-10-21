import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EstadoSolicitud, TipoSolicitud } from '@prisma/client';
import { fechaDeCierre, normalizarNumeroPedido } from './posventa';
import { PosventaService } from './posventa.service';
import { ActualizarSolicitudDto, CrearSolicitudDto } from './dto/solicitud.dto';

function prismaFalso(pedido: { id: string } | null) {
  return {
    order: { findFirst: jest.fn().mockResolvedValue(pedido) },
    solicitudPosventa: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 's1', ...data })),
      findUnique: jest.fn().mockResolvedValue({ id: 's1' }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 's1', ...data })),
    },
  };
}

const DATOS = { tipo: TipoSolicitud.ARREPENTIMIENTO, nombre: 'Ana', email: 'Ana@Ejemplo.com', pedidoNumero: ' sch 123 ' };

describe('Posventa', () => {
  it('normaliza el número de pedido que escribe la clienta', () => {
    expect(normalizarNumeroPedido(' sch 123 ')).toBe('SCH-123');
    expect(normalizarNumeroPedido('SCH-1729')).toBe('SCH-1729');
  });

  it('vincula la solicitud al pedido cuando el número coincide', async () => {
    const prisma = prismaFalso({ id: 'pedido-1' });
    const s = await new PosventaService(prisma as never).crear(DATOS, 'tienda');
    expect(prisma.order.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { number: { equals: 'SCH-123', mode: 'insensitive' } } }));
    expect(s).toMatchObject({ orderId: 'pedido-1', pedidoNumero: 'SCH-123', email: 'ana@ejemplo.com', origen: 'tienda' });
    expect(s.codigo).toMatch(/^ARR-\d{8}-[0-9A-F]{6}$/);
  });

  it('sin pedido que coincida, la guarda igual sin vincular', async () => {
    const s = await new PosventaService(prismaFalso(null) as never).crear(DATOS, 'panel');
    expect(s).toMatchObject({ orderId: null, origen: 'panel' });
  });

  it('cerrar una solicitud guarda la fecha; reabrirla la borra', async () => {
    expect(fechaDeCierre(EstadoSolicitud.RESUELTA)).toBeInstanceOf(Date);
    expect(fechaDeCierre(EstadoSolicitud.RECHAZADA)).toBeInstanceOf(Date);
    expect(fechaDeCierre(EstadoSolicitud.EN_CURSO)).toBeNull();
    const prisma = prismaFalso(null);
    await new PosventaService(prisma as never).actualizar('s1', { estado: EstadoSolicitud.EN_CURSO, notas: '' });
    expect(prisma.solicitudPosventa.update).toHaveBeenCalledWith(expect.objectContaining({ data: { estado: 'EN_CURSO', resueltaAt: null, notas: null } }));
  });

  it('los DTOs validan tipo, mail y estado', async () => {
    const errores = async (clase: new () => object, body: Record<string, unknown>) =>
      (await validate(plainToInstance(clase, body), { whitelist: true, forbidNonWhitelisted: true })).map((e) => e.property);
    expect(await errores(CrearSolicitudDto, { ...DATOS })).toEqual([]);
    expect(await errores(CrearSolicitudDto, { ...DATOS, tipo: 'OTRO' })).toContain('tipo');
    expect(await errores(CrearSolicitudDto, { ...DATOS, email: 'x' })).toContain('email');
    expect(await errores(ActualizarSolicitudDto, { estado: 'CERRADA' })).toContain('estado');
  });
});
