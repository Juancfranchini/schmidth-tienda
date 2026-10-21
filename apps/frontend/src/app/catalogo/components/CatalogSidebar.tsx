'use client';

import { useState, useEffect } from 'react';
import { Grid2x2, Rows3 } from 'lucide-react';
import { Category, Brand } from '@/types';
import { formatPrice } from '@/lib/utils';
import { sortLabel } from '../sortOptions';
import { valoresDe } from '../catalogQuery';
import CatalogSidebarPanel, { ActivePanel, PanelProps } from './CatalogSidebarPanel';
import CatalogSidebarButton from './CatalogSidebarButton';
import CatalogSidebarSection from './CatalogSidebarSection';

type Seccion = Exclude<ActivePanel, null>;

interface Props extends PanelProps {
  categories: Category[];
  brands: Brand[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

/**
 * Barra de filtros del catálogo, con la estética de la marca: secciones
 * separadas por líneas finas, nombres en rótulo espaciado y lo elegido en
 * cursiva bordó. Varias secciones pueden quedar abiertas a la vez (combinar
 * categoría y color —"totes" en "negro"— es el caso corriente).
 */
export default function CatalogSidebar(props: Props) {
  const {
    viewMode, onViewModeChange, categories, brands, hasFilters, onClear,
    selectedCategory, selectedBrand, selectedSize, selectedColor, selectedWeight,
    minPrice, maxPrice, isOffer, onOfferChange, currentSort, sizes, weights,
  } = props;

  // Categoría y color arrancan abiertos: son los dos filtros con los que se busca una cartera.
  const [abiertas, setAbiertas] = useState<Seccion[]>(['categories', 'attributes']);
  const alternar = (s: Seccion) =>
    setAbiertas((actuales) => (actuales.includes(s) ? actuales.filter((x) => x !== s) : [...actuales, s]));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbiertas([]); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // El valor vigente se muestra debajo de cada nombre: qué filtro está puesto, sin abrir la sección.
  const nombres = (seleccion: string, lista: { slug: string; name: string }[]) =>
    valoresDe(seleccion).map((slug) => lista.find((x) => x.slug === slug)?.name.trim() ?? slug).join(', ') || undefined;
  const atributos = [valoresDe(selectedSize).join(', '), valoresDe(selectedColor).join(', '), selectedWeight].filter(Boolean);
  const rangoPrecio = minPrice != null || maxPrice != null
    ? [minPrice != null ? formatPrice(minPrice) : '$0', maxPrice != null ? formatPrice(maxPrice) : 'sin tope'].join(' – ')
    : undefined;
  // En una tienda de carteras los atributos son, en la práctica, el color.
  const soloColor = sizes.length === 0 && weights.length === 0;

  const seccion = (clave: Seccion, label: string, value?: string) => (
    <CatalogSidebarSection label={label} value={value} open={abiertas.includes(clave)} onToggle={() => alternar(clave)}>
      <CatalogSidebarPanel {...props} activePanel={clave} />
    </CatalogSidebarSection>
  );

  return (
    <div className="flex w-60 flex-col">
      <div className="flex items-baseline justify-between border-b border-fg pb-3">
        <h2 className="font-display text-2xl italic text-fg">Filtrar</h2>
        {hasFilters && (
          <button type="button" onClick={onClear} className="subrayado rotulo !text-[10px] text-bordo">Limpiar</button>
        )}
      </div>
      {seccion('categories', 'Categoría', nombres(selectedCategory, categories))}
      {seccion('attributes', soloColor ? 'Color' : 'Atributos', atributos.length > 0 ? atributos.join(' · ') : undefined)}
      {/* Con una sola marca (la tienda propia) el filtro no aporta nada. */}
      {brands.length > 1 && seccion('brands', 'Marca', nombres(selectedBrand, brands))}
      {seccion('price', 'Precio', rangoPrecio)}
      {seccion('sort', 'Ordenar por', sortLabel(currentSort))}
      <div className="border-b border-line">
        <CatalogSidebarButton label="Solo ofertas" pressed={isOffer} onClick={() => onOfferChange(!isOffer)} />
      </div>

      <div className="flex items-center justify-between pt-5">
        <span className="rotulo !text-[10px] text-fg-muted">Vista</span>
        <div className="flex gap-1">
          {([['grid', Grid2x2, 'Ver en grilla'], ['list', Rows3, 'Ver en lista']] as const).map(([modo, Icono, texto]) => (
            <button key={modo} type="button" onClick={() => onViewModeChange(modo)} aria-label={texto} aria-pressed={viewMode === modo} title={texto}
              className={'flex h-8 w-8 items-center justify-center border transition-colors duration-300 ' + (viewMode === modo ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg')}>
              <Icono size={15} strokeWidth={1.25} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
