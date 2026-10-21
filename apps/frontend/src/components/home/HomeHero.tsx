import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { HeroSlide, Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { MARCA } from '@/config/marca';
import { FOTO_PORTADA } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';

interface Props {
  slide: HeroSlide | null;
  /** Modelo que se muestra en la tarjetita sobre la foto. */
  destacado: Product | null;
  /** Modelos nuevos para la fila "Recién llegadas". */
  nuevos: Product[];
}

/** Sin cursiva marcada (*así*), el eslogan lleva "acompañan" en cursiva; si el texto no la tiene, queda recto. */
const conPalabraClave = (titulo: string) => (titulo.includes('*') ? titulo : titulo.replace('acompañan', '*acompañan*'));

/** Demora de cada animación de entrada (globals.css lee --retardo). */
const demora = (ms: number) => ({ '--retardo': ms + 'ms' }) as CSSProperties;

/**
 * Portada editorial, como una página de revista de moda: título grande a la
 * izquierda (sube palabra por palabra), foto rectangular a la derecha que se
 * descubre como una cortina, con un marco fino desplazado y la firma de la
 * marca en vertical. Si en el backoffice se cargó una foto de Hero, va esa (y
 * su título); si no, la de ambiente provisoria de config/editorial.ts.
 */
export default function HomeHero({ slide, destacado, nuevos }: Props) {
  const titulo = conPalabraClave(slide?.title || MARCA.eslogan);
  // La bajada no repite el título (el hero de ejemplo traía el eslogan en los dos campos).
  const bajada = slide?.description && slide.description !== slide.title ? slide.description : MARCA.frases.companera;
  const cta = slide?.ctaPrimary || 'Ver colección';
  const ctaUrl = slide?.ctaPrimaryUrl || '/catalogo';
  const rotulo = slide?.subtitle || 'Colección ' + new Date().getFullYear() + ' · Eco cuero';
  const foto = slide?.image ? { src: getImageUrl(slide.image, 1400), alt: slide.title || MARCA.nombre } : FOTO_PORTADA;

  return (
    <section className="relative overflow-hidden">
      {/* Bloque rosado detrás de la foto: le da profundidad sin competir con ella. */}
      <div aria-hidden className="aparecer absolute right-0 top-0 hidden h-[78%] w-[38%] bg-rosado/60 lg:block" style={demora(100)} />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-28 lg:pt-14">
        <div className="lg:col-span-6 lg:pr-6">
          <p className="rotulo aparecer mb-7 flex items-center gap-3 text-bordo">
            <span className="trazar block h-px w-8 bg-current" style={demora(300)} aria-hidden />{rotulo}
          </p>
          <TituloEditorial como="h1" animado texto={titulo} className="text-[3rem] leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]" />
          <p className="aparecer mt-8 max-w-md text-base leading-relaxed text-fg-soft sm:text-lg" style={demora(700)}>{bajada}</p>
          <div className="aparecer mt-10 flex flex-wrap items-center gap-x-9 gap-y-4" style={demora(850)}>
            <Link href={ctaUrl} className="barrido rotulo inline-flex items-center gap-3 bg-ink px-9 py-4 text-on-accent">
              {cta} <span aria-hidden>→</span>
            </Link>
            <Link href="/#colores" className="subrayado rotulo pb-1 text-fg transition-colors hover:text-bordo">Elegí tu color</Link>
          </div>
          {nuevos.length > 0 && <RecienLlegadas productos={nuevos} />}
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto w-full max-w-[32rem]">
            {/* Marco fino desplazado: el detalle de la casa, como el paspartú de una lámina. */}
            <span aria-hidden className="aparecer absolute -bottom-4 -right-4 left-4 top-4 border border-camel/70 sm:-bottom-6 sm:-right-6 sm:left-6 sm:top-6" style={demora(1100)} />
            <div className="cortina relative aspect-[4/5] overflow-hidden bg-chip" style={demora(200)}>
              <picture>
                {slide?.imageMobile && <source media="(max-width: 640px)" srcSet={getImageUrl(slide.imageMobile, 900)} />}
                <img src={foto.src} alt={foto.alt} className="asentar h-full w-full object-cover" fetchPriority="high" style={demora(200)} />
              </picture>
            </div>
            <Firma />
            {destacado && <TarjetaDestacado producto={destacado} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecienLlegadas({ productos }: { productos: Product[] }) {
  return (
    <div className="aparecer mt-14 hidden items-center gap-5 border-t border-line pt-7 sm:flex" style={demora(1000)}>
      <div className="flex gap-2">
        {productos.slice(0, 3).map((p) => (
          <Link key={p.id} href={'/producto/' + p.slug} className="block h-14 w-11 overflow-hidden bg-chip" title={p.name}>
            {p.images?.[0] && <img src={getImageUrl(p.images[0], 200)} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />}
          </Link>
        ))}
      </div>
      <p className="text-sm leading-snug text-fg-soft">
        <span className="block font-display text-lg italic text-fg">Recién llegadas</span>
        {productos.slice(0, 3).map((p) => p.name).join(', ')}
      </p>
    </div>
  );
}

/** Firma vertical junto a la foto: una línea que se dibuja y el nombre de la marca. */
function Firma() {
  return (
    <div aria-hidden className="absolute -left-12 top-0 hidden h-full flex-col items-center gap-5 lg:flex">
      <span className="trazar-y block w-px flex-1 bg-fg/25" style={demora(900)} />
      <span className="aparecer" style={demora(1300)}>
        <span className="rotulo block rotate-180 whitespace-nowrap text-fg-muted [writing-mode:vertical-rl]">{MARCA.nombreLogo} — Eco cuero — Hecho en Argentina</span>
      </span>
    </div>
  );
}

function TarjetaDestacado({ producto }: { producto: Product }) {
  const precio = producto.effectivePrice ?? producto.price;
  return (
    <Link href={'/producto/' + producto.slug} style={demora(1400)}
      className="aparecer group absolute -bottom-10 -right-2 flex items-center gap-4 bg-page p-3 pr-6 shadow-[0_20px_50px_-20px_rgba(26,26,26,0.35)] sm:-right-12">
      {producto.images?.[0] && (
        <span className="block h-20 w-16 overflow-hidden"><img src={getImageUrl(producto.images[0], 200)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /></span>
      )}
      <span>
        <span className="rotulo block !text-[10px] text-fg-muted">La favorita</span>
        <span className="block font-display text-2xl italic leading-tight text-fg">{producto.name}</span>
        <span className="text-sm text-fg-soft">{formatPrice(precio)} <span className="ml-1 inline-block text-bordo transition-transform duration-500 group-hover:translate-x-1" aria-hidden>→</span></span>
      </span>
    </Link>
  );
}
