import { getProducts, getBanners, getHeroSlides, getBenefits, getSiteSection } from '@/lib/api';
import HomeHero from '@/components/home/HomeHero';
import ColeccionGrid from '@/components/home/ColeccionGrid';
import ColoresStrip from '@/components/home/ColoresStrip';
import AEscala from '@/components/home/AEscala';
import APedido from '@/components/home/APedido';
import Beneficios from '@/components/home/Beneficios';
import PromoBanners from '@/components/home/PromoBanners';
import InstagramSection from '@/components/home/InstagramSection';
import Newsletter from '@/components/home/Newsletter';
import Manifiesto from '@/components/home/Manifiesto';
import Cinta from '@/components/home/Cinta';
import Momentos from '@/components/home/Momentos';
import { Product, Banner, HeroSlide, Benefit, InstagramConfig, SiteSection } from '@/types';
import type { Metadata } from 'next';
import { HOME_DESCRIPTION, HOME_TITLE, OPEN_GRAPH_BASE } from '@/lib/seoPortada';

/**
 * El canonical y los datos para compartir de la portada se declaran acá y no
 * en el layout raíz: ahí los heredaban todas las rutas.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...OPEN_GRAPH_BASE, url: '/', title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { card: 'summary_large_image', title: HOME_TITLE, description: HOME_DESCRIPTION },
};

// Plazo de respaldo. Lo normal es que el backoffice avise al guardar y la
// portada se refresque al instante (ver app/api/revalidate).
export const revalidate = 300;

function arr<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const maybe = raw as { data?: T[] };
  return maybe?.data ?? [];
}

function sectionData<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as SiteSection;
  if (s.active === false) return null;
  return (s.data as T) ?? null;
}

async function batch<T>(items: (() => Promise<T>)[], size = 5): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batchItems = items.slice(i, i + size);
    const batchResults = await Promise.allSettled(batchItems.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

async function fetchAll() {
  const [slidesRes, benefitsRes, productsRes, bannersRes, heroSectionRes, benefitsSectionRes, bannersSectionRes, instagramRes] = await batch([
    () => getHeroSlides(),
    () => getBenefits(),
    () => getProducts({ limit: 100, sort: 'newest' }),
    () => getBanners(),
    () => getSiteSection('hero'),
    () => getSiteSection('benefits'),
    () => getSiteSection('banners'),
    () => getSiteSection('instagram'),
  ]);
  const val = (r: PromiseSettledResult<unknown>) => (r.status === 'fulfilled' ? r.value : null);
  return {
    heroSlides: arr<HeroSlide>(val(slidesRes)).filter((s) => s.active !== false).sort((a, b) => a.order - b.order),
    benefits: arr<Benefit>(val(benefitsRes)),
    products: arr<Product>((val(productsRes) as { items?: Product[] } | null)?.items),
    banners: arr<Banner>(val(bannersRes)).sort((a, b) => a.order - b.order),
    heroSection: sectionData(val(heroSectionRes)),
    benefitsSection: sectionData(val(benefitsSectionRes)),
    bannersSection: sectionData(val(bannersSectionRes)),
    instagramConfig: sectionData<InstagramConfig>(val(instagramRes)),
  };
}

/** Destacados primero (en el orden en que se cargaron), después el resto. */
function ordenColeccion(products: Product[]): Product[] {
  return [...products].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
}

export default async function HomePage() {
  const { heroSlides, benefits, products, banners, heroSection, benefitsSection, bannersSection, instagramConfig } = await fetchAll();
  const coleccion = ordenColeccion(products);
  const destacado = coleccion.find((p) => p.images?.length) ?? null;
  const nuevos = coleccion.filter((p) => p.isNew && p.images?.length);

  return (
    <>
      <HomeHero slide={heroSection !== null ? heroSlides[0] ?? null : null} destacado={destacado} nuevos={nuevos} />
      <Cinta />
      <ColeccionGrid products={coleccion} />
      <Momentos />
      <ColoresStrip products={coleccion} />
      <Manifiesto />
      <AEscala products={coleccion} />
      <APedido />
      {benefitsSection !== null && <Beneficios benefits={benefits} />}
      {bannersSection !== null && banners.length > 0 && <PromoBanners banners={banners} />}
      {instagramConfig !== null && <InstagramSection config={instagramConfig} />}
      <Newsletter />
    </>
  );
}
