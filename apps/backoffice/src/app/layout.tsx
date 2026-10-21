// Root layout for the BackOffice.
// Minimal wrapper that only sets HTML metadata and body background.
// The dashboard shell (sidebar + header) is provided by the (dashboard) group layout.

import type { Metadata } from 'next';
import './globals.css';

import { MARCA } from '@/config/marca';
export const metadata: Metadata = {
  title: MARCA.nombre + ' — BackOffice',
  description: 'Panel de administración de ' + MARCA.nombre,
  // Isotipo del branding ("S" con línea).
  icons: { icon: MARCA.logo.isotipo },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
