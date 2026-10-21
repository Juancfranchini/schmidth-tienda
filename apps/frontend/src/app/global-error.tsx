'use client';

import { useEffect } from 'react';
import { recargarSiEsDeVersion } from '@/lib/recargaPorVersion';

import { MARCA } from '@/config/marca';
/**
 * Error en el layout mismo (encabezado, pie): reemplaza toda la página, así
 * que lleva su propio <html> y estilos en línea (los de la tienda pueden no
 * haber cargado). Mantiene el título de la tienda.
 */
export default function ErrorGeneral({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (recargarSiEsDeVersion(error)) return;
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <head>
        <title>{MARCA.nombre + ' — ' + MARCA.rubro}</title>
      </head>
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgb(var(--c-ink))', color: '#F7F6F7', fontFamily: 'Arial, sans-serif', padding: 16 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px' }}>{MARCA.nombre}</p>
          <p style={{ color: '#C7C7C0', margin: '0 0 24px', lineHeight: 1.5 }}>No pudimos cargar la página. Probá de nuevo en unos segundos.</p>
          <button type="button" onClick={reset} style={{ background: 'rgb(var(--c-accent))', color: 'rgb(var(--c-ink))', border: 0, borderRadius: 12, padding: '12px 20px', fontWeight: 900, cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
