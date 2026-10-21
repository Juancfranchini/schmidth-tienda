import { randomBytes } from 'crypto';
import { EstadoSolicitud, TipoSolicitud } from '@prisma/client';

/**
 * Código que se le da a la clienta para identificar su solicitud:
 * ARR-AAAAMMDD-XXXXXX para arrepentimiento (lo pide la Res. 424/2020) y
 * SOL-… para cambios y fallas.
 */
export function codigoSolicitud(tipo: TipoSolicitud, ahora = new Date()): string {
  const prefijo = tipo === TipoSolicitud.ARREPENTIMIENTO ? 'ARR' : 'SOL';
  const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '');
  return prefijo + '-' + fecha + '-' + randomBytes(3).toString('hex').toUpperCase();
}

/** Una solicitud cerrada (resuelta o rechazada) guarda cuándo se cerró; si se reabre, se borra. */
export function fechaDeCierre(estado: EstadoSolicitud, ahora = new Date()): Date | null {
  return estado === EstadoSolicitud.RESUELTA || estado === EstadoSolicitud.RECHAZADA ? ahora : null;
}

/** Normaliza el número de pedido que escribe la clienta ("sch 123" → "SCH-123") para buscarlo. */
export function normalizarNumeroPedido(texto: string): string {
  return texto.trim().toUpperCase().replace(/\s+/g, '-');
}
