import { armarContactos, etapaDe, etiquetasEnUso, filtrarContactos, Insumos, resumirContactos } from './crm.contactos';

const d = (dia: string) => new Date('2026-10-' + dia + 'T12:00:00Z');
const vacio: Insumos = { usuarios: [], pedidos: [], carritos: [], suscriptos: [], fichas: [] };
const pedido = (email: string, status: string, total: number, dia = '05', transferencia = true) => ({ email, name: null, phone: null, status, total, createdAt: d(dia), transferencia });

describe('etapa de cada persona', () => {
  const base = { pedidos: 0, porCobrar: 0, carrito: 0, mpSinPagar: 0, suscripto: false, tieneCuenta: false };
  it('sale de lo que hizo, por orden de importancia', () => {
    expect(etapaDe({ ...base, pedidos: 3, porCobrar: 100, carrito: 100 })).toBe('frecuente');
    expect(etapaDe({ ...base, pedidos: 1, carrito: 100 })).toBe('cliente');
    expect(etapaDe({ ...base, porCobrar: 100, carrito: 100 })).toBe('por_cobrar');
    expect(etapaDe({ ...base, carrito: 100, suscripto: true })).toBe('carrito');
    expect(etapaDe({ ...base, suscripto: true, tieneCuenta: true })).toBe('suscriptor');
    expect(etapaDe({ ...base, tieneCuenta: true })).toBe('registrado');
  });
});

describe('armarContactos', () => {
  it('une a la misma persona entre pedido, carrito, cuenta y newsletter, sin importar mayúsculas', () => {
    const [c, ...resto] = armarContactos({
      ...vacio,
      usuarios: [{ email: 'Ana@Gmail.com', name: 'Ana Pérez', phone: null, createdAt: d('01') }],
      pedidos: [{ ...pedido('ana@gmail.com', 'PAID', 100000), phone: '1155550123' }],
      carritos: [{ email: 'ANA@gmail.com', name: null, phone: null, total: 50000, updatedAt: d('09'), recoveredAt: null }],
      suscriptos: [{ email: 'ana@gmail.com ', createdAt: d('02') }],
    });
    expect(resto).toHaveLength(0);
    expect(c).toMatchObject({ email: 'ana@gmail.com', nombre: 'Ana Pérez', telefono: '1155550123', etapa: 'cliente', pedidos: 1, gastado: 100000, carrito: 50000, tieneCuenta: true, suscripto: true });
    expect(c.ultimoMovimiento).toBe(d('09').toISOString());
  });

  it('un pago de Mercado Pago sin completar es un checkout abandonado, no una transferencia por cobrar', () => {
    const [c] = armarContactos({ ...vacio, pedidos: [pedido('a@a.com', 'PENDING', 450000, '05', false)] });
    expect(c).toMatchObject({ etapa: 'carrito', porCobrar: 0, carrito: 450000 });
  });

  it('el carrito y el pago sin completar de la misma compra no se suman', () => {
    const [c] = armarContactos({ ...vacio, pedidos: [pedido('a@a.com', 'PENDING', 450000, '05', false)], carritos: [{ email: 'a@a.com', name: null, phone: null, total: 450000, updatedAt: d('05'), recoveredAt: null }] });
    expect(c.carrito).toBe(450000);
  });

  it('solo los pedidos cobrados cuentan como compra; los cancelados no suman nada', () => {
    const [c] = armarContactos({ ...vacio, pedidos: [pedido('a@a.com', 'PAID', 100), pedido('a@a.com', 'SHIPPED', 200), pedido('a@a.com', 'CANCELLED', 999), pedido('a@a.com', 'PENDING', 300)] });
    expect(c).toMatchObject({ pedidos: 2, gastado: 300, porCobrar: 300, etapa: 'frecuente' });
  });

  it('"cliente desde" es la primera compra cobrada, no la primera cosa que hizo', () => {
    const [c] = armarContactos({ ...vacio, pedidos: [pedido('a@a.com', 'PENDING', 100, '01'), pedido('a@a.com', 'PAID', 100, '08'), pedido('a@a.com', 'PAID', 100, '04')] });
    expect(c.clienteDesde).toBe(d('04').toISOString());
  });

  it('un carrito recuperado ya no cuenta como abandonado', () => {
    const [c] = armarContactos({ ...vacio, carritos: [{ email: 'a@a.com', name: null, phone: null, total: 500, updatedAt: d('03'), recoveredAt: d('04') }] });
    expect(c.carrito).toBe(0);
  });

  it('suma la ficha de seguimiento: etiquetas, próxima acción y último contacto', () => {
    const [c] = armarContactos({ ...vacio, usuarios: [{ email: 'a@a.com', name: 'A', phone: null, createdAt: d('01') }], fichas: [{ email: 'A@a.com', tags: ['vip'], nextAction: 'Llamar', nextActionAt: d('10'), lastContactAt: d('02') }] });
    expect(c).toMatchObject({ etiquetas: ['vip'], proximaAccion: 'Llamar', proximaAccionFecha: d('10').toISOString(), ultimoContacto: d('02').toISOString() });
  });

  it('sin nombre cargado usa lo que está antes de la @, no deja el campo vacío', () => {
    expect(armarContactos({ ...vacio, suscriptos: [{ email: 'maria.lopez@x.com', createdAt: d('01') }] })[0].nombre).toBe('maria.lopez');
  });
});

