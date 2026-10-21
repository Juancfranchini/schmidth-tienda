import { MARCA } from '../config/marca';

/**
 * Mails que recibe quien compra. Solo armado de HTML: el envío lo hace
 * EmailService. Todo lo que escribe un cliente o la tienda (nombre,
 * seguimiento, productos) pasa por `esc`: va a un HTML que abre el mail de
 * otra persona.
 *
 * Diseño (branding de la marca): tablas y estilos en línea (lo único que
 * respetan Gmail y Outlook), 600 px de ancho, encabezado negro con el logo en
 * texto serif y franja bordó, cuerpo blanco sobre blanco roto, un solo botón de
 * acción y pie con los datos de la tienda. El logo va en texto y no en imagen:
 * así no depende de un archivo publicado ni de que el cliente de mail muestre imágenes.
 */

export interface ItemMail {
  name: string;
  quantity: number;
  price: number;
}

export interface DatosBancarios {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
}

export interface PedidoMail {
  orderNumber: string;
  customerName: string;
  items: ItemMail[];
  total: number;
}

export interface MailArmado {
  subject: string;
  html: string;
}

/** Datos de contacto de la tienda para el pie. Lo que no está cargado no se muestra. */
export interface DatosTienda {
  whatsapp?: string | null;
  direccion?: string | null;
}

const NEGRO = MARCA.colores.negro;
const ACENTO = MARCA.colores.bordo;
const CLARO = MARCA.colores.blancoRoto;
const TEXTO = '#3D3A37';
const SUAVE = '#857D75';
const LINEA = '#E6E0D6';
const FUENTE = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";

/** Dirección de la tienda (para el logo y los botones). */
export function sitio(): string {
  return (process.env.FRONTEND_URL || MARCA.sitio.url).split(',')[0].trim().replace(/\/+$/, '');
}

export function esc(valor: unknown): string {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] || c);
}

export function pesos(monto: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto);
}

/** Link de WhatsApp (solo dígitos, con 549 si falta el código de país). Null si no hay un número usable. */
export function enlaceWhatsapp(telefono?: string | null): string | null {
  const digitos = (telefono || '').replace(/\D/g, '');
  if (digitos.length < 8) return null;
  return 'https://wa.me/' + (digitos.startsWith('54') ? digitos : '549' + digitos.replace(/^0+/, ''));
}

export const parrafo = (texto: string) =>
  '<p style="margin:0 0 16px;font-family:' + FUENTE + ';font-size:15px;line-height:1.6;color:' + TEXTO + ';">' + texto + '</p>';

const fuerte = (texto: string) => '<strong style="color:' + NEGRO + ';">' + texto + '</strong>';

/** Botón "a prueba de Outlook": una celda con fondo, no un <a> con padding. */
export function boton(texto: string, url: string): string {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>' +
    '<td style="background-color:' + ACENTO + ';">' +
    '<a href="' + esc(url) + '" style="display:inline-block;padding:14px 30px;font-family:' + FUENTE + ';font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:' + CLARO + ';text-decoration:none;">' + esc(texto) + '</a>' +
    '</td></tr></table>';
}

/** Recuadro piedra con borde bordó a la izquierda, para datos que hay que leer con atención. */
export function recuadro(contenido: string): string {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;"><tr>' +
    '<td style="background-color:' + MARCA.colores.piedra + ';border-left:3px solid ' + ACENTO + ';padding:16px 18px;font-family:' + FUENTE + ';font-size:14px;line-height:1.6;color:' + TEXTO + ';">' +
    contenido + '</td></tr></table>';
}

function tablaDelPedido(p: PedidoMail): string {
  const celda = 'padding:12px 0;border-bottom:1px solid ' + LINEA + ';font-family:' + FUENTE + ';font-size:14px;color:' + TEXTO + ';';
  const filas = p.items.map((i) =>
    '<tr><td style="' + celda + '">' + esc(i.name) + ' <span style="color:' + SUAVE + ';">× ' + i.quantity + '</span></td>' +
    '<td align="right" style="' + celda + 'white-space:nowrap;">' + pesos(i.price * i.quantity) + '</td></tr>').join('');
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">' + filas +
    '<tr><td style="padding:14px 0 0;font-family:' + FUENTE + ';font-size:16px;font-weight:bold;color:' + NEGRO + ';">Total</td>' +
    '<td align="right" style="padding:14px 0 0;font-family:' + FUENTE + ';font-size:18px;font-weight:bold;color:' + NEGRO + ';white-space:nowrap;">' + pesos(p.total) + '</td></tr></table>';
}

