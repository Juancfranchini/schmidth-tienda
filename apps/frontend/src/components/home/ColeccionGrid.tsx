import Link from 'next/link';
import type { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

/** "Elegí tu próxima favorita": la colección numerada, como piezas de una serie. */
export default function ColeccionGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="rotulo mb-3 text-bordo">La colección</p>
          <h2 className="text-4xl sm:text-5xl">Elegí tu próxima favorita</h2>
        </div>
        <Link href="/catalogo" className="rotulo hidden shrink-0 border-b border-fg pb-1 transition-colors hover:border-bordo hover:text-bordo sm:block">
          Ver todas
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-5 xl:gap-x-5">
        {products.map((p, i) => <ProductCard key={p.id} product={p} numero={i + 1} />)}
      </div>
      <Link href="/catalogo" className="rotulo mt-10 block border border-fg py-4 text-center transition-colors hover:bg-ink hover:text-on-accent sm:hidden">
        Ver todas
      </Link>
    </section>
  );
}
