import { X } from 'lucide-react';

interface Chip {
  label: string;
  onRemove: () => void;
}

interface Props {
  chips: Chip[];
  onClearAll: () => void;
}

/** Filtros aplicados, como etiquetas finas. Todo el chip quita el filtro (la X sola era difícil de tocar en el celular). */
export default function CatalogChips({ chips, onClearAll }: Props) {
  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          aria-label={'Quitar filtro ' + chip.label}
          className="group flex items-center gap-2 border border-fg/20 px-3 py-1.5 text-xs text-fg transition-colors duration-300 hover:border-bordo hover:text-bordo"
        >
          <span className="font-display italic">{chip.label}</span>
          <X size={11} strokeWidth={1.5} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90" />
        </button>
      ))}
      <button type="button" onClick={onClearAll} className="subrayado rotulo ml-2 !text-[10px] text-fg-muted hover:text-fg">
        Limpiar todo
      </button>
    </div>
  );
}
