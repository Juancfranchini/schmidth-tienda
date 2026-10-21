'use client';

import Link from 'next/link';
import CatalogSearch from './CatalogSearch';

interface Props {
  pageTitle: string;
  loading: boolean;
  totalCount: number;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

/** Encabezado del catálogo: miga de pan en rótulo, el título en Playfair y el buscador en una línea fina. */
export default function CatalogHeader({ pageTitle, loading, totalCount, searchInput, onSearchInputChange, onSearchSubmit }: Props) {
  return (
    <div className="border-b border-line bg-page">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-8 sm:px-8 lg:pb-10 lg:pt-12">
        <p className="rotulo mb-4 !text-[10px] text-fg-muted">
          <Link href="/" className="transition-colors hover:text-bordo">Inicio</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-fg">{pageTitle}</span>
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl leading-none text-fg sm:text-5xl">{pageTitle}</h1>
            {!loading && (
              <p className="mt-3 font-display text-base italic text-fg-soft">
                {totalCount === 1 ? '1 modelo' : totalCount + ' modelos'} para elegir
              </p>
            )}
          </div>
          <CatalogSearch value={searchInput} onChange={onSearchInputChange} onSubmit={onSearchSubmit} />
        </div>
      </div>
    </div>
  );
}
