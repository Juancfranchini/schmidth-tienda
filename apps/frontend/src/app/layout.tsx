import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/layout/MetaPixel';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import ModoPruebaAviso from '@/components/layout/ModoPruebaAviso';
import CarritoDeCuenta from '@/components/layout/CarritoDeCuenta';
import FavoritosSync from '@/components/layout/FavoritosSync';
import { getSiteUrl } from '@/lib/siteUrl';
import { Playfair_Display, Montserrat } from 'next/font/google';
import { HOME_DESCRIPTION, HOME_TITLE, OPEN_GRAPH_BASE } from '@/lib/seoPortada';
import { MARCA } from '@/config/marca';

// Tipografías del branding: Playfair Display para el logo y los títulos, Montserrat para los textos.
const display = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const sans = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-sans', display: 'swap' });

async function getFaviconUrl(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const res = await fetch(apiUrl + '/site-sections/branding', { next: { revalidate: 3600 } });
    const data = await res.json();
    const isotipo = data?.data?.isotipo || data?.isotipo;
    if (isotipo) { if (isotipo.startsWith('data:') || isotipo.startsWith('http')) return isotipo; return baseUrl + isotipo; }
  } catch { }
  // Respaldo si la API no responde: un archivo que existe en public/.
  return MARCA.logo.isotipo;
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();
  const siteUrl = getSiteUrl();

  return {
    title: {
      default: HOME_TITLE,
      template: '%s | ' + MARCA.nombre,
    },
    description: HOME_DESCRIPTION,
    keywords: [...MARCA.keywords, MARCA.nombre.toLowerCase()],
    authors: [{ name: MARCA.nombre }],
    creator: MARCA.nombre,
    publisher: MARCA.nombre,
    formatDetection: { email: false, address: false, telephone: false },
    // Verificación de Google Search Console y del dominio en Meta: no son secretas (se leen del HTML
    // público) pero son de cada dominio. Se cargan por variable de entorno cuando exista el dominio de la marca.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
        ? { 'facebook-domain-verification': process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION }
        : undefined,
    },
    metadataBase: new URL(siteUrl),
    // Sin `alternates.canonical` a propósito: los metadatos se heredan, y un
    // canonical '/' acá hacía que toda ruta que no lo pisara (/terminos,
    // /privacidad…) le dijera a Google que era un duplicado de la portada.
    // Cada página indexable declara el suyo; el de la portada vive en app/page.tsx.
    // Por lo mismo, openGraph y twitter llevan solo lo común (ver seoPortada.ts).
    // La imagen para compartir la genera app/opengraph-image.tsx: la que se
    // declaraba acá (/og-image.jpg) no existía y los links salían sin imagen.
    openGraph: OPEN_GRAPH_BASE,
    twitter: { card: 'summary_large_image' },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Un solo tema (claro). data-theme="light" mantiene las clases `light:` heredadas.
    <html lang="es" data-theme="light" className={display.variable + ' ' + sans.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ModoPruebaAviso />
        <CarritoDeCuenta />
        <FavoritosSync />
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

