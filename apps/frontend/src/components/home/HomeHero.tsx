import Link from 'next/link';
import type { HeroSlide, Product } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { MARCA } from '@/config/marca';

interface Props {
  slide: HeroSlide | null;
  /** Modelo protagonista cuando el hero no tiene foto propia cargada. */
  destacado: Product | null;
}

/**
 * Portada. Con foto cargada en el backoffice (Hero) va a sangre, con el texto
 * encima; sin foto, se arma con la del modelo destacado al costado, en una
 * composición editorial: así la portada nunca queda vacía.
 */
export default function HomeHero({ slide, destacado }: Props) {
  const titulo = slide?.title || MARCA.eslogan;
  const bajada = slide?.description || MARCA.frases.ritmo + '.';
  const cta = slide?.ctaPrimary || 'Ver colección';
  const ctaUrl = slide?.ctaPrimaryUrl || '/catalogo';
  const rotulo = slide?.subtitle || MARCA.bajada;

  if (slide?.image) {
    return (
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-ink text-on-accent sm:items-center">
        <picture>
          {slide.imageMobile && <source media="(max-width: 640px)" srcSet={getImageUrl(slide.imageMobile, 900)} />}
          <img src={getImageUrl(slide.image, 2000)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent sm:bg-gradient-to-r" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-0">
          <Texto rotulo={rotulo} titulo={titulo} bajada={bajada} cta={cta} ctaUrl={ctaUrl} claro />
        </div>
      </section>
    );
  }

  const foto = destacado?.images?.[0];
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-16">
      <Texto rotulo={rotulo} titulo={titulo} bajada={bajada} cta={cta} ctaUrl={ctaUrl} />
      {foto && destacado && (
        <Link href={'/producto/' + destacado.slug} className="group relative block aspect-[4/5] overflow-hidden bg-chip">
          <img src={getImageUrl(foto, 1200)} alt={destacado.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          <span className="rotulo absolute bottom-0 left-0 bg-page px-4 py-3 text-fg">{destacado.name} · {destacado.material || 'Eco cuero'}</span>
        </Link>
      )}
    </section>
  );
}

function Texto({ rotulo, titulo, bajada, cta, ctaUrl, claro = false }: {
  rotulo: string; titulo: string; bajada: string; cta: string; ctaUrl: string; claro?: boolean;
}) {
  return (
    <div className="max-w-xl">
      <p className={'rotulo mb-5 ' + (claro ? 'text-on-accent/80' : 'text-bordo')}>{rotulo}</p>
      <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl">{titulo}</h1>
      <span className={'guion mt-7 ' + (claro ? 'text-on-accent/70' : 'text-fg')} aria-hidden />
      <p className={'mt-7 max-w-md text-base leading-relaxed ' + (claro ? 'text-on-accent/85' : 'text-fg-soft')}>{bajada}</p>
      <Link
        href={ctaUrl}
        className={'rotulo mt-8 inline-block border px-8 py-4 transition-colors ' + (claro
          ? 'border-on-accent text-on-accent hover:bg-on-accent hover:text-ink'
          : 'border-ink bg-ink text-on-accent hover:border-bordo hover:bg-bordo')}
      >
        {cta}
      </Link>
    </div>
  );
}
