import { Download, Search } from 'lucide-react';
import type { Filtros, Orden } from './tipos';
import { capitalizar } from './formato';

const ORDENES: { valor: Orden; texto: string }[] = [
  { valor: 'reciente', texto: 'Último movimiento' },
  { valor: 'gastado', texto: 'Más gastaron' },
  { valor: 'pedidos', texto: 'Más pedidos' },
  { valor: 'nombre', texto: 'Nombre (A-Z)' },
];

const CAMPO = 'rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40';

interface Props {
  filtros: Filtros;
  etiquetas: string[];
  exportando: boolean;
  onCambiar: (cambios: Partial<Filtros>) => void;
  onExportar: () => void;
}

export function CrmFiltros({ filtros, etiquetas, exportando, onCambiar, onExportar }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 lg:flex-row lg:items-center">
      <label className="relative block flex-1">
        <span className="sr-only">Buscar clientes</span>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={filtros.q} onChange={(e) => onCambiar({ q: e.target.value })} placeholder="Buscar por nombre, mail o teléfono"
          className={CAMPO + ' w-full pl-8'} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {etiquetas.length > 0 && (
          <select aria-label="Etiqueta" value={filtros.etiqueta} onChange={(e) => onCambiar({ etiqueta: e.target.value })} className={CAMPO}>
            <option value="">Todas las etiquetas</option>
            {etiquetas.map((t) => <option key={t} value={t}>{capitalizar(t)}</option>)}
          </select>
        )}
        <select aria-label="Ordenar" value={filtros.orden} onChange={(e) => onCambiar({ orden: e.target.value as Orden })} className={CAMPO}>
          {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="checkbox" checked={filtros.conAccionVencida} onChange={(e) => onCambiar({ conAccionVencida: e.target.checked })} />
          Para hacer hoy
        </label>
        <button type="button" onClick={onExportar} disabled={exportando}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <Download className="h-4 w-4" />{exportando ? 'Exportando...' : 'Exportar'}
        </button>
      </div>
    </div>
  );
}
