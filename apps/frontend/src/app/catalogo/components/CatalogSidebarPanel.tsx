'use client';

import { Category, Brand } from '@/types';
import { SORT_OPTIONS } from '../sortOptions';
import CatalogCheckboxOption from './CatalogCheckboxOption';
import CatalogAttributeSelect from './CatalogAttributeSelect';
import CatalogPriceRange from './CatalogPriceRange';
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg">{label}</p>
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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
        <p className="text-xs text-fg-muted">No hay atributos para filtrar en esta selección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <OpcionesMultiples label="Talle" seleccion={selectedSize} opciones={toOptions(sizes)} onToggle={onSizeChange} />
      )}
      {colors.length > 0 && (
        <OpcionesMultiples label="Color" seleccion={selectedColor} opciones={toOptions(colors)} onToggle={onColorChange} />
      )}
      {weights.length > 0 && (
        <CatalogAttributeSelect label="Peso" value={selectedWeight} options={toOptions(weights)} onChange={onWeightChange} />
      )}
    </div>
  );
}

function SortSection({ currentSort, onSortChange }: PanelProps) {
  return (
    <div>
      <div className="space-y-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ' +
              (currentSort === opt.value
                ? 'bg-accent/5 text-brand-fg'
                : 'text-fg-soft hover:bg-fg/[0.04] hover:text-fg')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
