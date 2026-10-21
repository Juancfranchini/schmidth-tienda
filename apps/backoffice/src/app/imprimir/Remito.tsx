import { MARCA } from '@/config/marca';
import { formatPrice } from '@/lib/utils';
import type { Pedido } from '../(dashboard)/pedidos/tipos';
import { fechaCorta, formaDeEntrega, mailCliente, medioDePago, nombreCliente, unidades } from '../(dashboard)/pedidos/formato';

/** Una hoja por pedido: lo que hay que meter en el paquete y a quién va. */
export function Remito({ pedido }: { pedido: Pedido }) {
  const entrega = formaDeEntrega(pedido);
  return (
    <article className="remito mx-auto max-w-[720px] bg-white p-8 text-[13px] text-gray-900">
      <header className="flex items-start justify-between border-b border-gray-300 pb-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.3em] text-[#1A1A1A]">{MARCA.nombreLogo}</p>
          <p className="mt-1 text-xs text-gray-500">{MARCA.eslogan}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">Pedido #{pedido.number}</p>
          <p className="text-xs text-gray-500">{fechaCorta(pedido.createdAt)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-6 py-4">
        <div>
          <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Cliente</h2>
          <p className="font-semibold">{nombreCliente(pedido)}</p>
          {mailCliente(pedido) && <p>{mailCliente(pedido)}</p>}
          {pedido.buyerPhone && <p>{pedido.buyerPhone}</p>}
        </div>
        <div>
          <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{entrega.esRetiro ? 'Retiro' : 'Envío'}</h2>
          <p className="font-semibold">{entrega.texto}</p>
          {!entrega.esRetiro && pedido.address && <p>{pedido.address}</p>}
          {pedido.trackingNumber && <p>Seguimiento: {pedido.trackingNumber}</p>}
        </div>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-gray-300 text-left text-[11px] uppercase tracking-wide text-gray-500">
            <th className="w-8 py-2">✓</th><th className="py-2">Producto</th><th className="py-2">SKU</th><th className="py-2 text-right">Cant.</th><th className="py-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {(pedido.items || []).map((i) => (
            <tr key={i.id} className="border-b border-gray-200 align-top">
              <td className="py-2"><span className="inline-block h-3.5 w-3.5 border border-gray-500" /></td>
              <td className="py-2">
                <p className="font-medium">{i.product.name}</p>
                {(i.variant?.color || i.variant?.size) && <p className="text-xs text-gray-500">{[i.variant?.color, i.variant?.size].filter(Boolean).join(' · ')}</p>}
              </td>
              <td className="py-2 text-xs">{i.product.sku}</td>
              <td className="py-2 text-right font-semibold">{i.quantity}</td>
              <td className="py-2 text-right">{formatPrice(i.price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-4 flex justify-between gap-6">
        <div className="text-xs text-gray-600">
          <p>{unidades(pedido)} {unidades(pedido) === 1 ? 'unidad' : 'unidades'} · Pago: {medioDePago(pedido)}</p>
          {(pedido.bolsasRegalo ?? 0) > 0 && <p className="mt-1 font-semibold text-gray-900">Para regalo: incluir {pedido.bolsasRegalo} bolsa(s)</p>}
        </div>
        <dl className="w-56 space-y-0.5">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(pedido.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío</dt><dd>{pedido.shipping > 0 ? formatPrice(pedido.shipping) : 'Gratis'}</dd></div>
          {pedido.discount > 0 && <div className="flex justify-between"><dt>Descuento</dt><dd>−{formatPrice(pedido.discount)}</dd></div>}
          <div className="flex justify-between border-t border-gray-300 pt-1 font-bold"><dt>Total</dt><dd>{formatPrice(pedido.total)}</dd></div>
        </dl>
      </section>

      <footer className="mt-8 border-t border-gray-200 pt-3 text-center text-[11px] text-gray-500">
        Gracias por elegir {MARCA.nombre}. Tenés 10 días corridos desde que lo recibís para arrepentirte de la compra.
      </footer>
    </article>
  );
}
