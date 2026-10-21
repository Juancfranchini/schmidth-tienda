/**
 * Mini CRM: una persona por mail, armada con lo que ya existe en la base
 * (cuentas, pedidos, carritos abandonados, newsletter) más la ficha de
 * seguimiento que carga la tienda. Todo puro: la lectura de la base vive en
 * crm.service.ts.
 */

export const ETAPAS = ['frecuente', 'cliente', 'por_cobrar', 'carrito', 'suscriptor', 'registrado'] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Estados en los que el dinero ya entró. */
const COBRADOS = ['PAID', 'SHIPPED', 'DELIVERED'];

export interface InsumoUsuario { email: string; name: string | null; phone: string | null; createdAt: Date }
/** `transferencia`: eligió pagar por transferencia. Quien eligió Mercado Pago y no pagó abandonó el checkout. */
export interface InsumoPedido { email: string; name: string | null; phone: string | null; status: string; total: number; createdAt: Date; transferencia: boolean }
export interface InsumoCarrito { email: string; name: string | null; phone: string | null; total: number; updatedAt: Date; recoveredAt: Date | null }
export interface InsumoSuscripto { email: string; createdAt: Date }
export interface InsumoFicha { email: string; tags: string[]; nextAction: string | null; nextActionAt: Date | null; lastContactAt: Date | null }

export interface Insumos {
  usuarios: InsumoUsuario[];
  pedidos: InsumoPedido[];
  carritos: InsumoCarrito[];
  suscriptos: InsumoSuscripto[];
  fichas: InsumoFicha[];
}

export interface Contacto {
  email: string;
  nombre: string;
  telefono: string | null;
  etapa: Etapa;
  /** Pedidos cobrados (no cuenta los cancelados ni los que esperan el pago). */
  pedidos: number;
  gastado: number;
  /** Plata de pedidos por transferencia que esperan el comprobante. */
  porCobrar: number;
  /** Plata que dejó sin comprar: un carrito abandonado o un pago en Mercado Pago que no completó. */
  carrito: number;
  tieneCuenta: boolean;
  suscripto: boolean;
  clienteDesde: string | null;
  /** Lo último que hizo: pedido, carrito, alta. */
  ultimoMovimiento: string;
  etiquetas: string[];
  proximaAccion: string | null;
  proximaAccionFecha: string | null;
  ultimoContacto: string | null;
}

interface Acumulado {
  email: string;
  nombre: string;
  telefono: string | null;
  pedidos: number;
  gastado: number;
  porCobrar: number;
  carrito: number;
  /** Lo más alto que dejó en un pago de Mercado Pago sin completar. */
  mpSinPagar: number;
  tieneCuenta: boolean;
  suscripto: boolean;
  primeraCompra: Date | null;
  ultimo: Date;
}

export const normalizarMail = (email: string) => email.trim().toLowerCase();

function nuevo(email: string, fecha: Date): Acumulado {
  return { email, nombre: '', telefono: null, pedidos: 0, gastado: 0, porCobrar: 0, carrito: 0, mpSinPagar: 0, tieneCuenta: false, suscripto: false, primeraCompra: null, ultimo: fecha };
}

/** Se queda con el dato más completo: el nombre o teléfono que haya, sin pisarlo con vacío. */
function completar(a: Acumulado, nombre?: string | null, telefono?: string | null) {
  if (!a.nombre && nombre?.trim()) a.nombre = nombre.trim();
  if (!a.telefono && telefono?.trim()) a.telefono = telefono.trim();
}

/** La etapa sale de lo que la persona hizo: no se carga a mano, así nunca queda desactualizada. */
export function etapaDe(a: Pick<Acumulado, 'pedidos' | 'porCobrar' | 'carrito' | 'mpSinPagar' | 'suscripto' | 'tieneCuenta'>): Etapa {
  if (a.pedidos >= 2) return 'frecuente';
  if (a.pedidos === 1) return 'cliente';
  if (a.porCobrar > 0) return 'por_cobrar';
  if (a.carrito > 0 || a.mpSinPagar > 0) return 'carrito';
  if (a.suscripto) return 'suscriptor';
  return 'registrado';
}

