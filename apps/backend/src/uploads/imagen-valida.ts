// Validación de lo que se sube desde el backoffice.
//
// El tipo se mira en los primeros bytes del archivo, no en lo que declara el
// navegador: un archivo renombrado a .jpg no pasa. SVG queda afuera a propósito
// (puede llevar scripts adentro) y también GIF, que en una tienda no se usa.

export const PESO_MAXIMO = 10 * 1024 * 1024;
/** Lado más largo con el que se guarda una foto: más grande no se ve mejor en ningún lugar de la tienda. */
export const LADO_MAXIMO = 2000;

export type TipoImagen = 'jpg' | 'png' | 'webp' | 'avif';

const ascii = (b: Buffer, desde: number, hasta: number) => b.subarray(desde, hasta).toString('latin1');

export function tipoDeImagen(b: Buffer | undefined): TipoImagen | null {
  if (!b || b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && ascii(b, 1, 4) === 'PNG') return 'png';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return 'webp';
  if (ascii(b, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(b, 8, 12))) return 'avif';
  return null;
}

/** Devuelve el motivo del rechazo, o null si el archivo se puede subir. */
export function motivoDeRechazo(archivo: { buffer?: Buffer; size?: number } | undefined): string | null {
  if (!archivo?.buffer?.length) return 'No llegó ningún archivo.';
  if ((archivo.size ?? archivo.buffer.length) > PESO_MAXIMO) return 'La imagen pesa más de 10 MB. Achicala o exportala en JPG antes de subirla.';
  if (!tipoDeImagen(archivo.buffer)) return 'Ese archivo no es una imagen válida. Subí una foto en JPG, PNG, WebP o AVIF.';
  return null;
}
