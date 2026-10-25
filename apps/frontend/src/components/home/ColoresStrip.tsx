import Link from 'next/link';
import type { Product } from '@/types';
import { coloresDe } from '@/lib/colores';
import TituloEditorial from './TituloEditorial';
import Revelar from './Revelar';
import Inclinar from './Inclinar';

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
    <section id="colores" className="scroll-mt-24 bg-ink text-on-accent">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <Revelar className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="rotulo mb-4 text-rosado">Elegí tu color</p>
            <TituloEditorial claro texto="Primero el *color*, después el modelo" className="text-4xl leading-tight sm:text-6xl" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-on-accent/70">¿No está el que buscás? Cada modelo se puede hacer a pedido en otros colores.</p>
        </Revelar>
        <ul className="flex snap-x gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5 lg:gap-6">
          {colores.map((c, i) => (
            <li key={c.nombre} className="w-40 shrink-0 snap-start sm:w-auto">
              <Revelar retardo={i * 90}>
              <Link href={'/catalogo?color=' + encodeURIComponent(c.nombre)} className="group block">
                <Inclinar max={9} brillo className="relative">
                <span className="relative block aspect-[3/4] w-full overflow-hidden ring-1 ring-on-accent/15 transition-transform duration-700 ease-out group-hover:-translate-y-2" style={{ backgroundColor: c.hex ?? undefined }}>
                  <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" aria-hidden />
                  <span className="absolute inset-3 border border-white/0 transition-colors duration-700 group-hover:border-white/40" aria-hidden />
                  <span className="rotulo absolute inset-x-0 bottom-6 text-center !text-[10px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ color: esClaro(c.hex) ? '#1A1A1A' : '#F7F5EF' }}>Ver modelos</span>
                </span>
                </Inclinar>
                <span className="mt-4 block font-display text-2xl italic">{c.nombre}</span>
                <span className="block text-xs text-on-accent/60">{c.modelos === 1 ? '1 modelo' : c.modelos + ' modelos'}</span>
              </Link>
              </Revelar>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Para escribir sobre la muestra: texto oscuro en los colores claros. */
function esClaro(hex: string | null): boolean {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