export function armarContactos(insumos: Insumos): Contacto[] {
  const porMail = new Map<string, Acumulado>();
  const de = (email: string, fecha: Date) => {
    const clave = normalizarMail(email);
    let a = porMail.get(clave);
    if (!a) porMail.set(clave, (a = nuevo(clave, fecha)));
    if (fecha > a.ultimo) a.ultimo = fecha;
    return a;
  };

  for (const u of insumos.usuarios) {
    if (!u.email) continue;
    const a = de(u.email, u.createdAt);
    a.tieneCuenta = true;
    completar(a, u.name, u.phone);
  }
  for (const p of insumos.pedidos) {
    if (!p.email) continue;
    const a = de(p.email, p.createdAt);
    completar(a, p.name, p.phone);
    if (COBRADOS.includes(p.status)) {
      a.pedidos += 1;
      a.gastado += p.total;
      if (!a.primeraCompra || p.createdAt < a.primeraCompra) a.primeraCompra = p.createdAt;
    } else if (p.status === 'PENDING') {
      // Transferencia: espera el comprobante. Mercado Pago sin pagar: se fue del checkout.
      if (p.transferencia) a.porCobrar += p.total;
      else a.mpSinPagar = Math.max(a.mpSinPagar, p.total);
    }
  }
  for (const c of insumos.carritos) {
    if (!c.email) continue;
    const a = de(c.email, c.updatedAt);
    completar(a, c.name, c.phone);
    if (!c.recoveredAt) a.carrito += c.total;
  }
  for (const s of insumos.suscriptos) {
    if (!s.email) continue;
    de(s.email, s.createdAt).suscripto = true;
  }

  const fichas = new Map(insumos.fichas.map((f) => [normalizarMail(f.email), f]));
  return [...porMail.values()].map((a) => {
    const ficha = fichas.get(a.email);
    return {
      email: a.email,
      nombre: a.nombre || a.email.split('@')[0],
      telefono: a.telefono,
      etapa: etapaDe(a),
      pedidos: a.pedidos,
      gastado: a.gastado,
      porCobrar: a.porCobrar,
      // El carrito y el pago sin completar suelen ser la misma compra: no se suman.
      carrito: Math.max(a.carrito, a.mpSinPagar),
      tieneCuenta: a.tieneCuenta,
      suscripto: a.suscripto,
      clienteDesde: a.primeraCompra?.toISOString() ?? null,
      ultimoMovimiento: a.ultimo.toISOString(),
      etiquetas: ficha?.tags ?? [],
      proximaAccion: ficha?.nextAction ?? null,
      proximaAccionFecha: ficha?.nextActionAt?.toISOString() ?? null,
      ultimoContacto: ficha?.lastContactAt?.toISOString() ?? null,
    };
  });
}

export interface FiltroContactos {
  q?: string;
  etapa?: Etapa;
  etiqueta?: string;
  /** Solo los que tienen una acción pendiente para hoy o vencida. */
  conAccionVencida?: boolean;
  orden?: 'reciente' | 'gastado' | 'pedidos' | 'nombre';
}

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Teléfono sin espacios ni guiones, para que "11 5555-0123" encuentre "1155550123". */
const soloDigitos = (t: string) => t.replace(/\D/g, '');

export function filtrarContactos(contactos: Contacto[], f: FiltroContactos, ahora = new Date()): Contacto[] {
  const buscado = f.q ? sinTildes(f.q.trim()) : '';
  const digitos = f.q ? soloDigitos(f.q) : '';
  const etiqueta = f.etiqueta?.trim().toLowerCase();

  const lista = contactos.filter((c) => {
    if (f.etapa && c.etapa !== f.etapa) return false;
    if (etiqueta && !c.etiquetas.includes(etiqueta)) return false;
    if (f.conAccionVencida && !(c.proximaAccionFecha && new Date(c.proximaAccionFecha) <= ahora)) return false;
    if (!buscado) return true;
    if (sinTildes(c.nombre).includes(buscado) || c.email.includes(buscado)) return true;
    return digitos.length >= 4 && !!c.telefono && soloDigitos(c.telefono).includes(digitos);
  });

  const orden = f.orden ?? 'reciente';
  const comparar: Record<string, (a: Contacto, b: Contacto) => number> = {
    reciente: (a, b) => b.ultimoMovimiento.localeCompare(a.ultimoMovimiento),
    gastado: (a, b) => b.gastado - a.gastado || b.ultimoMovimiento.localeCompare(a.ultimoMovimiento),
    pedidos: (a, b) => b.pedidos - a.pedidos || b.gastado - a.gastado,
    nombre: (a, b) => sinTildes(a.nombre).localeCompare(sinTildes(b.nombre)),
  };
  return lista.sort(comparar[orden] ?? comparar.reciente);
}

export interface Resumen {
  total: number;
  porEtapa: Record<Etapa, number>;
  /** Lo cobrado en total entre todas las personas. */
  facturado: number;
  accionesVencidas: number;
}

export function resumirContactos(contactos: Contacto[], ahora = new Date()): Resumen {
  const porEtapa = Object.fromEntries(ETAPAS.map((e) => [e, 0])) as Record<Etapa, number>;
  let facturado = 0;
  let accionesVencidas = 0;
  for (const c of contactos) {
    porEtapa[c.etapa] += 1;
    facturado += c.gastado;
    if (c.proximaAccionFecha && new Date(c.proximaAccionFecha) <= ahora) accionesVencidas += 1;
  }
  return { total: contactos.length, porEtapa, facturado, accionesVencidas };
}

/** Todas las etiquetas en uso, para el filtro. */
export function etiquetasEnUso(contactos: Contacto[]): string[] {
  return [...new Set(contactos.flatMap((c) => c.etiquetas))].sort((a, b) => a.localeCompare(b, 'es'));
}
