'use client';

import { useLinkDePago } from './useLinkDePago';
import BuscadorProductos from './BuscadorProductos';
import ItemsDelLink from './ItemsDelLink';
import DatosDelLink from './DatosDelLink';
import LinkCreado from './LinkCreado';
import LinksRecientes from './LinksRecientes';

/**
 * Link de pago: para ventas por WhatsApp o redes. Se arma el pedido, se crea
 * un link y la clienta paga en la tienda (Mercado Pago o transferencia). Usa
 * la misma API que el punto de venta, que puede estar apagado.
 */
export default function LinkDePagoPage() {
  const l = useLinkDePago();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Link de pago</h1>
        <p className="mt-0.5 text-sm text-gray-500">Armá un pedido para alguien que te escribió y mandale el link para que pague en la tienda.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">1. Productos</h2>
          <BuscadorProductos busqueda={l.busqueda} onBusqueda={l.setBusqueda} resultados={l.resultados} onAgregar={l.agregar} />
        </section>
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">2. Pedido y clienta</h2>
          <ItemsDelLink items={l.items} onCantidad={l.cambiarCantidad} />
          <DatosDelLink onCrear={l.crear} creando={l.creando} deshabilitado={l.items.length === 0} />
          {l.error && <p className="text-sm text-red-600" role="alert">{l.error}</p>}
          {l.creado && <LinkCreado url={l.creado.url} datos={l.creado.datos} />}
        </section>
      </div>
      <LinksRecientes links={l.links} />
    </div>
  );
}
