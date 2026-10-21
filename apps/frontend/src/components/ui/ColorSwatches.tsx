import type { ColorDeProducto } from '@/lib/colores';

interface Props {
  colores: ColorDeProducto[];
  activo?: string | null;
  /** Al pasar o tocar una muestra; sin esto las muestras son solo informativas. */
  onElegir?: (color: ColorDeProducto) => void;
  tamanio?: 'sm' | 'md';
}

/**
 * Círculos de color. Cada uno lleva el nombre (title y aria-label): el color
 * en pantalla puede variar según el monitor, el nombre no. Un color sin stock
 * se muestra tachado, porque se puede pedir igual (a pedido) pero no sale ya.
 */
export default function ColorSwatches({ colores, activo, onElegir, tamanio = 'sm' }: Props) {
  if (colores.length === 0) return null;
  const medida = tamanio === 'sm' ? 'h-4 w-4' : 'h-7 w-7';
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Colores disponibles">
      {colores.map((color) => {
        const elegido = activo === color.nombre;
        const etiqueta = color.nombre + (color.stock > 0 ? '' : ' (a pedido)');
        const muestra = (
          <span
            className={'relative block rounded-full border border-fg/20 ' + medida + (color.stock > 0 ? '' : ' opacity-60')}
            style={{ backgroundColor: color.hex ?? undefined }}
          >
            {color.stock <= 0 && <span className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-fg/60" />}
          </span>
        );
        return (
          <li key={color.nombre}>
            {onElegir ? (
              <button
                type="button"
                title={etiqueta}
                aria-label={etiqueta}
                aria-pressed={elegido}
                onMouseEnter={() => onElegir(color)}
                onFocus={() => onElegir(color)}
                onClick={() => onElegir(color)}
                className={'block rounded-full p-0.5 ring-1 transition-shadow ' + (elegido ? 'ring-fg' : 'ring-transparent hover:ring-fg/40')}
              >
                {muestra}
              </button>
            ) : (
              <span title={etiqueta} aria-label={etiqueta} className="block p-0.5">{muestra}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
