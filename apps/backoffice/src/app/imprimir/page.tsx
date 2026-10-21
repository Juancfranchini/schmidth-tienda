'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Pedido } from '../(dashboard)/pedidos/tipos';
import { Remito } from './Remito';

/**
 * Remitos para imprimir: /imprimir?ids=a,b,c. Queda fuera del layout del
 * panel para que la hoja salga limpia; cada pedido va en una página.
 */
export default function ImprimirPage() {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ids = (new URLSearchParams(window.location.search).get('ids') || '').split(',').filter(Boolean);
    if (ids.length === 0) { setError('No se eligió ningún pedido.'); return; }
    api.get('/orders')
      .then((res) => {
        const data = res.data?.value || res.data?.data || res.data;
        const todos: Pedido[] = Array.isArray(data) ? data : [];
        const elegidos = ids.map((id) => todos.find((p) => p.id === id)).filter((p): p is Pedido => Boolean(p));
        if (elegidos.length === 0) setError('No se encontraron los pedidos.');
        setPedidos(elegidos);
      })
      .catch(() => setError('No se pudieron cargar los pedidos.'));
  }, []);

  // Con todo dibujado se abre el diálogo de impresión del navegador.
  useEffect(() => {
    if (pedidos && pedidos.length > 0) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [pedidos]);

  if (error) return <p className="p-8 text-center text-sm text-gray-600">{error}</p>;
  if (!pedidos) return <p className="p-8 text-center text-sm text-gray-500">Preparando remitos…</p>;

  return (
    <main className="space-y-6 bg-gray-100 py-6 print:space-y-0 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-[720px] items-center justify-between print:hidden">
        <p className="text-sm text-gray-600">{pedidos.length === 1 ? '1 remito' : pedidos.length + ' remitos'}</p>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">Imprimir</button>
      </div>
      {pedidos.map((p) => <Remito key={p.id} pedido={p} />)}
      <style>{'@media print { .remito { break-after: page; } .remito:last-child { break-after: auto; } }'}</style>
    </main>
  );
}
