import Link from 'next/link';
import type { Product } from '@/types';
import { coloresDe } from '@/lib/colores';

interface ColorDeColeccion {
  nombre: string;
  hex: string | null;
  modelos: number;
}

/** Todos los colores de la colección, con cuántos modelos vienen en cada uno. */
function coloresDeColeccion(products: Product[]): ColorDeColeccion[] {
  const mapa = new Map<string, ColorDeColeccion>();
  for (const p of products) {
    for (const c of coloresDe(p)) {
      const previo = mapa.get(c.nombre);
      if (previo) previo.modelos += 1;
      else mapa.set(c.nombre, { nombre: c.nombre, hex: c.hex, modelos: 1 });
    }
  }
  return [...mapa.values()].sort((a, b) => b.modelos - a.modelos);
}

/**
 * Comprar por color: es como piensa quien busca una cartera ("una negra para
 * todos los días") y es el eje de la marca, que además hace cada modelo en
 * otros colores a pedido.
 */
export default function ColoresStrip({ products }: { products: Product[] }) {
  const colores = coloresDeColeccion(products);
  if (colores.length === 0) return null;
  return (
    <section id="colores" className="scroll-mt-24 border-y border-line bg-night">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="rotulo mb-3 text-bordo">Elegí tu color</p>
          <h2 className="text-4xl sm:text-5xl">Primero el color, después el modelo</h2>
        </div>
        <ul className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-5">
          {colores.map((c) => (
            <li key={c.nombre} className="border-b border-r border-line">
              <Link href={'/catalogo?color=' + encodeURIComponent(c.nombre)} className="group flex flex-col gap-5 p-5 transition-colors hover:bg-page sm:p-6">
                <span className="block aspect-square w-full rounded-full border border-fg/10 transition-transform duration-500 group-hover:scale-[0.94]" style={{ backgroundColor: c.hex ?? undefined }} />
                <span>
                  <span className="block font-display text-2xl text-fg">{c.nombre}</span>
                  <span className="text-xs text-fg-muted">{c.modelos === 1 ? '1 modelo' : c.modelos + ' modelos'}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
