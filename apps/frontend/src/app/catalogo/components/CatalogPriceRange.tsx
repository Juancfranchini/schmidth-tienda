'use client';

import { useEffect, useState } from 'react';

interface Props {
  minPrice: number | null;
  maxPrice: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

const input = 'w-full border-0 border-b border-fg/30 bg-transparent px-0 py-1.5 text-sm text-fg placeholder-fg-muted transition-colors focus:border-bordo focus:outline-none focus:ring-0';

const aNumero = (texto: string): number | null => {
  const limpio = texto.replace(/\D/g, '');
  return limpio ? Number(limpio) : null;
};

/**
 * Rango de precio sobre lo que paga el cliente (con la oferta aplicada, igual
 * que el backend). Se aplica con el botón, no a cada tecla: si no, cada
 * número que se escribe dispararía una búsqueda.
 */
export default function CatalogPriceRange({ minPrice, maxPrice, onChange }: Props) {
  const [desde, setDesde] = useState(minPrice?.toString() ?? '');
  const [hasta, setHasta] = useState(maxPrice?.toString() ?? '');

  // Si el filtro cambia desde afuera (un chip que se quita, "limpiar filtros"), los campos acompañan.
  useEffect(() => { setDesde(minPrice?.toString() ?? ''); }, [minPrice]);
  useEffect(() => { setHasta(maxPrice?.toString() ?? ''); }, [maxPrice]);

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault();
    let min = aNumero(desde);
    let max = aNumero(hasta);
    if (min != null && max != null && min > max) [min, max] = [max, min];
    onChange(min, max);
  };

  const hayFiltro = minPrice != null || maxPrice != null;

  return (
    <form onSubmit={aplicar} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="rotulo !text-[10px] text-fg-muted">
          Desde
          <input value={desde} onChange={(e) => setDesde(e.target.value)} inputMode="numeric" placeholder="$ mín." className={input + ' mt-1'} aria-label="Precio mínimo" />
        </label>
        <label className="rotulo !text-[10px] text-fg-muted">
          Hasta
          <input value={hasta} onChange={(e) => setHasta(e.target.value)} inputMode="numeric" placeholder="$ máx." className={input + ' mt-1'} aria-label="Precio máximo" />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="barrido rotulo flex-1 bg-ink py-2.5 !text-[10px] text-on-accent">
          Aplicar
        </button>
        {hayFiltro && (
          <button type="button" onClick={() => onChange(null, null)} className="subrayado rotulo px-1 !text-[10px] text-fg-soft hover:text-fg">
            Quitar
          </button>
        )}
      </div>
    </form>
  );
}
