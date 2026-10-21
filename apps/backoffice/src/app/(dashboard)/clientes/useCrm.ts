'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CambiosFicha, DetalleContacto, Filtros, ListaContactos } from './tipos';

export const FILTROS_INICIALES: Filtros = { q: '', etapa: '', etiqueta: '', orden: 'reciente', conAccionVencida: false, pagina: 1 };

export function motivoDelError(err: unknown, porDefecto: string): string {
  const detalle = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(detalle)) return detalle.join('. ');
  return typeof detalle === 'string' ? detalle : porDefecto;
}

function parametros(f: Filtros, extra: Record<string, string> = {}): Record<string, string> {
  const p: Record<string, string> = { orden: f.orden, pagina: String(f.pagina), ...extra };
  if (f.q.trim()) p.q = f.q.trim();
  if (f.etapa) p.etapa = f.etapa;
  if (f.etiqueta) p.etiqueta = f.etiqueta;
  if (f.conAccionVencida) p.conAccionVencida = 'true';
  return p;
}

/** La lista de personas: se vuelve a pedir cuando cambia un filtro (la búsqueda espera a que termines de escribir). */
export function useContactos(filtros: Filtros) {
  const [datos, setDatos] = useState<ListaContactos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    const espera = setTimeout(async () => {
      try {
        const { data } = await api.get<ListaContactos>('/crm/contactos', { params: parametros(filtros) });
        if (vigente) { setDatos(data); setError(''); }
      } catch (err) {
        if (vigente) setError(motivoDelError(err, 'No se pudieron cargar los clientes'));
      } finally {
        if (vigente) setCargando(false);
      }
    }, filtros.q ? 300 : 0);
    return () => { vigente = false; clearTimeout(espera); };
  }, [filtros, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  /** Todas las personas que cumplen el filtro actual (hasta 1000), para exportar. */
  const traerTodas = useCallback(async () => {
    const { data } = await api.get<ListaContactos>('/crm/contactos', { params: parametros({ ...filtros, pagina: 1 }, { limite: '1000' }) });
    return data.contactos;
  }, [filtros]);

  return { datos, cargando, error, recargar, traerTodas };
}

/** La ficha de una persona y todo lo que se le puede cambiar. Cada acción devuelve la ficha ya actualizada. */
export function useFicha(email: string | null, alCambiar: () => void) {
  const [detalle, setDetalle] = useState<DetalleContacto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDetalle(null);
    setError('');
    if (!email) return;
    let vigente = true;
    setCargando(true);
    api.get<DetalleContacto>('/crm/contacto', { params: { email } })
      .then(({ data }) => { if (vigente) setDetalle(data); })
      .catch((err) => { if (vigente) setError(motivoDelError(err, 'No se pudo abrir la ficha')); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [email]);

  const aplicar = useCallback(async (pedido: Promise<{ data: DetalleContacto }>) => {
    const { data } = await pedido;
    setDetalle(data);
    alCambiar();
  }, [alCambiar]);

  const guardarFicha = useCallback((cambios: CambiosFicha) => aplicar(api.patch<DetalleContacto>('/crm/contacto', { email, ...cambios })), [aplicar, email]);
  const agregarNota = useCallback((texto: string) => aplicar(api.post<DetalleContacto>('/crm/notas', { email, texto })), [aplicar, email]);
  const borrarNota = useCallback((id: string) => aplicar(api.delete<DetalleContacto>('/crm/notas/' + id)), [aplicar]);

  return { detalle, cargando, error, guardarFicha, agregarNota, borrarNota };
}
