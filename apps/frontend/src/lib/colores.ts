import type { Product } from '@/types';

/** Un color en el que se ofrece un modelo, con la foto y el stock de esa variante. */
export interface ColorDeProducto {
  nombre: string;
  /** Color de la muestra; null si no se cargó en el backoffice. */
  hex: string | null;
  imagen: string | null;
  stock: number;
}

/**
 * Colores de un producto, en el orden en que se cargaron. Salen de las
 * variantes activas con color (la variante base no cuenta). Un color repetido
 * en dos variantes se muestra una sola vez, sumando el stock.
 */
export function coloresDe(product: Pick<Product, 'variants'>): ColorDeProducto[] {
  const porNombre = new Map<string, ColorDeProducto>();
  for (const v of product.variants ?? []) {
    if (v.isDefault || !v.active || !v.color) continue;
    const previo = porNombre.get(v.color);
    if (previo) {
      previo.stock += v.stock;
      continue;
    }
    porNombre.set(v.color, { nombre: v.color, hex: v.colorHex ?? null, imagen: v.imageUrl ?? null, stock: v.stock });
  }
  return [...porNombre.values()];
}

/** Medidas "40 × 20 cm" (ancho × alto), o null si falta alguna. */
export function medidasDe(product: Pick<Product, 'dimensionWidth' | 'dimensionHeight' | 'dimensionUnit'>): string | null {
  if (!product.dimensionWidth || !product.dimensionHeight) return null;
  return product.dimensionWidth + ' × ' + product.dimensionHeight + ' ' + (product.dimensionUnit || 'cm');
}
