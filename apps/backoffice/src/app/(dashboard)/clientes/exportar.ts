import { ETAPAS, fechaCorta } from './formato';
import type { Contacto } from './tipos';

/** Un texto que empieza con = + - @ lo ejecutaría Excel como fórmula: se le antepone una comilla simple. */
const comillas = (v: string | number | null) => {
  const texto = String(v ?? '');
  const seguro = typeof v === 'string' && /^[=+\-@]/.test(texto) ? "'" + texto : texto;
  return '"' + seguro.replace(/"/g, '""') + '"';
};

/** CSV que Excel abre bien en español (separador ";", con BOM para las tildes). */
export function descargarCsv(contactos: Contacto[]): void {
  const cabecera = ['Nombre', 'Mail', 'Teléfono', 'Etapa', 'Pedidos', 'Gastado', 'Cliente desde', 'Último movimiento', 'Etiquetas', 'Próxima acción'];
  const filas = contactos.map((c) => [
    c.nombre, c.email, c.telefono, ETAPAS[c.etapa].texto, c.pedidos, c.gastado,
    c.clienteDesde ? fechaCorta(c.clienteDesde) : '', fechaCorta(c.ultimoMovimiento), c.etiquetas.join(', '), c.proximaAccion,
  ]);
  const texto = [cabecera, ...filas].map((f) => f.map(comillas).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + texto], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'clientes-' + new Date().toISOString().slice(0, 10) + '.csv';
  enlace.click();
  URL.revokeObjectURL(url);
}
