'use client';

interface Props {
  label: string;
  checked: boolean;
  onChange: () => void;
}

/** Opción de filtro: casilla chica de trazo fino que se rellena en bordó. */
export default function CatalogCheckboxOption({ label, checked, onChange }: Props) {
  return (
    <label className="group flex cursor-pointer items-center gap-3">
      <span className={'flex h-3.5 w-3.5 flex-none items-center justify-center border transition-colors duration-300 ' +
        (checked ? 'border-bordo bg-bordo' : 'border-fg/35 group-hover:border-fg')}>
        {checked && <svg width="8" height="6" viewBox="0 0 10 8" fill="none" aria-hidden><path d="M1 4l2.5 2.5L9 1" stroke="rgb(var(--c-page))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      </span>
      <span className={'truncate text-sm transition-colors ' + (checked ? 'text-fg' : 'text-fg-soft group-hover:text-fg')}>{label}</span>
    </label>
  );
}
