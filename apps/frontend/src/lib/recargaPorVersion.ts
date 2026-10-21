/**
 * Error por archivos de una versión anterior del sitio.
 *
 * Si alguien (o el robot de Google) bajó la página justo antes de un deploy,
 * después pide archivos JavaScript que ya no existen y Next.js falla con
 * "ChunkLoadError". Recargar trae la versión nueva y se arregla solo. Se
 * recarga una sola vez por pestaña, para no entrar en un bucle si el error es
 * otro.
 */
const CLAVE = 'hp_recarga_por_version';

export function esErrorDeVersion(error: unknown): boolean {
  const e = error as { name?: unknown; message?: unknown } | null;
  const texto = String(e?.name ?? '') + ' ' + String(e?.message ?? '');
  return /ChunkLoadError|Loading (CSS )?chunk \S+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(texto);
}

/** Recarga la página si el error es de versión y todavía no se recargó en esta pestaña. Devuelve si recargó. */
export function recargarSiEsDeVersion(error: unknown): boolean {
  if (typeof window === 'undefined' || !esErrorDeVersion(error)) return false;
  try {
    if (sessionStorage.getItem(CLAVE)) return false;
    sessionStorage.setItem(CLAVE, '1');
  } catch {
    // Sin almacenamiento no hay forma de evitar un bucle: no se recarga.
    return false;
  }
  window.location.reload();
  return true;
}
