import { esc, marco, parrafo, pesos, recuadro, type DatosTienda, type ItemMail } from './order-emails';

/**
 * Mails que no son del circuito del pedido (contacto, arrepentimiento) y el de
 * confirmación de respaldo. Todo lo que escribe la persona pasa por `esc`: va
 * a un HTML que abre otra persona.
 */

export interface Arrepentimiento {
  codigo: string;
  nombre: string;
  email: string;
  telefono?: string;
  pedido: string;
  motivo?: string;
}

const lineaDato = (etiqueta: string, valor?: string) =>
  valor ? '<strong>' + esc(etiqueta) + ':</strong> ' + esc(valor) + '<br>' : '';

/** Aviso a la tienda de un mensaje del formulario de contacto. */
export function mailContactoTienda(d: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const datos = lineaDato('Nombre', d.name) + lineaDato('Email', d.email) + lineaDato('Teléfono', d.phone) + lineaDato('Asunto', d.subject);
  const cuerpo = recuadro(datos) + parrafo(esc(d.message).replace(/\n/g, '<br>'));
  return {
    subject: 'Nuevo mensaje de contacto: ' + (d.subject || 'Sin asunto'),
    html: marco('Nuevo mensaje de contacto', cuerpo, { etiqueta: 'Contacto', resumen: 'Mensaje de ' + d.name }),
  };
}

/** Confirmación de pedido cuando no hay plantilla cargada en el backoffice. */
export function mailConfirmacionRespaldo(p: { orderNumber: string; items: ItemMail[]; total: number; tienda?: DatosTienda }) {
  const filas = p.items.map((i) => esc(i.name) + ' × ' + i.quantity + ' — ' + pesos(i.price * i.quantity)).join('<br>');
  const cuerpo = parrafo('Tu pedido <strong>' + esc(p.orderNumber) + '</strong> está confirmado.') + recuadro(filas + '<br><br><strong>Total: ' + pesos(p.total) + '</strong>');
  return {
    subject: 'Pedido ' + p.orderNumber + ' confirmado',
    html: marco('¡Gracias por tu compra!', cuerpo, { etiqueta: 'Pedido ' + p.orderNumber, resumen: 'Tu pedido está confirmado.', tienda: p.tienda }),
  };
}

/** A la clienta: confirma que recibimos el pedido de arrepentimiento, con el código que pide la norma. */
export function mailArrepentimientoClienta(a: Arrepentimiento, tienda?: DatosTienda) {
  const cuerpo =
    parrafo('Hola ' + esc(a.nombre) + ', recibimos tu pedido para cancelar la compra ' + esc(a.pedido) + '.') +
    recuadro('Código de tu solicitud: <strong>' + esc(a.codigo) + '</strong>') +
    parrafo('Te vamos a escribir para coordinar la devolución. Si no tenés novedades en 24 horas hábiles, respondé este mail con el código.');
  return {
    subject: 'Recibimos tu pedido de arrepentimiento (' + a.codigo + ')',
    html: marco('Pedido de arrepentimiento recibido', cuerpo, { etiqueta: 'Arrepentimiento', resumen: 'Código ' + a.codigo, tienda }),
  };
}

/** A la tienda: hay que responder y coordinar la devolución. */
export function mailArrepentimientoTienda(a: Arrepentimiento) {
  const datos = lineaDato('Código', a.codigo) + lineaDato('Pedido', a.pedido) + lineaDato('Nombre', a.nombre) +
    lineaDato('Email', a.email) + lineaDato('Teléfono', a.telefono) + lineaDato('Motivo', a.motivo);
  const cuerpo = parrafo('Una clienta usó el botón de arrepentimiento. Hay que responderle y coordinar la devolución sin costo para ella (art. 34, Ley 24.240).') + recuadro(datos);
  return {
    subject: 'Arrepentimiento ' + a.codigo + ' — pedido ' + a.pedido,
    html: marco('Botón de arrepentimiento', cuerpo, { etiqueta: 'Acción requerida', resumen: 'Pedido ' + a.pedido }),
  };
}
