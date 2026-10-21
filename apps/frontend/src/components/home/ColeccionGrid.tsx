import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { MARCA } from '@/config/marca';
import TituloEditorial from './TituloEditorial';
import Revelar from './Revelar';

/** "Elegí tu próxima favorita": la colección numerada, como piezas de una serie. */
export default function ColeccionGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <Revelar className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="rotulo mb-3 text-bordo">{MARCA.frases.ritmo}</p>
          <TituloEditorial texto="Elegí tu próxima *favorita*" className="text-4xl leading-tight sm:text-6xl" />
        </div>
        <Link href="/catalogo" style={{ '--barrido': 'rgb(var(--c-ink))' } as CSSProperties} className="barrido rotulo hidden shrink-0 items-center gap-2 border border-fg px-7 py-3 transition-colors duration-500 hover:text-on-accent sm:inline-flex">
          Ver todas <span aria-hidden>→</span>
        </Link>
      </Revelar>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-5 xl:gap-x-5">
        {products.map((p, i) => <Revelar key={p.id} retardo={(i % 5) * 110}><ProductCard product={p} numero={i + 1} /></Revelar>)}
      </div>
      <Link href="/catalogo" className="rotulo mt-10 block border border-fg py-4 text-center transition-colors hover:bg-ink hover:text-on-accent sm:hidden">
        Ver todas
      </Link>
    </section>
  );
}