describe('filtrar y ordenar', () => {
  const gente = armarContactos({
    ...vacio,
    usuarios: [{ email: 'jose@x.com', name: 'José Álvarez', phone: '11 5555-0123', createdAt: d('01') }],
    pedidos: [pedido('lu@x.com', 'PAID', 500000, '03'), pedido('lu@x.com', 'PAID', 300000, '04'), pedido('pa@x.com', 'PAID', 900000, '02')],
    carritos: [{ email: 'ca@x.com', name: 'Carla', phone: null, total: 1000, updatedAt: d('09'), recoveredAt: null }],
    fichas: [{ email: 'pa@x.com', tags: ['vip', 'profe'], nextAction: 'Llamar', nextActionAt: d('01'), lastContactAt: null }],
  });

  it('busca sin tildes ni mayúsculas, y el teléfono sin espacios ni guiones', () => {
    expect(filtrarContactos(gente, { q: 'alvarez' }).map((c) => c.email)).toEqual(['jose@x.com']);
    expect(filtrarContactos(gente, { q: '1155550123' }).map((c) => c.email)).toEqual(['jose@x.com']);
    expect(filtrarContactos(gente, { q: '11 5555' }).map((c) => c.email)).toEqual(['jose@x.com']);
  });

  it('una búsqueda numérica corta no encuentra cualquier teléfono con ese dígito', () => {
    expect(filtrarContactos(gente, { q: '1' })).toHaveLength(0);
  });

  it('filtra por etapa y por etiqueta', () => {
    expect(filtrarContactos(gente, { etapa: 'frecuente' }).map((c) => c.email)).toEqual(['lu@x.com']);
    expect(filtrarContactos(gente, { etiqueta: 'VIP' }).map((c) => c.email)).toEqual(['pa@x.com']);
  });

  it('"acción vencida" solo trae los que tenían algo para hoy o antes', () => {
    expect(filtrarContactos(gente, { conAccionVencida: true }, d('05')).map((c) => c.email)).toEqual(['pa@x.com']);
    expect(filtrarContactos(gente, { conAccionVencida: true }, d('01'))).toHaveLength(1);
    expect(filtrarContactos(gente, { conAccionVencida: true }, new Date('2026-09-01'))).toHaveLength(0);
  });

  it('ordena por lo gastado, por pedidos y por lo último que hicieron', () => {
    expect(filtrarContactos(gente, { orden: 'gastado' })[0].email).toBe('pa@x.com');
    expect(filtrarContactos(gente, { orden: 'pedidos' })[0].email).toBe('lu@x.com');
    expect(filtrarContactos(gente, {})[0].email).toBe('ca@x.com');
  });
});

describe('resumen', () => {
  it('cuenta personas por etapa, lo facturado y las acciones vencidas', () => {
    const gente = armarContactos({
      ...vacio,
      pedidos: [pedido('a@x.com', 'PAID', 1000), pedido('b@x.com', 'PAID', 2000), pedido('b@x.com', 'DELIVERED', 3000)],
      carritos: [{ email: 'c@x.com', name: null, phone: null, total: 10, updatedAt: d('01'), recoveredAt: null }],
      fichas: [{ email: 'a@x.com', tags: ['vip', 'profe'], nextAction: 'Llamar', nextActionAt: d('02'), lastContactAt: null }],
    });
    const r = resumirContactos(gente, d('05'));
    expect(r).toMatchObject({ total: 3, facturado: 6000, accionesVencidas: 1 });
    expect(r.porEtapa).toMatchObject({ cliente: 1, frecuente: 1, carrito: 1, registrado: 0 });
    expect(etiquetasEnUso(gente)).toEqual(['profe', 'vip']);
  });
});
