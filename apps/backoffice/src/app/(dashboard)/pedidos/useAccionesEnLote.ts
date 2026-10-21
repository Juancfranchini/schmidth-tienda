'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { motivoDelError } from './CancelarVenta';
import type { EstadoEnLote } from './AccionesMasivas';
import type { Pedido } from './tipos';

/** Selección de pedidos de la lista y los cambios de estado en lote. */
export function useAccionesEnLote(pedidos: Pedido[], recargar: () => Promise<void>) {
  const { toast } = useToast();
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  const [enLote, setEnLote] = useState(false);

  const elegir = (ids: string[], marcar: boolean) => setElegidos((antes) => {
    const nuevos = new Set(antes);
    for (const id of ids) { if (marcar) nuevos.add(id); else nuevos.delete(id); }
    return nuevos;
  });
  const limpiar = () => setElegidos(new Set());

  /** De a uno, para que un rechazo no frene al resto; al final un solo aviso con el resultado. */
  const aplicarEnLote = async (lista: Pedido[], estado: EstadoEnLote) => {
    setEnLote(true);
    const fallidos: string[] = [];
    for (const p of lista) {
      try {
        await api.patch('/orders/' + p.id + '/status', { status: estado });
      } catch (err) {
        fallidos.push('#' + p.number + ': ' + motivoDelError(err));
      }
    }
    await recargar();
    setEnLote(false);
    limpiar();
    const bien = lista.length - fallidos.length;
    if (fallidos.length === 0) toast(bien + (bien === 1 ? ' pedido actualizado' : ' pedidos actualizados'), 'success');
    else toast(bien + ' actualizados, ' + fallidos.length + ' con error. ' + fallidos.join(' · '), 'error');
  };

  return { elegidos, elegir, limpiar, enLote, aplicarEnLote, seleccion: pedidos.filter((p) => elegidos.has(p.id)) };
}
