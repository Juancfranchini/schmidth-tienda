'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { ItemDelLink, LinkDePago, Producto, Variante } from './tipos';

export interface DatosDelLink {
  canal: 'WHATSAPP' | 'INSTAGRAM' | 'PHONE' | 'SOCIAL';
  nombre?: string;
  telefono?: string;
  email?: string;
  notas?: string;
}

function mensajeDeError(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
  const m = data?.message;
  return (Array.isArray(m) ? m.join(' · ') : m) || 'No se pudo crear el link. Probá de nuevo.';
}

/** Estado de la pantalla: búsqueda de productos, ítems elegidos, creación del link y links recientes. */
export function useLinkDePago() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemDelLink[]>([]);
  const [links, setLinks] = useState<LinkDePago[]>([]);
  const [creado, setCreado] = useState<{ url: string; datos: DatosDelLink } | null>(null);
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const cargarLinks = useCallback(async () => {
    try {
      const res = await api.get<LinkDePago[]>('/pos/links');
      setLinks(Array.isArray(res.data) ? res.data : []);
    } catch { setLinks([]); }
  }, []);
  useEffect(() => { cargarLinks(); }, [cargarLinks]);

  // Búsqueda con una pausa corta, para no pedir en cada tecla.
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await api.get<Producto[]>('/pos/catalog', { params: { search: busqueda.trim() } });
        setResultados(Array.isArray(res.data) ? res.data : []);
      } catch { setResultados([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  const agregar = (producto: Producto, variante?: Variante) => {
    const clave = producto.id + ':' + (variante?.id ?? '');
    setItems((actuales) => {
      const ya = actuales.find((i) => i.clave === clave);
      if (ya) return actuales.map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [...actuales, { clave, producto, variante, cantidad: 1 }];
    });
    setCreado(null);
  };
  const cambiarCantidad = (clave: string, cantidad: number) =>
    setItems((actuales) => actuales.flatMap((i) => (i.clave !== clave ? [i] : cantidad <= 0 ? [] : [{ ...i, cantidad }])));

  const crear = async (datos: DatosDelLink) => {
    if (items.length === 0) { setError('Agregá al menos un producto.'); return; }
    setCreando(true);
    setError('');
    try {
      const res = await api.post<{ checkoutUrl: string }>('/pos/links', {
        channel: datos.canal,
        items: items.map((i) => ({ productId: i.producto.id, ...(i.variante ? { variantId: i.variante.id } : {}), quantity: i.cantidad })),
        ...(datos.nombre ? { customer: { name: datos.nombre, ...(datos.telefono ? { phone: datos.telefono } : {}), ...(datos.email ? { email: datos.email } : {}) } } : {}),
        ...(datos.notas ? { notes: datos.notas } : {}),
      });
      setCreado({ url: res.data.checkoutUrl, datos });
      setItems([]);
      await cargarLinks();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCreando(false);
    }
  };

  return { busqueda, setBusqueda, resultados, items, agregar, cambiarCantidad, crear, creando, error, creado, setCreado, links };
}
