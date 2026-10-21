import { isAxiosError } from 'axios';
import api from '@/lib/api';

/**
 * Subida de imágenes del backoffice, en un solo lugar.
 *
 * Antes de mandar el archivo se controla tipo y peso (el servidor controla lo
 * mismo: esto es para avisar rápido y en castellano). Las medidas de abajo son
 * las que usa la tienda en cada lugar; el servidor además achica toda foto a
 * 2000 px de lado como máximo, así que una foto grande nunca es un problema.
 */

export type DestinoImagen =
  | 'producto' | 'hero' | 'heroMobile' | 'banner' | 'bannerMobile'
  | 'categoria' | 'marca' | 'logoPago' | 'logo' | 'general';

interface Medida {
  /** Lo que se le muestra a quien carga la foto. */
  texto: string;
  /** Por debajo de esto la foto se ve borrosa en la tienda: se avisa (no se bloquea). */
  minimo?: { ancho: number; alto: number };
}

export const MEDIDAS: Record<DestinoImagen, Medida> = {
  producto: { texto: 'Cuadrada, 1200 × 1200 px. Fondo blanco o transparente, producto centrado.', minimo: { ancho: 800, alto: 800 } },
  hero: { texto: '1800 × 1000 px (proporción 9:5). Con otra proporción, el banner recorta los bordes.', minimo: { ancho: 1440, alto: 800 } },
  heroMobile: { texto: '768 × 1024 px, vertical.', minimo: { ancho: 600, alto: 800 } },
  banner: { texto: '1200 × 600 px (proporción 2:1).', minimo: { ancho: 900, alto: 450 } },
  bannerMobile: { texto: '800 × 600 px.', minimo: { ancho: 600, alto: 450 } },
  categoria: { texto: 'Cuadrada, 800 × 800 px.', minimo: { ancho: 600, alto: 600 } },
  marca: { texto: 'Logo horizontal, 400 × 200 px, fondo transparente (PNG).', minimo: { ancho: 200, alto: 80 } },
  logoPago: { texto: '200 × 80 px. Logo horizontal, fondo transparente.' },
  logo: { texto: 'PNG con fondo transparente, 600 px de ancho o más.', minimo: { ancho: 300, alto: 100 } },
  general: { texto: 'JPG, PNG o WebP, hasta 10 MB.' },
};

export const FORMATOS_ACEPTADOS = 'image/jpeg,image/png,image/webp,image/avif';
const TIPOS = FORMATOS_ACEPTADOS.split(',');
const PESO_MAXIMO = 10 * 1024 * 1024;

/** Texto corto que acompaña cada lugar de carga: medida + formatos y peso. */
export const ayudaDe = (destino: DestinoImagen) =>
  destino === 'general' ? MEDIDAS.general.texto : MEDIDAS[destino].texto + ' JPG, PNG o WebP, hasta 10 MB.';

/** Motivo por el que el archivo no se puede subir, o null si está bien. */
export function problemaDelArchivo(archivo: File): string | null {
  if (!TIPOS.includes(archivo.type)) return 'Ese archivo no es una foto válida. Usá JPG, PNG, WebP o AVIF.';
  if (archivo.size > PESO_MAXIMO) return 'La foto pesa ' + (archivo.size / 1024 / 1024).toFixed(1) + ' MB y el máximo es 10 MB. Achicala o exportala en JPG.';
  return null;
}

async function medir(archivo: File): Promise<{ ancho: number; alto: number } | null> {
  try {
    const bitmap = await createImageBitmap(archivo);
    const medida = { ancho: bitmap.width, alto: bitmap.height };
    bitmap.close();
    return medida;
  } catch {
    return null;
  }
}

/** Aviso si la foto es más chica de lo que necesita ese lugar (se sube igual). */
export function avisoDeTamano(medida: { ancho: number; alto: number } | null, destino: DestinoImagen): string | null {
  const minimo = MEDIDAS[destino].minimo;
  if (!medida || !minimo || (medida.ancho >= minimo.ancho && medida.alto >= minimo.alto)) return null;
  return 'La foto mide ' + medida.ancho + ' × ' + medida.alto + ' px y puede verse borrosa. Lo ideal: ' + MEDIDAS[destino].texto;
}

/** El motivo que dio el servidor, en castellano, para mostrarlo tal cual. */
export function mensajeDeSubida(err: unknown): string {
  if (!isAxiosError(err)) return err instanceof Error && err.message ? err.message : 'No se pudo subir la imagen. Probá de nuevo.';
  const r = err.response as { status?: number; data?: { message?: unknown } } | undefined;
  if (!r) return 'No hay conexión con el servidor. Revisá internet y probá de nuevo.';
  if (r.status === 413) return 'La foto pesa más de 10 MB. Achicala o exportala en JPG.';
  const m = r?.data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join('. ');
  return 'No se pudo subir la imagen. Probá de nuevo.';
}

/**
 * Valida, sube y devuelve la URL. Si la foto es chica para ese lugar, la sube
 * igual y devuelve el aviso para mostrarlo. Tira Error con el motivo si no se puede.
 */
export async function subirImagen(archivo: File, destino: DestinoImagen = 'general'): Promise<{ url: string; aviso: string | null }> {
  const problema = problemaDelArchivo(archivo);
  if (problema) throw new Error(problema);
  const aviso = avisoDeTamano(await medir(archivo), destino);
  const datos = new FormData();
  datos.append('file', archivo);
  const res = await api.post<{ url?: string }>('/uploads/image', datos, { headers: { 'Content-Type': 'multipart/form-data' } });
  if (!res.data?.url) throw new Error('La imagen se subió pero no devolvió una dirección. Probá de nuevo.');
  return { url: res.data.url, aviso };
}
