// Forma de entrega elegida en el checkout: a domicilio o a retirar en una
// sucursal del correo. Se usa igual desde Mercado Pago (PaymentsService) y
// desde transferencia (OrdersService), para que el backoffice lea lo mismo.
//
// La sucursal la escribe el cliente (todavía no hay integración con los
// correos para elegirla de un listado).

import { BadRequestException } from '@nestjs/common';

export type Modalidad = 'domicilio' | 'sucursal';
export const MODALIDADES: Modalidad[] = ['domicilio', 'sucursal'];

/** Transportistas que tienen sucursales para retirar. */
const CON_SUCURSAL: Record<string, string> = { correo_argentino: 'Correo Argentino', andreani: 'Andreani' };

export interface Entrega {
  modalidad: Modalidad | null;
  sucursal: string | null;
}

/** Valida la modalidad: solo aplica a correos con sucursal, y si es sucursal tiene que decir cuál. */
export function entregaDe(carrier: string | undefined, modalidad?: string, sucursal?: string): Entrega {
  const transportista = carrier || 'correo_argentino';
  if (!CON_SUCURSAL[transportista]) return { modalidad: null, sucursal: null };
  if (modalidad !== 'sucursal') return { modalidad: 'domicilio', sucursal: null };
  const cual = (sucursal || '').trim();
  if (cual.length < 3) throw new BadRequestException('Indicá en qué sucursal de ' + CON_SUCURSAL[transportista] + ' querés retirar.');
  return { modalidad: 'sucursal', sucursal: cual };
}

/** Texto de entrega para retiro en sucursal, con la localidad para que el correo la ubique. */
export function direccionDeSucursal(carrier: string | undefined, sucursal: string, localidad?: string): string {
  const nombre = CON_SUCURSAL[carrier || 'correo_argentino'] ?? 'Correo';
  return nombre + ' — Retiro en sucursal: ' + sucursal + (localidad?.trim() ? ' — ' + localidad.trim() : '');
}

/** Lo que se guarda en las notas del pedido (solo si aplica). */
export function entregaEnNotas(entrega: Entrega): Record<string, string> {
  if (!entrega.modalidad) return {};
  return entrega.sucursal ? { shippingModalidad: entrega.modalidad, shippingSucursal: entrega.sucursal } : { shippingModalidad: entrega.modalidad };
}
