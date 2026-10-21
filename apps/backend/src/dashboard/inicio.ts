/**
 * Armado de la pantalla de Inicio del backoffice, sin acceso a la base: así se
 * prueba solo. InicioService junta los datos y llama a estas funciones.
 */

export interface Tarea {
  clave: string;
  cantidad: number;
  titulo: string;
  detalle: string;
  href: string;
}

export interface ConteosDelDia {
  porCobrar: number;
  paraPreparar: number;
  carritosParaContactar: number;
  stockBajo: number;
  linksSinPagar: number;
}

/** "Para hacer hoy": solo lo que tiene algo pendiente, en orden de urgencia. */
export function tareasDelDia(c: ConteosDelDia): Tarea[] {
  const plural = (n: number, uno: string, varios: string) => (n === 1 ? uno : varios);
  const todas: Tarea[] = [
    {
      clave: 'paraPreparar', cantidad: c.paraPreparar, href: '/pedidos?etapa=enviar',
      titulo: plural(c.paraPreparar, 'pedido para preparar', 'pedidos para preparar'),
      detalle: 'Pagados y todavía sin despachar.',
    },
    {
      clave: 'porCobrar', cantidad: c.porCobrar, href: '/pedidos?etapa=cobrar',
      titulo: plural(c.porCobrar, 'pedido por cobrar', 'pedidos por cobrar'),
      detalle: 'Esperando el pago (transferencias o pagos sin acreditar).',
    },
    {
      clave: 'carritos', cantidad: c.carritosParaContactar, href: '/carritos-abandonados',
      titulo: plural(c.carritosParaContactar, 'carrito para recuperar', 'carritos para recuperar'),
      detalle: 'Dejaron sus datos en los últimos 7 días y nadie los contactó.',
    },
    {
      clave: 'links', cantidad: c.linksSinPagar, href: '/link-de-pago',
      titulo: plural(c.linksSinPagar, 'link de pago sin pagar', 'links de pago sin pagar'),
      detalle: 'Enviados y todavía vigentes.',
    },
    {
      clave: 'stock', cantidad: c.stockBajo, href: '/productos',
      titulo: plural(c.stockBajo, 'variante con stock bajo', 'variantes con stock bajo'),
      detalle: 'Quedan 2 unidades o menos.',
    },
  ];
  return todas.filter((t) => t.cantidad > 0);
}

export interface PasoPuestaEnMarcha {
  clave: string;
  titulo: string;
  detalle: string;
  listo: boolean;
  href: string;
}

export interface EstadoConfiguracion {
  pagos: boolean;
  mails: boolean;
  imagenes: boolean;
  dominio: boolean;
  datosMarca: boolean;
  fotosReales: boolean;
  legalesRevisados: boolean;
  meta: boolean;
}

/** Guía de puesta en marcha: lo que falta para vender de verdad, con dónde se resuelve. */
export function pasosPuestaEnMarcha(e: EstadoConfiguracion): PasoPuestaEnMarcha[] {
  return [
    { clave: 'pagos', listo: e.pagos, href: '/configuracion/medios-pago', titulo: 'Cobrar con Mercado Pago', detalle: 'Cargá el token de acceso (o la variable MERCADOPAGO_ACCESS_TOKEN del servidor).' },
    { clave: 'mails', listo: e.mails, href: '/configuracion', titulo: 'Mandar mails', detalle: 'Clave de Resend y remitente. Sin esto no salen confirmaciones ni el botón de arrepentimiento.' },
    { clave: 'imagenes', listo: e.imagenes, href: '/configuracion', titulo: 'Subir fotos', detalle: 'Cuenta de Cloudinary para guardar las imágenes.' },
    { clave: 'fotos', listo: e.fotosReales, href: '/productos', titulo: 'Fotos reales de los productos', detalle: 'Todavía hay productos con fotos provisorias.' },
    { clave: 'datos', listo: e.datosMarca, href: '/configuracion', titulo: 'Datos de la marca', detalle: 'WhatsApp, razón social y CUIT (packages/marca/marca.json).' },
    { clave: 'dominio', listo: e.dominio, href: '/configuracion', titulo: 'Dominio propio', detalle: 'La tienda todavía usa el dominio de ejemplo (packages/marca/marca.json).' },
    { clave: 'legales', listo: e.legalesRevisados, href: '/configuracion/terminos', titulo: 'Revisar los textos legales', detalle: 'Términos, privacidad, envíos y devoluciones son borradores.' },
    { clave: 'meta', listo: e.meta, href: '/configuracion', titulo: 'Conectar Meta', detalle: 'Pixel y API de Conversiones para medir y hacer anuncios.' },
  ];
}

export interface Periodo { ventas: number; pedidos: number }

/** Variación porcentual contra el período anterior; null si antes no hubo nada para comparar. */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior <= 0) return null;
  return Math.round(((actual - anterior) / anterior) * 100);
}

export function comparar(actual: Periodo, anterior: Periodo) {
  const ticket = (p: Periodo) => (p.pedidos > 0 ? p.ventas / p.pedidos : 0);
  return {
    ventas: { valor: actual.ventas, variacion: variacion(actual.ventas, anterior.ventas) },
    pedidos: { valor: actual.pedidos, variacion: variacion(actual.pedidos, anterior.pedidos) },
    ticket: { valor: ticket(actual), variacion: variacion(ticket(actual), ticket(anterior)) },
  };
}
