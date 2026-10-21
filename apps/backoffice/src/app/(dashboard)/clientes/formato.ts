import type { Contacto, Etapa } from './tipos';

export interface InfoEtapa {
  texto: string;
  /** Qué significa, para el que no la conoce. */
  ayuda: string;
  /** Clases de la insignia. */
  insignia: string;
  /** Color del punto de la tarjeta de resumen. */
  punto: string;
}

export const ETAPAS: Record<Etapa, InfoEtapa> = {
  frecuente: { texto: 'Cliente frecuente', ayuda: 'Compró 2 veces o más', insignia: 'bg-violet-50 text-violet-700 border-violet-200', punto: 'bg-violet-500' },
  cliente: { texto: 'Cliente', ayuda: 'Compró y el pago se acreditó', insignia: 'bg-green-50 text-green-700 border-green-200', punto: 'bg-green-500' },
  por_cobrar: { texto: 'Por cobrar', ayuda: 'Pidió por transferencia y falta el comprobante', insignia: 'bg-amber-50 text-amber-700 border-amber-200', punto: 'bg-amber-500' },
  carrito: { texto: 'Carrito abandonado', ayuda: 'Dejó su mail y no terminó la compra', insignia: 'bg-rose-50 text-rose-700 border-rose-200', punto: 'bg-rose-500' },
  suscriptor: { texto: 'Suscriptor', ayuda: 'Solo aceptó recibir novedades', insignia: 'bg-sky-50 text-sky-700 border-sky-200', punto: 'bg-sky-500' },
  registrado: { texto: 'Registrado', ayuda: 'Creó una cuenta y todavía no hizo nada más', insignia: 'bg-gray-50 text-gray-600 border-gray-200', punto: 'bg-gray-400' },
};

export const ORDEN_ETAPAS: Etapa[] = ['frecuente', 'cliente', 'por_cobrar', 'carrito', 'suscriptor', 'registrado'];

const ZONA = 'America/Argentina/Buenos_Aires';

export const pesos = (monto: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto);

/** "AP" a partir del nombre: lo que va dentro del círculo de la persona. */
export function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : (palabras[0] || '?').slice(0, 2);
  return letras.toUpperCase();
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA }).replace('.', '');
}

export function fechaYHora(iso: string): string {
  const f = new Date(iso);
  return fechaCorta(iso) + ' · ' + f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONA });
}

/** "hace 3 días": para saber de un vistazo qué tan fresco es un contacto. */
export function hace(iso: string, ahora = Date.now()): string {
  const minutos = Math.floor((ahora - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'recién';
  if (minutos < 60) return 'hace ' + minutos + ' min';
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return 'hace ' + horas + ' h';
  const dias = Math.floor(horas / 24);
  if (dias < 30) return dias === 1 ? 'hace 1 día' : 'hace ' + dias + ' días';
  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'hace 1 mes' : 'hace ' + meses + ' meses';
}

/** Una acción cuya fecha ya llegó: es lo que hay que hacer hoy. */
export const estaVencida = (fecha: string | null, ahora = Date.now()) => !!fecha && new Date(fecha).getTime() <= ahora;

/** Link de WhatsApp (solo dígitos, con 549 si falta el país). Null si no hay un número usable. */
export function whatsappDe(telefono: string | null, mensaje?: string): string | null {
  const digitos = (telefono || '').replace(/\D/g, '');
  if (digitos.length < 8) return null;
  const numero = digitos.startsWith('54') ? digitos : '549' + digitos.replace(/^0+/, '');
  return 'https://wa.me/' + numero + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
}

/** Lo que la persona tiene pendiente, en una frase corta para la tabla. */
export function pendienteDe(c: Contacto): string | null {
  if (c.porCobrar > 0) return 'Transferencia ' + pesos(c.porCobrar);
  if (c.carrito > 0 && c.pedidos === 0) return 'Carrito ' + pesos(c.carrito);
  return null;
}

/** La etiqueta se guarda en minúsculas: acá se muestra con la primera en mayúscula. */
export const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
