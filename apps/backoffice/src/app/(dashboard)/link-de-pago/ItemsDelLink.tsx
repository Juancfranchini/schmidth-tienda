import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ItemDelLink, nombreVariante } from './tipos';

/** Productos elegidos para el link, con cantidades y el total estimado (el precio final lo calcula el servidor). */
export default function ItemsDelLink({ items, onCantidad }: { items: ItemDelLink[]; onCantidad: (clave: string, n: number) => void }) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">Buscá y agregá los productos que te pidieron.</p>;
  }
  const total = items.reduce((suma, i) => suma + i.producto.effectivePrice * i.cantidad, 0);
  const boton = 'flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50';
  return (
    <div className="rounded-lg border border-gray-200">
      <ul className="divide-y divide-gray-100">
        {items.map((i) => (
          <li key={i.clave} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{i.producto.name}</p>
              <p className="text-xs text-gray-500">{[nombreVariante(i.variante), formatPrice(i.producto.effectivePrice)].filter(Boolean).join(' · ')}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" className={boton} onClick={() => onCantidad(i.clave, i.cantidad - 1)} aria-label="Restar"><Minus className="h-3 w-3" /></button>
              <span className="w-6 text-center text-sm">{i.cantidad}</span>
              <button type="button" className={boton} onClick={() => onCantidad(i.clave, i.cantidad + 1)} aria-label="Sumar"><Plus className="h-3 w-3" /></button>
              <button type="button" className={boton + ' ml-1 text-red-500'} onClick={() => onCantidad(i.clave, 0)} aria-label="Quitar"><Trash2 className="h-3 w-3" /></button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2.5 text-sm">
        <span className="text-gray-500">Total estimado (sin envío)</span>
        <strong className="text-gray-900">{formatPrice(total)}</strong>
      </div>
    </div>
  );
}
