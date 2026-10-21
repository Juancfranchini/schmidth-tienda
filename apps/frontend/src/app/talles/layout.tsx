import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MARCA } from '@/config/marca';
/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Guía de talles',
  description: 'Guía de medidas de nuestros modelos.',
  alternates: { canonical: '/talles' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Módulo apagado en packages/marca/marca.json (tienda.rutasOcultas): la página no existe.
  if ((MARCA.tienda.rutasOcultas as readonly string[]).includes('/talles')) notFound();
  return children;
}
