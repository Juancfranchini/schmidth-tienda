import Link from 'next/link';
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

/**
 * Portada editorial: el título grande a la izquierda y la foto en un arco a la
 * derecha, con el sello de la marca y el modelo destacado encima. Si en el
 * backoffice se cargó una foto de Hero, va esa (y su título); si no, la de
 * ambiente provisoria de config/editorial.ts.
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
      <div aria-hidden className="absolute right-0 top-0 hidden h-[78%] w-[38%] bg-rosado/60 lg:block" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24 lg:pt-14">
        <div className="lg:col-span-6 lg:pr-6">
          <p className="rotulo aparecer mb-6 flex items-center gap-3 text-bordo"><span className="guion" aria-hidden />{rotulo}</p>
          <TituloEditorial como="h1" texto={titulo} className="aparecer aparecer-2 text-[3rem] leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.5rem]" />
          <p className="aparecer aparecer-3 mt-7 max-w-md text-base leading-relaxed text-fg-soft sm:text-lg">{bajada}</p>
          <div className="aparecer aparecer-3 mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={ctaUrl} className="rotulo inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-on-accent transition-colors hover:bg-bordo">
              {cta} <span aria-hidden>→</span>
            </Link>
            <Link href="/#colores" className="rotulo border-b border-fg pb-1 text-fg transition-colors hover:border-bordo hover:text-bordo">Elegí tu color</Link>
          </div>
          {nuevos.length > 0 && <RecienLlegadas productos={nuevos} />}
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-t-full bg-chip">
            <picture>
              {slide?.imageMobile && <source media="(max-width: 640px)" srcSet={getImageUrl(slide.imageMobile, 900)} />}
              <img src={foto.src} alt={foto.alt} className="h-full w-full object-cover" fetchPriority="high" />
            </picture>
          </div>
          <Sello />
          {destacado && <TarjetaDestacado producto={destacado} />}
        </div>
      </div>
    </section>
  );
}

function RecienLlegadas({ productos }: { productos: Product[] }) {
  return (
    <div className="mt-12 hidden items-center gap-4 border-t border-line pt-6 sm:flex">
      <div className="flex -space-x-3">
        {productos.slice(0, 3).map((p) => (
          <Link key={p.id} href={'/producto/' + p.slug} className="block h-12 w-12 overflow-hidden rounded-full border-2 border-page bg-chip transition-transform hover:z-10 hover:scale-110" title={p.name}>
            {p.images?.[0] && <img src={getImageUrl(p.images[0], 200)} alt={p.name} className="h-full w-full object-cover" />}
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

/** Sello redondo que gira: "Eco cuero · Hecho en Argentina", con la S de la marca al centro. */
function Sello() {
  const texto = 'Eco cuero · Hecho en Argentina · ';
  return (
    <div aria-hidden className="absolute -left-2 bottom-10 flex h-28 w-28 items-center justify-center rounded-full bg-bordo text-on-accent shadow-lg sm:left-4 sm:h-32 sm:w-32 lg:-left-10 lg:bottom-16">
      <svg viewBox="0 0 100 100" className="sello-giro absolute inset-0 h-full w-full">
        <defs><path id="sello-circulo" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
        <text className="fill-current" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
          {/* textLength reparte las letras justo en la vuelta (2πr ≈ 238): sin superposición ni hueco. */}
          <textPath href="#sello-circulo" textLength="236" lengthAdjust="spacing">{texto}</textPath>
        </text>
      </svg>
      <span className="font-display text-3xl italic">{MARCA.nombre.charAt(0)}</span>
    </div>
  );
}

function TarjetaDestacado({ producto }: { producto: Product }) {
  const precio = producto.effectivePrice ?? producto.price;
  return (
    <Link href={'/producto/' + producto.slug}
      className="group absolute -bottom-6 right-0 flex items-center gap-3 bg-page/95 p-2.5 pr-5 shadow-xl backdrop-blur transition-transform hover:-translate-y-1 sm:right-6 lg:-right-2">
      {producto.images?.[0] && <img src={getImageUrl(producto.images[0], 200)} alt="" className="h-16 w-14 object-cover" />}
      <span>
        <span className="rotulo block !text-[10px] text-fg-muted">La favorita</span>
        <span className="block font-display text-xl leading-tight text-fg">{producto.name}</span>
        <span className="text-sm text-fg-soft">{formatPrice(precio)} <span className="ml-1 text-bordo transition-transform group-hover:translate-x-0.5" aria-hidden>→</span></span>
      </span>
    </Link>
  );
}
