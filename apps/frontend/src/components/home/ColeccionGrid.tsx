import Link from 'next/link';
import type { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { MARCA } from '@/config/marca';
import TituloEditorial from './TituloEditorial';

/** "Elegí tu próxima favorita": la colección numerada, como piezas de una serie. */
export default function ColeccionGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="rotulo mb-3 text-bordo">{MARCA.frases.ritmo}</p>
          <TituloEditorial texto="Elegí tu próxima *favorita*" className="text-4xl leading-tight sm:text-6xl" />
        </div>
        <Link href="/catalogo" className="rotulo hidden shrink-0 items-center gap-2 rounded-full border border-fg px-6 py-3 transition-colors hover:bg-ink hover:text-on-accent sm:inline-flex">
          Ver todas <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-5 xl:gap-x-5">
        {products.map((p, i) => <ProductCard key={p.id} product={p} numero={i + 1} />)}
      </div>
      <Link href="/catalogo" className="rotulo mt-10 block rounded-full border border-fg py-4 text-center transition-colors hover:bg-ink hover:text-on-accent sm:hidden">
        Ver todas
      </Link>
    </section>
  );
}
