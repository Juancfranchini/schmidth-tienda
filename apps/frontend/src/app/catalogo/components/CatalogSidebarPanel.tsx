'use client';

import { Category, Brand } from '@/types';
import { SORT_OPTIONS } from '../sortOptions';
import CatalogCheckboxOption from './CatalogCheckboxOption';
import CatalogAttributeSelect from './CatalogAttributeSelect';
import CatalogPriceRange from './CatalogPriceRange';
import CatalogColorOptions from './CatalogColorOptions';
import { valoresDe } from '../catalogQuery';

export type ActivePanel = 'categories' | 'brands' | 'attributes' | 'price' | 'sort' | null;

export interface PanelProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  selectedBrand: string;
  isOffer: boolean;
  currentSort: string;
  onSortChange: (value: string) => void;
  onCategoryChange: (slug: string | null) => void;
  onBrandChange: (slug: string | null) => void;
  onOfferChange: (v: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
  sizes: string[];
  colors: string[];
  /** Tono de cada color, para la muestra. */
  colorHex?: Record<string, string>;
  weights: string[];
  selectedSize: string;
  selectedColor: string;
  selectedWeight: string;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  onSizeChange: (value: string | null) => void;
  onColorChange: (value: string | null) => void;
  onWeightChange: (value: string | null) => void;
}

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

/**
 * Atributo de varios valores (género, formato, nivel, talle, color): casillas
 * que se combinan, en vez de un desplegable que dejaba elegir uno solo.
 */
function OpcionesMultiples({ label, seleccion, opciones, onToggle }: {
  label: string; seleccion: string; opciones: { value: string; label: string }[]; onToggle: (valor: string) => void;
}) {
  const elegidos = valoresDe(seleccion);
  return (
    <div>
      <p className="rotulo mb-3 !text-[10px] text-fg-muted">{label}</p>
      <div className="space-y-3">
        {opciones.map((o) => (
          <CatalogCheckboxOption key={o.value} label={o.label} checked={elegidos.includes(o.value)} onChange={() => onToggle(o.value)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Contenido de una sección de filtros de la barra lateral.
 *
 * Se renderiza dentro de la barra, debajo del control que la abre. Antes vivía
 * en un panel flotante con su propia capa y su botón de cerrar, que se
 * superponía al listado y lo empujaba a la derecha.
 *
 * Los atributos van agrupados en una sola sección. Antes estaban repartidos por
 * criterios que no se sostenían —formato y talle colgaban de "Categorías",
 * color y peso de "Marcas"—, así que encontrarlos dependía de adivinar.
 */
export default function CatalogSidebarPanel(props: PanelProps & { activePanel: ActivePanel }) {
  const { activePanel } = props;
  if (activePanel === 'categories') return <CategoriesSection {...props} />;
  if (activePanel === 'brands') return <BrandsSection {...props} />;
  if (activePanel === 'attributes') return <AttributesSection {...props} />;
  if (activePanel === 'price') return <CatalogPriceRange minPrice={props.minPrice} maxPrice={props.maxPrice} onChange={props.onPriceChange} />;
  if (activePanel === 'sort') return <SortSection {...props} />;
  return null;
}

function CategoriesSection({ categories, selectedCategory, onCategoryChange }: PanelProps) {
  return (
    <div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <CatalogCheckboxOption
            key={cat.id}
            label={cat.name}
            checked={valoresDe(selectedCategory).includes(cat.slug)}
            onChange={() => onCategoryChange(cat.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function BrandsSection({ brands, selectedBrand, onBrandChange }: PanelProps) {
  return (
    <div>
      <div className="space-y-3">
        {brands.map((brand) => (
          <CatalogCheckboxOption
            key={brand.id}
            label={brand.name.trim()}
            checked={valoresDe(selectedBrand).includes(brand.slug)}
            onChange={() => onBrandChange(brand.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function AttributesSection(props: PanelProps) {
  const { sizes, selectedSize, onSizeChange,
    colors, selectedColor, onColorChange, weights, selectedWeight, onWeightChange } = props;

  // Cada atributo se ofrece solo si algún producto lo tiene cargado: las
  // opciones salen de los datos. Un filtro fijo de valores
  // devolvería cero resultados hasta que se cargue.
  const hayAlguno = sizes.length > 0 || colors.length > 0 || weights.length > 0;

  if (!hayAlguno) {
    return (
      <div>
        <p className="font-display text-sm italic text-fg-muted">No hay opciones para esta selección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <OpcionesMultiples label="Talle" seleccion={selectedSize} opciones={toOptions(sizes)} onToggle={onSizeChange} />
      )}
      {colors.length > 0 && (
        <CatalogColorOptions colores={colors} hex={props.colorHex ?? {}} elegidos={valoresDe(selectedColor)} onToggle={onColorChange} />
      )}
      {weights.length > 0 && (
        <CatalogAttributeSelect label="Peso" value={selectedWeight} options={toOptions(weights)} onChange={onWeightChange} />
      )}
    </div>
  );
}

function SortSection({ currentSort, onSortChange }: PanelProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Ordenar por">
      {SORT_OPTIONS.map((opt) => {
        const activo = currentSort === opt.value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={activo} onClick={() => onSortChange(opt.value)} className="group flex w-full items-center gap-3 text-left">
            <span className={'flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full border transition-colors duration-300 ' + (activo ? 'border-bordo' : 'border-fg/35 group-hover:border-fg')}>
              <span className={'h-1.5 w-1.5 rounded-full bg-bordo transition-transform duration-300 ' + (activo ? 'scale-100' : 'scale-0')} />
            </span>
            <span className={'text-sm transition-colors ' + (activo ? 'text-fg' : 'text-fg-soft group-hover:text-fg')}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
