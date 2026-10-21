import Link from 'next/link';
import { Mail, MessageCircle, ShoppingBag } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import type { CambiosFicha, DetalleContacto } from './tipos';
import { fechaCorta, pesos, whatsappDe } from './formato';
import { Avatar, InsigniaEtapa } from './CrmTabla';
import { CrmSeguimiento } from './CrmSeguimiento';
import { CrmNotas } from './CrmNotas';

const ESTADOS: Record<string, string> = {
  PENDING: 'Esperando el pago', PAID: 'Pagado', SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};

const TARJETA = 'rounded-xl border border-gray-200 bg-white p-4';

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2.5">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{titulo}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{valor}</p>
    </div>
  );
}

function Cabecera({ d }: { d: DetalleContacto }) {
  const c = d.contacto;
  const whatsapp = whatsappDe(c.telefono);
  return (
    <div className={TARJETA}>
      <div className="flex items-center gap-3">
        <Avatar nombre={c.nombre} grande />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">{c.nombre}</p>
          <p className="truncate text-sm text-gray-500">{c.email}</p>
          {c.telefono && <p className="text-sm text-gray-500">{c.telefono}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <InsigniaEtapa etapa={c.etapa} />
        <span className="text-xs text-gray-500">{c.tieneCuenta ? 'Con cuenta' : 'Sin cuenta (invitado)'}{c.suscripto ? ' · Recibe novedades' : ''}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <a href={'mailto:' + c.email} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><Mail className="h-4 w-4" />Mail</a>
        {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Dato titulo="Pedidos" valor={String(c.pedidos)} />
        <Dato titulo="Gastado" valor={pesos(c.gastado)} />
        <Dato titulo="Cliente desde" valor={c.clienteDesde ? fechaCorta(c.clienteDesde) : '—'} />
      </div>
    </div>
  );
}

function CarritoPendiente({ carrito }: { carrito: NonNullable<DetalleContacto['carrito']> }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <h3 className="text-sm font-semibold text-rose-800">Carrito sin terminar · {pesos(carrito.total)}</h3>
      <ul className="mt-2 space-y-0.5 text-sm text-rose-900">
        {carrito.items.map((i, n) => <li key={n}>{i.quantity ?? 1} × {i.name ?? 'Producto'}</li>)}
      </ul>
      <p className="mt-1 text-xs text-rose-700">Actualizado el {fechaCorta(carrito.actualizado)}</p>
    </div>
  );
}

function Pedidos({ pedidos }: { pedidos: DetalleContacto['pedidos'] }) {
  return (
    <section className={TARJETA}>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900"><ShoppingBag className="h-4 w-4" />Pedidos</h3>
      <ul className="mt-2 divide-y divide-gray-100">
        {pedidos.map((p) => (
          <li key={p.id} className="py-2.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <Link href="/pedidos" className="font-medium text-gray-900 hover:underline">#{p.number}</Link>
              <span className="font-semibold">{pesos(p.total)}</span>
            </div>
            <p className="text-xs text-gray-500">{fechaCorta(p.createdAt)} · {ESTADOS[p.status] ?? p.status}</p>
            <p className="mt-0.5 text-xs text-gray-600">{p.productos.map((x) => x.cantidad + ' × ' + x.nombre).join(', ')}</p>
          </li>
        ))}
        {pedidos.length === 0 && <li className="py-2 text-sm text-gray-400">Todavía no hizo pedidos.</li>}
      </ul>
    </section>
  );
}

interface Props {
  detalle: DetalleContacto | null;
  cargando: boolean;
  error: string;
  onGuardar: (cambios: CambiosFicha) => Promise<void>;
  onAgregarNota: (texto: string) => Promise<void>;
  onBorrarNota: (id: string) => Promise<void>;
}

export function CrmFicha({ detalle, cargando, error, onGuardar, onAgregarNota, onBorrarNota }: Props) {
  if (cargando) return <PageLoader />;
  if (error) return <p className="p-6 text-sm text-rose-600">{error}</p>;
  if (!detalle) return null;
  return (
    <div className="space-y-3 p-4">
      <Cabecera d={detalle} />
      {detalle.carrito && <CarritoPendiente carrito={detalle.carrito} />}
      <CrmSeguimiento contacto={detalle.contacto} onGuardar={onGuardar} />
      <CrmNotas notas={detalle.notas} onAgregar={onAgregarNota} onBorrar={onBorrarNota} />
      <Pedidos pedidos={detalle.pedidos} />
    </div>
  );
}
