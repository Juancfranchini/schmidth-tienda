'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { recargarSiEsDeVersion } from '@/lib/recargaPorVersion';

/**
 * Error dentro de una página. El encabezado, el menú y el título de la tienda
 * siguen (los pone el layout): en vez de la pantalla blanca "Application
 * error" de Next.js, que Google llegó a indexar como portada, se ve la tienda
 * con un aviso y la opción de reintentar.
 */
export default function ErrorDePagina({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (recargarSiEsDeVersion(error)) return;
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-page flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-muted">Algo salió mal</p>
        <h2 className="mt-3 text-2xl font-black text-fg">No pudimos cargar esta parte de la página</h2>
        <p className="mt-3 text-sm text-fg-soft">Probá de nuevo. Si sigue pasando, escribinos por WhatsApp y te ayudamos con tu compra.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="bg-accent text-on-accent px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors">
            Reintentar
          </button>
          <Link href="/catalogo" className="border border-line px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wide text-fg hover:bg-card transition-colors">
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  );
}
