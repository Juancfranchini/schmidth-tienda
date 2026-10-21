// Bolsa de regalo Home Pádel: como máximo una por unidad comprada, al precio
// que fija la tienda desde Productos (sección "bolsa_regalo"; 0 = sin cargo).
// El navegador pide cuántas quiere; el servidor decide cuántas van y cuánto salen.

import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

/** Tope del DTO: nadie arma un pedido con más bolsas que esto. */
export const MAX_BOLSAS_REGALO = 50;
/** Precio máximo admitido por bolsa: frena un error de tipeo (un cero de más). */
export const PRECIO_MAXIMO_BOLSA = 1_000_000;
export const NOMBRE_BOLSA = 'Bolsa de regalo Home Pádel';

export interface ConfigBolsa {
  precio: number;
  /** Si la tienda la ofrece. Apagada, no se agrega a ningún pedido. */
  activa: boolean;
}

export interface CargoBolsas {
  cantidad: number;
  precio: number;
  total: number;
}

/** Bolsas que van en el pedido: entero entre 0 y las unidades compradas. */
export function bolsasDeRegalo(pedidas: number | undefined, items: { quantity: number }[]): number {
  const unidades = items.reduce((acc, item) => acc + item.quantity, 0);
  const n = Math.floor(Number(pedidas) || 0);
  return Math.max(0, Math.min(n, unidades));
}

/** Lo guardado, saneado: sin configurar sigue como siempre (ofrecida y sin cargo). */
export function configBolsa(data: unknown): ConfigBolsa {
  const d = (data ?? {}) as { precio?: unknown; activa?: unknown };
  const precio = Number(d.precio);
  return {
    precio: Number.isFinite(precio) && precio > 0 ? Math.min(Math.round(precio), PRECIO_MAXIMO_BOLSA) : 0,
    activa: d.activa !== false,
  };
}

/** Valida lo que manda el backoffice antes de guardarlo. */
export function validarConfigBolsa(data: Record<string, unknown>): ConfigBolsa {
  const precio = Number(data.precio);
  if (!Number.isFinite(precio) || precio < 0 || precio > PRECIO_MAXIMO_BOLSA) {
    throw new BadRequestException('El precio de la bolsa tiene que ser un número entre 0 y ' + PRECIO_MAXIMO_BOLSA + '.');
  }
  if (data.activa !== undefined && typeof data.activa !== 'boolean') {
    throw new BadRequestException('Indicá si la bolsa de regalo se ofrece o no.');
  }
  return { precio: Math.round(precio), activa: data.activa !== false };
}

export async function leerConfigBolsa(prisma: PrismaService): Promise<ConfigBolsa> {
  const seccion = await prisma.siteSection.findUnique({ where: { key: 'bolsa_regalo' } });
  return configBolsa(seccion?.data);
}

/** Cuántas bolsas van y cuánto suman al total del pedido. */
export function cargoDeBolsas(pedidas: number | undefined, items: { quantity: number }[], config: ConfigBolsa): CargoBolsas {
  const cantidad = config.activa ? bolsasDeRegalo(pedidas, items) : 0;
  return { cantidad, precio: config.precio, total: cantidad * config.precio };
}

/** Lo que se anota en el pedido: la cantidad (como siempre) y, si tiene cargo, el precio. */
export function notasDeBolsas(cargo: CargoBolsas): Record<string, number> {
  return cargo.precio > 0 && cargo.cantidad > 0 ? { bolsasRegalo: cargo.cantidad, precioBolsaRegalo: cargo.precio } : { bolsasRegalo: cargo.cantidad };
}

/** Renglón de las bolsas para los mails del pedido (vacío si no lleva). */
export function lineaDeBolsas(notas: Record<string, unknown>): { name: string; quantity: number; price: number }[] {
  const cantidad = Math.floor(Number(notas.bolsasRegalo) || 0);
  if (cantidad <= 0) return [];
  return [{ name: NOMBRE_BOLSA, quantity: cantidad, price: Number(notas.precioBolsaRegalo) || 0 }];
}
