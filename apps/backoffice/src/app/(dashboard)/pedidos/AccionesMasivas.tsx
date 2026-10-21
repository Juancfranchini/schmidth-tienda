'use client';

import { useState } from 'react';
import { Download, Printer, Truck, PackageCheck, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Pedido } from './tipos';
import { estadoDeEntrega, estadoDelPago, fechaCorta, formaDeEntrega, mailCliente, nombreCliente } from './formato';

export type EstadoEnLote = 'SHIPPED' | 'DELIVERED';

/**
 * Qué pedidos de la selección aceptan el cambio. En lote solo se avanzan
 * pedidos ya cobrados: marcar pagado se hace de a uno, mirando el cobro.
 */
export function aplicables(pedidos: Pedido[], estado: EstadoEnLote): Pedido[] {
  if (estado === 'SHIPPED') return pedidos.filter((p) => p.status === 'PAID' && !formaDeEntrega(p).esRetiro);
  return pedidos.filter((p) => p.status === 'PAID' || p.status === 'SHIPPED');
}

const celda = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';

/** CSV con punto y coma y BOM: Excel en castellano lo abre bien con acentos. */
export function csvDePedidos(pedidos: Pedido[]): string {
  const encabezado = ['Pedido', 'Fecha', 'Cliente', 'Mail', 'Teléfono', 'Total', 'Pago', 'Entrega', 'Forma de entrega', 'Dirección'];
  const filas = pedidos.map((p) => [
    p.number, fechaCorta(p.createdAt), nombreCliente(p), mailCliente(p), p.buyerPhone || '', p.total,
    estadoDelPago(p).texto, estadoDeEntrega(p).texto, formaDeEntrega(p).texto, p.address || '',
  ]);
  return '﻿' + [encabezado, ...filas].map((f) => f.map(celda).join(';')).join('\r\n');
}

function descargarCsv(pedidos: Pedido[]) {
  const url = URL.createObjectURL(new Blob([csvDePedidos(pedidos)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedidos-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const TEXTOS: Record<EstadoEnLote, { titulo: string; aviso: string }> = {
  SHIPPED: { titulo: 'Marcar como enviados', aviso: 'A cada cliente le llega un mail de que su pedido va en camino (sin número de seguimiento).' },
  DELIVERED: { titulo: 'Marcar como entregados', aviso: 'Quedan como entregados o retirados.' },
};

const BOTON = 'flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-40';

export function AccionesMasivas({ seleccion, ocupado, onAplicar, onLimpiar }: {
  seleccion: Pedido[]; ocupado: boolean; onAplicar: (pedidos: Pedido[], estado: EstadoEnLote) => void; onLimpiar: () => void;
}) {
  const [confirmar, setConfirmar] = useState<EstadoEnLote | null>(null);
  if (seleccion.length === 0) return null;
  const listos = confirmar ? aplicables(seleccion, confirmar) : [];

  return (
    <>
      <div className="sticky bottom-4 z-20 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-3 shadow-lg">
        <p className="mr-auto text-sm font-semibold text-white">{seleccion.length} {seleccion.length === 1 ? 'pedido elegido' : 'pedidos elegidos'}</p>
        <button type="button" disabled={ocupado} onClick={() => setConfirmar('SHIPPED')} className={BOTON}><Truck className="h-4 w-4" /> Enviados</button>
        <button type="button" disabled={ocupado} onClick={() => setConfirmar('DELIVERED')} className={BOTON}><PackageCheck className="h-4 w-4" /> Entregados</button>
        <a href={'/imprimir?ids=' + seleccion.map((p) => p.id).join(',')} target="_blank" rel="noopener noreferrer" className={BOTON}><Printer className="h-4 w-4" /> Remitos</a>
        <button type="button" onClick={() => descargarCsv(seleccion)} className={BOTON}><Download className="h-4 w-4" /> CSV</button>
        <button type="button" onClick={onLimpiar} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" title="Quitar la selección"><X className="h-4 w-4" /></button>
      </div>

      {confirmar && (
        <Modal isOpen onClose={() => setConfirmar(null)} title={TEXTOS[confirmar].titulo} size="sm">
          <div className="space-y-3 p-5 text-sm text-gray-700">
            <p>Se van a actualizar <strong>{listos.length}</strong> de {seleccion.length} pedidos. {TEXTOS[confirmar].aviso}</p>
            {listos.length < seleccion.length && (
              <p className="text-xs text-gray-500">Los demás se saltean: sin cobrar, cancelados, ya entregados{confirmar === 'SHIPPED' ? ' o con retiro en el local' : ''}.</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setConfirmar(null)} className="rounded-lg border border-gray-200 px-3 py-2 font-medium">Volver</button>
              <button type="button" disabled={listos.length === 0} onClick={() => { onAplicar(listos, confirmar); setConfirmar(null); }}
                className="rounded-lg bg-[#1A1A1A] px-3 py-2 font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400">Confirmar</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
