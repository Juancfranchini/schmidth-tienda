import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  /** Filtro de color activo (?color=Negro,Camel): las tarjetas muestran esa foto. */
  colorFiltrado?: string;
}

export default function CatalogGrid({ products, onAddToCart, colorFiltrado }: Props) {
  const colores = (colorFiltrado ?? '').split(',').map((c) => c.trim()).filter(Boolean);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} coloresPreferidos={colores} />
      ))}
    </div>
  );
}