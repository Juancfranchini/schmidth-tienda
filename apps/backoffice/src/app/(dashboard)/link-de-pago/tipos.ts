/** Datos de la API del punto de venta que usa esta pantalla (GET /pos/catalog, GET y POST /pos/links). */

export interface Variante {
  id: string;
  color?: string | null;
  size: string;
  stock: number;
  active: boolean;
  isDefault: boolean;
}

export interface Producto {
  id: string;
  name: string;
  sku: string;
  stock: number;
  effectivePrice: number;
  images: string[];
  isMadeToOrder: boolean;
  variants: Variante[];
}

export interface ItemDelLink {
  clave: string;
  producto: Producto;
  variante?: Variante;
  cantidad: number;
}

export type EstadoLink = 'OPEN' | 'CHECKOUT' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';

export interface LinkDePago {
  id: string;
  channel: string;
  status: EstadoLink;
  checkoutUrl: string;
  createdAt: string;
  expiresAt: string;
  customer?: { name?: string; phone?: string } | null;
  items?: { quantity: number }[];
  order?: { id: string; number: string; paymentStatus: string } | null;
}

/** Nombre de la variante para mostrar ("Negro", "Negro · M"); vacío si es la base. */
export function nombreVariante(v?: Variante): string {
  if (!v || v.isDefault) return '';
  return [v.color, v.size].filter(Boolean).join(' · ');
}
