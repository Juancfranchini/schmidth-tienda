import { NotFoundException } from '@nestjs/common';
import { CrmService, limpiarEtiquetas } from './crm.service';

function servicio(sobre: Record<string, unknown> = {}) {
  const prisma = {
    siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { emails: ['yo@prueba.com'] } }) },
    user: {
      findMany: jest.fn().mockResolvedValue([
        { email: 'yo@prueba.com', name: 'Yo', phone: null, createdAt: new Date('2026-10-01') },
        { email: 'ana@x.com', name: 'Ana', phone: '1155550123', createdAt: new Date('2026-10-02') },
      ]),
      count: jest.fn().mockResolvedValue(0),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([
        { status: 'PAID', total: 1000, createdAt: new Date('2026-10-03'), notes: JSON.stringify({ buyerEmail: 'Invitado@X.com', buyerName: 'Invitado', paymentMethod: 'transfer' }), user: null },
        { status: 'PAID', total: 5000, createdAt: new Date('2026-10-04'), notes: null, user: { email: 'ana@x.com', name: 'Ana', phone: null } },
        { status: 'PAID', total: 9, createdAt: new Date('2026-10-05'), notes: JSON.stringify({ buyerEmail: 'yo@prueba.com' }), user: null },
        { status: 'PAID', total: 77, createdAt: new Date('2026-10-06'), notes: null, user: null },
      ]),
      count: jest.fn().mockResolvedValue(0),
    },
    abandonedCart: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findUnique: jest.fn().mockResolvedValue(null) },
    newsletter: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    crmContact: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'f-1' }),
    },
    crmNote: { create: jest.fn().mockResolvedValue({}), findUnique: jest.fn(), delete: jest.fn() },
    ...sobre,
  };
  return { prisma, service: new CrmService(prisma as never) };
}

describe('CrmService.listar', () => {
  it('arma una persona por mail, con invitados y cuentas, y deja afuera las de prueba y los pedidos sin mail', async () => {
    const { service } = servicio();
    const r = await service.listar({});
    expect(r.contactos.map((c) => c.email).sort()).toEqual(['ana@x.com', 'invitado@x.com']);
    expect(r.resumen).toMatchObject({ total: 2, facturado: 6000 });
    expect(r.total).toBe(2);
  });

  it('el resumen y las etiquetas son de todos, aunque se filtre', async () => {
    const { service } = servicio();
    const r = await service.listar({ q: 'invitado' });
    expect(r.total).toBe(1);
    expect(r.resumen.total).toBe(2);
  });

  it('pagina el resultado', async () => {
    const { service } = servicio();
    const r = await service.listar({ limite: 1, pagina: 2 });
    expect(r.contactos).toHaveLength(1);
    expect(r.paginas).toBe(2);
  });
});

describe('CrmService.actualizarFicha', () => {
  const FICHA = { email: 'Ana@X.com' };

  it('no crea fichas para mails que no existen en la tienda', async () => {
    const { prisma, service } = servicio();
    await expect(service.actualizarFicha({ email: 'nadie@x.com', etiquetas: ['vip'] })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.crmContact.upsert).not.toHaveBeenCalled();
  });

  it('guarda las etiquetas limpias y la próxima acción', async () => {
    const { prisma, service } = servicio({ user: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(1) } });
    await service.actualizarFicha({ ...FICHA, etiquetas: [' VIP ', 'vip', '', 'Profe'], proximaAccion: 'Llamar', proximaAccionFecha: '2026-10-20T12:00:00.000Z' }).catch(() => undefined);
    const llamada = prisma.crmContact.upsert.mock.calls[0][0];
    expect(llamada.where).toEqual({ email: 'ana@x.com' });
    expect(llamada.update).toEqual({ tags: ['vip', 'profe'], nextAction: 'Llamar', nextActionAt: new Date('2026-10-20T12:00:00.000Z') });
  });

  it('null borra el campo y lo que no se manda no se toca', async () => {
    const { prisma, service } = servicio({ user: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(1) } });
    await service.actualizarFicha({ ...FICHA, proximaAccionFecha: null, proximaAccion: null }).catch(() => undefined);
    expect(prisma.crmContact.upsert.mock.calls[0][0].update).toEqual({ nextAction: null, nextActionAt: null });
  });
});

describe('CrmService.agregarNota', () => {
  it('guarda la nota con quién la escribió', async () => {
    const { prisma, service } = servicio({ user: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(1) } });
    await service.agregarNota('Ana@X.com', '  Prefiere retirar  ', 'Juan').catch(() => undefined);
    expect(prisma.crmNote.create).toHaveBeenCalledWith({ data: { contactId: 'f-1', text: 'Prefiere retirar', authorName: 'Juan' } });
  });

  it('borrar una nota que no existe da error claro', async () => {
    const { service } = servicio();
    const { prisma } = servicio();
    prisma.crmNote.findUnique.mockResolvedValue(null);
    await expect(new CrmService(prisma as never).borrarNota('x')).rejects.toBeInstanceOf(NotFoundException);
    expect(service).toBeDefined();
  });
});

describe('limpiarEtiquetas', () => {
  it('minúsculas, sin vacíos ni repetidas, máximo 20', () => {
    expect(limpiarEtiquetas([' VIP', 'vip', '  ', 'Profe'])).toEqual(['vip', 'profe']);
    expect(limpiarEtiquetas(Array.from({ length: 30 }, (_, i) => 't' + i))).toHaveLength(20);
  });
});
