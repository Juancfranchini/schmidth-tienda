import { Search, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Producto, Variante, nombreVariante } from './tipos';

/** Buscador del catálogo: cada producto con sus variantes activas (colores) para sumar al link. */
export default function BuscadorProductos({ busqueda, onBusqueda, resultados, onAgregar }: {
  busqueda: string; onBusqueda: (t: string) => void; resultados: Producto[]; onAgregar: (p: Producto, v?: Variante) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Buscar productos</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={busqueda} onChange={(e) => onBusqueda(e.target.value)} placeholder="Buscar por nombre o SKU"
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-[#B3855C] focus:outline-none focus:ring-2 focus:ring-[#B3855C]/30" />
      </label>
      <ul className="max-h-[22rem] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
        {resultados.length === 0 && <li className="p-4 text-center text-sm text-gray-400">Sin resultados</li>}
        {resultados.map((p) => {
          const variantes = p.variants.filter((v) => v.active && !v.isDefault);
          return (
            <li key={p.id} className="flex items-start gap-3 p-3">
              {p.images[0] ? <img src={p.images[0]} alt="" className="h-12 w-12 shrink-0 rounded object-cover" /> : <span className="h-12 w-12 shrink-0 rounded bg-gray-100" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(p.effectivePrice)} · {p.sku}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {variantes.length === 0 ? (
                    <BotonAgregar texto="Agregar" onClick={() => onAgregar(p)} />
                  ) : variantes.map((v) => (
                    <BotonAgregar key={v.id} texto={nombreVariante(v) + (v.stock > 0 ? ' (' + v.stock + ')' : ' · a pedido')} onClick={() => onAgregar(p, v)} />
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BotonAgregar({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 transition-colors hover:border-[#B3855C] hover:bg-[#B3855C]/10">
      <Plus className="h-3 w-3" />{texto}
    </button>
  );
}