function pie(tienda?: DatosTienda): string {
  const web = sitio();
  const whatsapp = enlaceWhatsapp(tienda?.whatsapp);
  const enlace = (texto: string, url: string) => '<a href="' + esc(url) + '" style="color:' + MARCA.colores.camel + ';text-decoration:none;">' + texto + '</a>';
  const contacto = whatsapp ? '¿Dudas? Escribinos por ' + enlace('WhatsApp', whatsapp) + ' · ' : '';
  return '<tr><td style="background-color:' + NEGRO + ';padding:28px 32px;font-family:' + FUENTE + ';font-size:13px;line-height:1.7;color:#9A9A94;text-align:center;">' +
    '<p style="margin:0 0 6px;">' + contacto + enlace(esc(web.replace(/^https?:\/\//, '')), web) + '</p>' +
    (tienda?.direccion ? '<p style="margin:0 0 6px;">' + esc(tienda.direccion) + '</p>' : '') +
    '<p style="margin:12px 0 0;font-size:11px;color:#6B6B66;">Recibiste este mail por un pedido hecho en ' + esc(MARCA.nombre) + '.</p>' +
    '</td></tr>';
}

/** Estructura común: logo, etiqueta de estado, título, cuerpo y pie. */
export function marco(titulo: string, cuerpo: string, opciones: { etiqueta: string; resumen: string; tienda?: DatosTienda }): string {
  const web = sitio();
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta http-equiv="Content-Language" content="es"><title>' + esc(titulo) + '</title></head>' +
    '<body style="margin:0;padding:0;background-color:' + CLARO + ';">' +
    // Texto que muestran Gmail y el celular junto al asunto, antes de abrir el mail.
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + esc(opciones.resumen) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' + CLARO + ';"><tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;">' +
    '<tr><td align="center" style="background-color:' + NEGRO + ';padding:30px 32px 26px;">' +
    '<a href="' + esc(web) + '" style="font-family:' + SERIF + ';font-size:30px;letter-spacing:4px;color:' + CLARO + ';text-decoration:none;">' + esc(MARCA.nombreLogo) + '</a>' +
    '<p style="margin:10px 0 0;font-family:' + FUENTE + ';font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8B0A6;">' + esc(MARCA.bajada) + '</p></td></tr>' +
    '<tr><td style="background-color:' + ACENTO + ';height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>' +
    '<tr><td style="padding:32px 32px 8px;">' +
    '<p style="margin:0 0 12px;font-family:' + FUENTE + ';font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:' + SUAVE + ';">' + esc(opciones.etiqueta) + '</p>' +
    '<h1 style="margin:0 0 20px;font-family:' + SERIF + ';font-size:28px;font-weight:normal;line-height:1.25;color:' + NEGRO + ';">' + esc(titulo) + '</h1>' +
    cuerpo + '</td></tr>' + pie(opciones.tienda) +
    '</table></td></tr></table></body></html>';
}

const verPedido = (numero: string) => sitio() + '/rastrear?order=' + encodeURIComponent(numero);
const numeroDePedido = (numero: string) => fuerte(esc(numero));

/** Pagó con Mercado Pago, o la tienda confirmó su transferencia. */
export function mailPagoRecibido(p: PedidoMail & { esRetiro: boolean; tienda?: DatosTienda }): MailArmado {
  const siguiente = p.esRetiro
    ? 'Elegiste retirar en el local: te escribimos para coordinar apenas esté listo.'
    : 'Cuando lo despachemos te mandamos el número de seguimiento por este mismo medio.';
  const cuerpo =
    parrafo('Hola ' + esc(p.customerName) + ', recibimos el pago de tu pedido ' + numeroDePedido(p.orderNumber) + ' y ya lo estamos preparando.') +
    tablaDelPedido(p) + parrafo(siguiente) + boton('Ver mi pedido', verPedido(p.orderNumber));
  return {
    subject: 'Recibimos tu pago — pedido ' + p.orderNumber,
    html: marco('¡Gracias por tu compra!', cuerpo, { etiqueta: 'Pago confirmado', resumen: 'Tu pedido ' + p.orderNumber + ' ya está en preparación.', tienda: p.tienda }),
  };
}

/** Eligió transferencia: cómo pagar y que tiene que mandar el comprobante por WhatsApp. */
export function mailTransferencia(p: PedidoMail & { datos: DatosBancarios | null; whatsapp: string | null; tienda?: DatosTienda }): MailArmado {
  const datos = p.datos;
  const lineas = datos
    ? ([['Titular', datos.titular], ['Banco', datos.banco], ['Alias', datos.alias], ['CBU', datos.cbu]] as [string, string | null][])
        .filter(([, valor]) => valor)
        .map(([nombre, valor]) => '<span style="color:' + SUAVE + ';">' + nombre + ':</span> ' + fuerte(esc(valor)))
        .join('<br>')
    : '';
  const cuenta = lineas ? recuadro('<p style="margin:0 0 8px;font-size:15px;">' + fuerte('Transferí ' + pesos(p.total) + ' a:') + '</p>' + lineas) : '';
  const enlace = enlaceWhatsapp(p.whatsapp);
  const comprobante = parrafo(fuerte('Importante:') + ' enviá el comprobante de la transferencia por WhatsApp' +
    (enlace ? ' a <a href="' + esc(enlace) + '" style="color:' + NEGRO + ';">' + esc(p.whatsapp) + '</a>' : '') +
    ', indicando tu número de pedido. Apenas confirmemos el pago te avisamos por mail.');
  const cuerpo =
    parrafo('Hola ' + esc(p.customerName) + ', recibimos tu pedido ' + numeroDePedido(p.orderNumber) + '. Para confirmarlo falta tu transferencia.') +
    tablaDelPedido(p) + cuenta + comprobante + (enlace ? boton('Enviar comprobante por WhatsApp', enlace) : '');
  return {
    subject: 'Pedido ' + p.orderNumber + ': cómo pagar por transferencia',
    html: marco('Completá tu pago', cuerpo, { etiqueta: 'Esperando tu transferencia', resumen: 'Te dejamos los datos para transferir ' + pesos(p.total) + '.', tienda: p.tienda ?? { whatsapp: p.whatsapp } }),
  };
}

/** Despachado: con el seguimiento si la tienda lo cargó. */
export function mailDespachado(p: { orderNumber: string; customerName: string; trackingNumber?: string | null; trackingUrl?: string | null; tienda?: DatosTienda }): MailArmado {
  const numero = p.trackingNumber?.trim();
  const url = p.trackingUrl && /^https?:\/\//i.test(p.trackingUrl) ? p.trackingUrl : null;
  const seguimiento = numero ? recuadro('<span style="color:' + SUAVE + ';">Número de seguimiento</span><br><span style="font-size:18px;">' + fuerte(esc(numero)) + '</span>') : '';
  const cuerpo = parrafo('Hola ' + esc(p.customerName) + ', tu pedido ' + numeroDePedido(p.orderNumber) + ' ya está en camino.') +
    seguimiento + (url ? boton('Seguir mi envío', url) : boton('Ver mi pedido', verPedido(p.orderNumber)));
  return {
    subject: 'Tu pedido ' + p.orderNumber + ' fue despachado',
    html: marco('¡Tu pedido va en camino!', cuerpo, { etiqueta: 'Despachado', resumen: 'Tu pedido ' + p.orderNumber + ' ya salió.', tienda: p.tienda }),
  };
}

/** Pedido cancelado por la tienda. Si hubo reintegro se dice cuánto y por qué medio. */
export function mailCancelado(p: { orderNumber: string; customerName: string; reintegro: number; medio: string | null; whatsapp: string | null; tienda?: DatosTienda }): MailArmado {
  const reintegro = p.reintegro > 0
    ? recuadro('Te reintegramos ' + fuerte(pesos(p.reintegro)) + (p.medio ? ' por ' + esc(p.medio) : '') + '. Según tu medio de pago, puede tardar algunos días hábiles en verse reflejado.')
    : '';
  const ayuda = p.whatsapp
    ? parrafo('Si tenés alguna duda, escribinos por <a href="' + esc(p.whatsapp) + '" style="color:' + NEGRO + ';">WhatsApp</a>.')
    : parrafo('Si tenés alguna duda, respondé este mail.');
  const cuerpo = parrafo('Hola ' + esc(p.customerName) + ', tu pedido ' + numeroDePedido(p.orderNumber) + ' fue cancelado.') + reintegro + ayuda + boton('Ir a la tienda', sitio());
  return {
    subject: 'Tu pedido ' + p.orderNumber + ' fue cancelado',
    html: marco('Pedido cancelado', cuerpo, { etiqueta: 'Cancelado', resumen: 'Tu pedido ' + p.orderNumber + ' fue cancelado.', tienda: p.tienda }),
  };
}

/** El "enviar mail de prueba" del backoffice: el mismo diseño que reciben los clientes. */
export function mailDePrueba(tienda?: DatosTienda): MailArmado {
  const cuerpo = parrafo('Si estás leyendo esto, los mails de la tienda salen bien: llegan desde tu dominio y con este diseño.') + boton('Ir a la tienda', sitio());
  return { subject: 'Email de prueba - ' + MARCA.nombre, html: marco('Todo funciona', cuerpo, { etiqueta: 'Prueba', resumen: 'Los mails de la tienda están funcionando.', tienda }) };
}
