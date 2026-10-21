'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { motivoDelError } from '../pedidos/CancelarVenta';
import type { EstadoSolicitud, Solicitud, TipoSolicitud } from './tipos';

export interface NuevaSolicitudDatos {
  tipo: TipoSolicitud;
  nombre: string;
  email: string;
  telefono?: string;
  pedidoNumero: string;
  motivo?: string;
}

/** Trae todas las solicitudes (las cuentas por pestaña salen de acá) y las guarda/actualiza. */
export function useSolicitudes() {
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<Solicitud[]>('/posventa');
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(motivoDelError(err), 'error');
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  const reemplazar = (s: Solicitud) => setSolicitudes((antes) => antes.map((x) => (x.id === s.id ? s : x)));

  const actualizar = async (id: string, cambios: { estado?: EstadoSolicitud; notas?: string }): Promise<boolean> => {
    setGuardando(true);
    try {
      const { data } = await api.patch<Solicitud>('/posventa/' + id, cambios);
      reemplazar(data);
      toast('Solicitud ' + data.codigo + ' guardada', 'success');
      return true;
    } catch (err) {
      toast(motivoDelError(err), 'error');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const crear = async (datos: NuevaSolicitudDatos): Promise<Solicitud | null> => {
    setGuardando(true);
    try {
      const { data } = await api.post<Solicitud>('/posventa', datos);
      setSolicitudes((antes) => [data, ...antes]);
      toast('Solicitud ' + data.codigo + ' creada' + (data.order ? '' : ' (no encontramos ese pedido: queda sin vincular)'), data.order ? 'success' : 'info');
      return data;
    } catch (err) {
      toast(motivoDelError(err), 'error');
      return null;
    } finally {
      setGuardando(false);
    }
  };

  return { solicitudes, cargando, guardando, actualizar, crear };
}
