import Link from 'next/link';
import { Copy } from 'lucide-react';
import { EstadoLink, LinkDePago } from './tipos';

const ESTADOS: Record<EstadoLink, { texto: string; color: string }> = {
  OPEN: { texto: 'Sin pagar', color: 'bg-amber-50 text-amber-700' },
  CHECKOUT: { texto: 'Pagando', color: 'bg-blue-50 text-blue-700' },
  CONVERTED: { texto: 'Pagado', color: 'bg-green-50 text-green-700' },
  EXPIRED: { texto: 'Vencido', color: 'bg-gray-100 text-gray-500' },
  CANCELLED: { texto: 'Cancelado', color: 'bg-gray-100 text-gray-500' },
};

/** Un link vigente puede figurar OPEN aunque ya venció: la fecha manda. */
function estadoReal(l: LinkDePago): EstadoLink {
  if ((l.status === 'OPEN' || l.status === 'CHECKOUT') && new Date(l.expiresAt) < new Date()) return 'EXPIRED';
  return l.status;
}

/** Los últimos links creados, con su estado y el pedido cuando se pagó. */
export default function LinksRecientes({ links }: { links: LinkDePago[] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">Links recientes</h2>
      {links.length === 0 ? <p className="text-sm text-gray-400">Todavía no creaste links.</p> : (
        <ul className="divide-y divide-gray-100">
          {links.slice(0, 15).map((l) => {
            const estado = ESTADOS[estadoReal(l)];
            const unidades = (l.items ?? []).reduce((s, i) => s + (i.quantity || 0), 0);
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + estado.color}>{estado.texto}</span>
                <span className="min-w-0 flex-1 truncate text-gray-700">
                  {l.customer?.name || 'Sin nombre'} · {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
                  <span className="text-gray-400"> · {new Date(l.createdAt).toLocaleDateString('es-AR')}</span>
                </span>
                {l.order ? (
                  <Link href={'/pedidos'} className="text-xs font-medium text-[#9E7149] hover:underline">Pedido {l.order.number}</Link>
                ) : (
                  <button type="button" onClick={() => navigator.clipboard.writeText(l.checkoutUrl).catch(() => undefined)}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50" title="Copiar link">
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
