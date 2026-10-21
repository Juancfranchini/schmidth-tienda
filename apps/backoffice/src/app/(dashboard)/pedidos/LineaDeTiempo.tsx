'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { Pedido } from './tipos';
import { fechaCorta } from './formato';

interface Evento {
  fecha: string;
  titulo: string;
  detalle?: string;
  tono: 'normal' | 'bien' | 'alerta' | 'mal';
  href?: string;
}

const METODOS: Record<string, string> = {
  CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta', DIGITAL_WALLET: 'Mercado Pago', EXTERNAL_TERMINAL: 'Terminal externa',
};
const TIPOS_SOLICITUD: Record<string, string> = { ARREPENTIMIENTO: 'Arrepentimiento', CAMBIO: 'Pedido de cambio', FALLA: 'Reclamo por falla' };
const ESTADOS_SOLICITUD: Record<string, string> = { PENDIENTE: 'pendiente', EN_CURSO: 'en curso', RESUELTA: 'resuelta', RECHAZADA: 'rechazada' };
const PUNTO: Record<Evento['tono'], string> = {
  normal: 'bg-gray-300', bien: 'bg-emerald-500', alerta: 'bg-amber-500', mal: 'bg-red-500',
};

/**
 * Lo que pasó con el pedido, en orden. Sale de datos que ya se guardan:
 * creación, cobros, cancelación, devoluciones y solicitudes de la clienta.
 * El envío y la entrega no guardan fecha propia, así que solo se muestran
 * como estado actual al final.
 */
export function eventosDelPedido(pedido: Pedido): Evento[] {
  const eventos: Evento[] = [{ fecha: pedido.createdAt, titulo: 'Pedido creado', tono: 'normal' }];
  for (const pago of pedido.payments || []) {
    if (!pago.receivedAt) continue;
    const devolucion = pago.kind === 'REFUND' || pago.amount < 0;
    eventos.push({
      fecha: pago.receivedAt,
      titulo: devolucion ? 'Reintegro' : 'Cobro registrado',
      detalle: (METODOS[pago.method] || pago.method) + ' · ' + formatPrice(Math.abs(pago.amount)),
      tono: devolucion ? 'alerta' : 'bien',
    });
  }
  if (pedido.paidAt && !(pedido.payments || []).some((p) => p.receivedAt)) {
    eventos.push({ fecha: pedido.paidAt, titulo: 'Pago acreditado', tono: 'bien' });
  }
  for (const r of pedido.returns || []) {
    eventos.push({
      fecha: r.createdAt,
      titulo: r.type === 'EXCHANGE' ? 'Cambio registrado' : 'Devolución registrada',
      detalle: r.reason + (r.refundAmount > 0 ? ' · reintegro ' + formatPrice(r.refundAmount) : ''),
      tono: 'alerta',
    });
  }
  for (const s of pedido.solicitudes || []) {
    eventos.push({
      fecha: s.createdAt,
      titulo: (TIPOS_SOLICITUD[s.tipo] || s.tipo) + ' ' + s.codigo,
      detalle: 'Solicitud ' + (ESTADOS_SOLICITUD[s.estado] || s.estado),
      tono: 'alerta',
      href: '/devoluciones?codigo=' + encodeURIComponent(s.codigo),
    });
  }
  if (pedido.cancelledAt) {
    eventos.push({ fecha: pedido.cancelledAt, titulo: 'Pedido cancelado', detalle: pedido.cancellationReason || undefined, tono: 'mal' });
  }
  return eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const ACTUAL: Record<string, string> = { SHIPPED: 'Hoy: enviado', DELIVERED: 'Hoy: entregado / retirado' };

export function LineaDeTiempo({ pedido }: { pedido: Pedido }) {
  const eventos = eventosDelPedido(pedido);
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Historial</h3>
      <ol className="space-y-3 border-l border-gray-200 pl-4">
        {eventos.map((e, i) => (
          <li key={i} className="relative">
            <span className={'absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ' + PUNTO[e.tono]} />
            <p className="text-sm font-medium text-gray-900">
              {e.href ? <Link href={e.href} className="text-blue-700 hover:underline">{e.titulo}</Link> : e.titulo}
            </p>
            <p className="text-xs text-gray-500">{fechaCorta(e.fecha)}{e.detalle ? ' · ' + e.detalle : ''}</p>
          </li>
        ))}
        {ACTUAL[pedido.status] && (
          <li className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#B3855C] ring-2 ring-white" />
            <p className="text-sm font-medium text-gray-900">{ACTUAL[pedido.status]}</p>
          </li>
        )}
      </ol>
    </section>
  );
}
