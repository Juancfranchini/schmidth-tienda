'use client';

/**
 * Colores como muestras: así se elige una cartera. La elegida lleva un aro
 * bordó fino alrededor; el nombre va debajo.
 */
export default function CatalogColorOptions({ colores, hex, elegidos, onToggle }: {
  colores: string[]; hex: Record<string, string>; elegidos: string[]; onToggle: (color: string) => void;
}) {
  return (
    <ul className="grid grid-cols-5 gap-x-1 gap-y-4">
      {colores.map((c) => {
        const activo = elegidos.includes(c);
        return (
          <li key={c}>
            <button type="button" onClick={() => onToggle(c)} aria-pressed={activo} className="group flex w-full flex-col items-center gap-2">
              <span className={'block rounded-full p-[3px] ring-1 transition-all duration-300 ' + (activo ? 'ring-bordo' : 'ring-transparent group-hover:ring-fg/30')}>
                <span className="block h-6 w-6 rounded-full border border-fg/10" style={{ backgroundColor: hex[c] ?? 'rgb(var(--c-chip))' }} />
              </span>
              <span className={'text-center text-[11px] leading-tight transition-colors ' + (activo ? 'text-bordo' : 'text-fg-soft group-hover:text-fg')}>{c}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
