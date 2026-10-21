// Funciones utilitarias del frontend

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '$ 0';
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Calcula el porcentaje de descuento entre dos precios.
 * Ejemplo: getDiscountPercent(10000, 8000) -> 20
 */
export function getDiscountPercent(original: number, sale: number): number {
  const percent = ((original - sale) / original) * 100;
  return Math.round(percent * 10) / 10;
}

/** URL completa, sin tocar: base64 y absolutas tal cual; relativas, con la base del backend. */
export function urlCompleta(path: string | null | undefined): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + path;
}

const SUBIDA_CLOUDINARY = '/image/upload/';
/** Segmento de transformaciones ya armado (ej. `e_trim/` o `c_fit,w_160/`): esa URL no se vuelve a tocar. */
const YA_TRANSFORMADA = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)*\//;

/**
 * URL de una imagen, lista para mostrar.
 *
 * Las fotos de Cloudinary se piden comprimidas (WebP/AVIF según el navegador)
 * y al ancho en que se van a ver: el original de una paleta pesa ~950 KB y la
 * versión de tarjeta ~50 KB. Servir originales fue lo que agotó el plan de
 * Cloudinary. `ancho` es el máximo en píxeles (nunca se agranda una foto chica).
 */
export function getImageUrl(path: string | null | undefined, ancho = 1600): string {
  const url = urlCompleta(path);
  const i = url.indexOf(SUBIDA_CLOUDINARY);
  if (!url.includes('res.cloudinary.com') || i === -1) return url;
  const resto = url.slice(i + SUBIDA_CLOUDINARY.length);
  if (YA_TRANSFORMADA.test(resto)) return url;
  return url.slice(0, i) + SUBIDA_CLOUDINARY + 'f_auto,q_auto,c_limit,w_' + ancho + '/' + resto;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
