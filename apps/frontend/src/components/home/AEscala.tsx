import Link from 'next/link';
import type { Product } from '@/types';
import { medidasDe } from '@/lib/colores';
import SiluetaCartera from '@/components/ui/SiluetaCartera';
import TituloEditorial from './TituloEditorial';

const ESCALA = 4; // px por cm

/** Un celular de 15 × 7,5 cm como referencia de tamaño, dibujado a la misma escala. */
function Celular() {
  const w = 7.5 * ESCALA;
  const h = 15 * ESCALA;
  return (
    <figure className="flex shrink-0 flex-col items-center gap-3">
      <svg width={w + 2} height={h + 2} viewBox={`0 0 ${w + 2} ${h + 2}`} aria-hidden className="text-fg-muted">
        <rect x="1" y="1" width={w} height={h} rx="5" fill="none" stroke="currentColor" strokeDasharray="3 3" />
      </svg>
      <figcaption className="text-center text-xs text-fg-muted">Celular<br />15 cm</figcaption>
    </figure>
  );
}

/**
 * Las carteras dibujadas a escala, lado a lado. Comparar tamaños es lo que
 * más cuesta sin tenerlas en la mano; las medidas en texto no alcanzan.
 */
export default function AEscala({ products }: { products: Product[] }) {
  const conMedidas = products.filter((p) => p.dimensionWidth && p.dimensionHeight);
  if (conMedidas.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <p className="rotulo mb-3 text-bordo">A escala</p>
          <TituloEditorial texto="¿Qué tan *grande* es?" className="text-4xl leading-tight sm:text-6xl" />
        </div>
        <p className="max-w-md text-fg-soft lg:justify-self-end">Todos los modelos dibujados en proporción real, junto a un celular. Tocá uno para ver sus fotos.</p>
      </div>
      <div className="scrollbar-hide -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-end gap-10 border-b border-line pb-6 lg:min-w-0 lg:justify-between">
          {conMedidas.map((p) => (
            <Link key={p.id} href={'/producto/' + p.slug} className="group flex shrink-0 flex-col items-center gap-3">
              <span className="transition-transform duration-300 group-hover:-translate-y-1">
                <SiluetaCartera ancho={p.dimensionWidth as number} alto={p.dimensionHeight as number} escala={ESCALA} etiqueta={p.name + ': ' + medidasDe(p)} />
              </span>
              <span className="text-center">
                <span className="block font-display text-xl text-fg group-hover:text-bordo">{p.name}</span>
                <span className="text-xs text-fg-muted">{medidasDe(p)}</span>
              </span>
            </Link>
          ))}
          <Celular />
        </div>
      </div>
    </section>
  );
}
