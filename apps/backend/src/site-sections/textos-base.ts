import { MARCA } from '../config/marca';

/**
 * Textos base de las páginas legales e informativas de la tienda. Se usan
 * como valor por defecto de cada sección (site-sections) y los carga el seed;
 * después se editan desde el backoffice.
 *
 * Son un BORRADOR (aRevisar: true): no son asesoramiento legal y tienen que
 * revisarse antes de publicar la tienda. Los datos de la empresa salen de
 * packages/marca/marca.json (legal.*); mientras estén vacíos se ve el aviso.
 */

const completar = (valor: string, campo: string) => valor || '[completar ' + campo + ']';
const empresa = completar(MARCA.legal.razonSocial, 'razón social');
const cuit = completar(MARCA.legal.cuit, 'CUIT');
const domicilio = completar(MARCA.legal.domicilio, 'domicilio');
const mail = MARCA.email.contacto;
const sitio = MARCA.sitio.url;

const terminos = `
<h3>1. Quiénes somos</h3>
<p>${MARCA.nombre} es una marca de carteras de ${empresa}, CUIT ${cuit}, con domicilio en ${domicilio}. Estos términos rigen las compras hechas en ${sitio}. Al comprar, aceptás estos términos.</p>
<h3>2. Productos y precios</h3>
<p>Los precios están expresados en pesos argentinos e incluyen IVA. Las fotos y los colores son de referencia: el color puede verse distinto según la pantalla. Las medidas de cada modelo figuran en su ficha.</p>
<p>Los modelos se ofrecen con <strong>stock inmediato</strong> o <strong>a pedido</strong>. Las carteras a pedido se confeccionan en el color que elegís; el plazo de entrega se informa antes de confirmar.</p>
<h3>3. Compra y pago</h3>
<p>El pedido se confirma cuando se acredita el pago. Los pagos con tarjeta y otros medios se procesan en Mercado Pago; ${MARCA.nombre} no ve ni guarda los datos de tu tarjeta. Si se ofrece transferencia bancaria, el pedido se reserva por el plazo indicado al confirmar.</p>
<h3>4. Envíos</h3>
<p>Enviamos a todo el país. El costo y el plazo estimado se muestran antes de pagar. Ver la página de envíos.</p>
<h3>5. Cambios, devoluciones y arrepentimiento</h3>
<p>Tenés derecho a revocar la compra dentro de los 10 días corridos desde que recibís el producto (art. 34 de la Ley 24.240), sin costo para vos. Podés hacerlo con el <a href="/arrepentimiento">botón de arrepentimiento</a>. Las carteras confeccionadas a pedido en un color elegido por vos no tienen derecho de arrepentimiento (art. 1116 del Código Civil y Comercial), salvo falla. Las condiciones de cambio están en la página de cambios y devoluciones.</p>
<h3>6. Garantía</h3>
<p>Si un producto tiene una falla de fabricación, lo reparamos, lo cambiamos o te devolvemos el dinero, según corresponda por ley.</p>
<h3>7. Datos personales</h3>
<p>Tratamos tus datos según nuestra política de privacidad.</p>
<h3>8. Contacto y reclamos</h3>
<p>Escribinos a <a href="mailto:${mail}">${mail}</a>. También podés recurrir a la Dirección Nacional de Defensa del Consumidor y a la Ventanilla Federal de Reclamos (argentina.gob.ar/defensadelconsumidor).</p>
`.trim();

const privacidad = `
<h3>1. Responsable</h3>
<p>${empresa}, CUIT ${cuit}, con domicilio en ${domicilio}, es responsable de los datos personales que recolectamos en ${sitio}.</p>
<h3>2. Qué datos recolectamos</h3>
<p>Nombre, email, teléfono, dirección de envío y los datos de tus pedidos. No recolectamos ni guardamos datos de tarjetas: los pagos se procesan en Mercado Pago.</p>
<h3>3. Para qué los usamos</h3>
<ul><li>Procesar y enviar tus pedidos y avisarte su estado.</li><li>Responder tus consultas.</li><li>Enviarte novedades, solo si te suscribiste (podés darte de baja cuando quieras).</li><li>Medir y mejorar la tienda y nuestros anuncios (por ejemplo, con el píxel de Meta).</li></ul>
<h3>4. Con quién los compartimos</h3>
<p>Solo con quienes necesitamos para operar: el procesador de pagos, el correo que hace el envío y nuestros proveedores de email y de medición. No vendemos tus datos.</p>
<h3>5. Tus derechos</h3>
<p>Podés pedir acceso, rectificación o supresión de tus datos escribiendo a <a href="mailto:${mail}">${mail}</a> (Ley 25.326). La Agencia de Acceso a la Información Pública, órgano de control de esa ley, atiende las denuncias y reclamos por incumplimiento de las normas de protección de datos.</p>
<h3>6. Cookies</h3>
<p>Usamos cookies para el carrito, la sesión y la medición. Podés borrarlas o bloquearlas desde tu navegador.</p>
`.trim();

const envios = `
<p>Enviamos a todo el país. El costo y las opciones de envío se muestran en el checkout antes de pagar.</p>
<h3>Plazos</h3>
<ul><li><strong>Stock inmediato:</strong> despachamos dentro de los días hábiles indicados al comprar.</li><li><strong>A pedido:</strong> se suma el tiempo de confección, que te informamos antes de confirmar.</li></ul>
<p>Cuando despachamos tu pedido te avisamos por email con los datos de seguimiento.</p>
<h3>Dudas</h3>
<p>Escribinos a <a href="mailto:${mail}">${mail}</a>.</p>
`.trim();

/** Valor por defecto de cada sección legal. `aRevisar` lo muestra el backoffice como aviso. */
export const TEXTOS_BASE = {
  terminos: { title: 'Términos y condiciones', content: terminos, aRevisar: true },
  privacidad: { title: 'Política de privacidad', content: privacidad, aRevisar: true },
  envíos: { title: 'Envíos', sections: [{ title: 'Envíos', content: envios }], aRevisar: true },
} as const;
