'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import type { PagoPedido } from './tipos';

const MEDIOS: Record<string, string> = {
  MERCADOPAGO: 'Mercado Pago', TRANSFER: 'transferencia', CASH: 'efectivo', CARD: 'tarjeta',
  DIGITAL_WALLET: 'billetera', EXTERNAL_TERMINAL: 'posnet',
};

/** Lo que queda cobrado por cada medio (cobros menos reintegros confirmados). */
export function saldoPorMedio(pagos: PagoPedido[] = []): Record<string, number> {
  const saldo: Record<string, number> = {};
  for (const p of pagos) {
    if (p.status && p.status !== 'CONFIRMED') continue;
    saldo[p.method] = (saldo[p.method] ?? 0) + (p.kind === 'REFUND' ? -p.amount : p.amount);
  }
  return Object.fromEntries(Object.entries(saldo).filter(([, monto]) => monto > 0.009));
}

export function motivoDelError(err: unknown): string {
  const m = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(m)) return m.join('. ');
  return typeof m === 'string' ? m : 'No se pudo completar. Probá de nuevo.';
}

interface Props {
  pedido: { id: string; number?: string; payments?: PagoPedido[] };
  cashSessionId?: string;
  abierto: boolean;
  onCerrar: () => void;
  onCancelada: () => void;
}

/** Cancelar una venta: motivo, y si se cobró por Mercado Pago, la referencia del reintegro hecho allá. */
export function CancelarVenta({ pedido, cashSessionId, abierto, onCerrar, onCancelada }: Props) {
  const saldos = saldoPorMedio(pedido.payments);
  const cobradoMp = saldos.MERCADOPAGO ?? 0;
  const esquema = z.object({
    reason: z.string().trim().min(3, 'Escribí el motivo (lo ve el equipo y queda registrado)').max(500),
    referencia: cobradoMp > 0 ? z.string().trim().min(3, 'Cargá la referencia del reintegro de Mercado Pago').max(120) : z.string().optional(),
  });
  type Datos = z.infer<typeof esquema>;
  const form = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: { reason: '', referencia: '' } });
  const [error, setError] = useState('');

  const confirmar = async (datos: Datos) => {
    setError('');
    try {
      await api.post('/pos/orders/' + pedido.id + '/cancel', {
        reason: datos.reason, cashSessionId, mercadoPagoReference: cobradoMp > 0 ? datos.referencia : undefined,
      });
      onCancelada();
    } catch (err) {
      setError(motivoDelError(err));
    }
  };

  const reintegros = Object.entries(saldos).map(([medio, monto]) => formatPrice(monto) + ' por ' + (MEDIOS[medio] ?? medio));
  return (
    <Modal isOpen={abierto} onClose={onCerrar} title={'Cancelar venta' + (pedido.number ? ' ' + pedido.number : '')} size="sm">
      <form onSubmit={form.handleSubmit(confirmar)} className="space-y-4 text-sm">
        <ul className="list-disc space-y-1 pl-5 text-gray-600">
          <li>El stock de los productos vuelve al inventario.</li>
          <li>{reintegros.length ? 'Se registra el reintegro de ' + reintegros.join(' y ') + '.' : 'No hay cobros para reintegrar.'}</li>
          <li>Al cliente le llega un mail avisando que se canceló.</li>
        </ul>
        {cobradoMp > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <p className="font-semibold">Se cobró {formatPrice(cobradoMp)} por Mercado Pago.</p>
            <p className="mt-1">Primero devolvé el dinero desde Mercado Pago (Actividad → el pago → Devolver dinero). Después pegá acá el número de operación del reintegro.</p>
            <input {...form.register('referencia')} placeholder="Número de operación del reintegro" className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2" />
            {form.formState.errors.referencia && <p className="mt-1 text-xs text-red-600">{form.formState.errors.referencia.message}</p>}
          </div>
        )}
        <label className="block">
          <span className="font-medium text-gray-800">Motivo</span>
          <textarea {...form.register('reason')} rows={2} placeholder="Ej: el cliente se arrepintió, sin stock" className="mt-1 w-full rounded-lg border px-2.5 py-2" />
          {form.formState.errors.reason && <span className="text-xs text-red-600">{form.formState.errors.reason.message}</span>}
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCerrar} className="rounded-lg border px-3 py-2 font-medium text-gray-700">Volver</button>
          <button type="submit" disabled={form.formState.isSubmitting} className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white disabled:opacity-50">
            {form.formState.isSubmitting ? 'Cancelando...' : 'Cancelar venta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
