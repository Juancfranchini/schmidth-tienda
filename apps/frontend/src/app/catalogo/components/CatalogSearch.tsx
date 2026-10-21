'use client';

import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Buscador del catálogo: una línea fina con la lupa, se envía con Enter o con la flecha. */
export default function CatalogSearch({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="group flex w-full items-center gap-3 border-b border-fg/30 pb-2 transition-colors focus-within:border-bordo sm:w-72">
      <Search className="h-4 w-4 flex-shrink-0 text-fg-muted" strokeWidth={1.5} aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar productos"
        placeholder="Buscar una cartera"
        className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder-fg-muted focus:outline-none"
      />
      <button type="submit" aria-label="Buscar" className="text-fg-muted transition-all duration-300 hover:translate-x-0.5 hover:text-bordo">→</button>
    </form>
  );
}
