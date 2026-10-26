// Root layout for the BackOffice.
// Minimal wrapper that only sets HTML metadata and body background.
// The dashboard shell (sidebar + header) is provided by the (dashboard) group layout.

import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';

import { MARCA } from '@/config/marca';

// Playfair Display es la tipografía del logo y los títulos de la marca; el resto del panel usa la del sistema.
const display = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: MARCA.nombre + ' — BackOffice',
  description: 'Panel de administración de ' + MARCA.nombre,
  // Isotipo del branding ("S" con línea).
  icons: { icon: MARCA.logo.isotipo },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={display.variable}>
      <body className="bg-[#F6F6F4] text-gray-900 antialiased">{children}</body>
    </html>
  );
}
