export type TipoSolicitud = 'ARREPENTIMIENTO' | 'CAMBIO' | 'FALLA';
export type EstadoSolicitud = 'PENDIENTE' | 'EN_CURSO' | 'RESUELTA' | 'RECHAZADA';

export interface Solicitud {
  id: string;
  codigo: string;
  tipo: TipoSolicitud;
  estado: EstadoSolicitud;
  /** 'tienda' (botón de arrepentimiento) o 'panel' (cargada a mano). */
  origen: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  pedidoNumero: string;
  motivo?: string | null;
  notas?: string | null;
  resueltaAt?: string | null;
  createdAt: string;
  order?: { id: string; number: string; status: string; total: number; createdAt: string } | null;
}

export const TIPOS: Record<TipoSolicitud, string> = { ARREPENTIMIENTO: 'Arrepentimiento', CAMBIO: 'Cambio', FALLA: 'Falla' };

export const ESTADOS: Record<EstadoSolicitud, { texto: string; color: string }> = {
  PENDIENTE: { texto: 'Pendiente', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  EN_CURSO: { texto: 'En curso', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  RESUELTA: { texto: 'Resuelta', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', color: 'border-gray-200 bg-gray-100 text-gray-600' },
};

export type Pestana = 'abiertas' | EstadoSolicitud | 'todas';

export const PESTANAS: { valor: Pestana; texto: string }[] = [
  { valor: 'abiertas', texto: 'Para resolver' },
  { valor: 'PENDIENTE', texto: 'Pendientes' },
  { valor: 'EN_CURSO', texto: 'En curso' },
  { valor: 'RESUELTA', texto: 'Resueltas' },
  { valor: 'RECHAZADA', texto: 'Rechazadas' },
  { valor: 'todas', texto: 'Todas' },
];

export const estaAbierta = (s: Solicitud) => s.estado === 'PENDIENTE' || s.estado === 'EN_CURSO';

export function enPestana(s: Solicitud, p: Pestana): boolean {
  if (p === 'todas') return true;
  if (p === 'abiertas') return estaAbierta(s);
  return s.estado === p;
}

/** Días corridos desde que entró la solicitud (para ver qué está demorado). */
export function diasDesde(iso: string, ahora = new Date()): number {
  return Math.max(0, Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86_400_000));
}

/** "hoy", "hace 1 día", "hace 4 días". */
export function haceCuanto(iso: string): string {
  const dias = diasDesde(iso);
  return dias === 0 ? 'hoy' : 'hace ' + dias + (dias === 1 ? ' día' : ' días');
}
