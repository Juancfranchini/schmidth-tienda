interface Props {
  label: string;
  /** Filtro aplicado hoy. Se muestra debajo del nombre, en cursiva, cuando existe. */
  value?: string;
  /** Presente solo en los controles que despliegan contenido debajo. */
  expanded?: boolean;
  /** Para controles de dos estados, como Ofertas: se dibuja un interruptor. */
  pressed?: boolean;
  onClick: () => void;
}

/**
 * Control de la barra de filtros: el nombre en rótulo espaciado y, si hay un
 * filtro puesto, su valor debajo en cursiva bordó, para verlo sin abrir la
 * sección. A la derecha, un "+" fino que se vuelve "−" al abrir, o un
 * interruptor para los sí/no.
 */
export default function CatalogSidebarButton({ label, value, expanded, onClick, pressed }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-expanded={expanded}
      className="group flex w-full items-center justify-between gap-4 py-4 text-left"
    >
      <span className="min-w-0">
        <span className="rotulo block text-fg transition-colors group-hover:text-bordo">{label}</span>
        {value && <span className="mt-1 block truncate font-display text-[0.95rem] italic text-bordo" title={value}>{value}</span>}
      </span>
      {expanded !== undefined && (
        <span aria-hidden className="relative h-3 w-3 flex-shrink-0 text-fg-muted transition-colors group-hover:text-fg">
          <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
          <span className={'absolute left-1/2 top-0 h-3 w-px bg-current transition-transform duration-500 ' + (expanded ? 'scale-y-0' : 'scale-y-100')} />
        </span>
      )}
      {pressed !== undefined && (
        <span aria-hidden className={'relative h-4 w-7 flex-shrink-0 rounded-full border transition-colors duration-300 ' + (pressed ? 'border-bordo bg-bordo' : 'border-fg/30')}>
          <span className={'absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full transition-all duration-300 ' + (pressed ? 'left-[0.9rem] bg-page' : 'left-0.5 bg-fg/40')} />
        </span>
      )}
    </button>
  );
}
