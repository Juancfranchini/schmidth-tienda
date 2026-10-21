'use client';

import { useEffect, useState } from 'react';
import { bolsasEfectivas, useCartStore } from '@/store/cartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ConfigBolsa {
  /** Precio por bolsa. 0 = sin cargo. */
  precio: number;
  /** Si la tienda la ofrece. */
  activa: boolean;
}

/** Sin configurar (o sin respuesta): ofrecida y sin cargo, como fue siempre. */
const POR_DEFECTO: ConfigBolsa = { precio: 0, activa: true };

let pedido: Promise<ConfigBolsa> | null = null;

function leer(): Promise<ConfigBolsa> {
  pedido ??= fetch(API_URL + '/site-sections/bolsa_regalo')
    .then((r) => r.json())
    .then((res) => {
      const d = (res?.data ?? {}) as { precio?: unknown; activa?: unknown };
      const precio = Number(d.precio);
      return { precio: Number.isFinite(precio) && precio > 0 ? precio : 0, activa: d.activa !== false };
    })
    .catch(() => {
      pedido = null;
      return POR_DEFECTO;
    });
  return pedido;
}

/**
 * Precio y disponibilidad de la bolsa de regalo, como los fijó la tienda.
 * Es para mostrar: el cargo que se cobra lo calcula siempre el servidor.
 */
export function useConfigBolsa(): ConfigBolsa {
  const [config, setConfig] = useState<ConfigBolsa>(POR_DEFECTO);
  useEffect(() => {
    let vigente = true;
    leer().then((c) => vigente && setConfig(c));
    return () => { vigente = false; };
  }, []);
  return config;
}

/** Bolsas que van en el carrito y cuánto suman (0 si la tienda no la ofrece). */
export function useCargoBolsas(): ConfigBolsa & { cantidad: number; total: number } {
  const config = useConfigBolsa();
  const items = useCartStore((s) => s.items);
  const pedidas = useCartStore((s) => s.bolsasRegalo);
  const cantidad = config.activa ? bolsasEfectivas(pedidas, items) : 0;
  return { ...config, cantidad, total: cantidad * config.precio };
}
