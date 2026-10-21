import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Cifra, Hoy } from './tipos';

function Variacion({ v }: { v: number | null }) {
  if (v === null) return <span className="text-xs text-gray-400">sin datos para comparar</span>;
  const Icono = v > 0 ? TrendingUp : v < 0 ? TrendingDown : Minus;
  const color = v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-gray-500';
  return (
    <span className={'flex items-center gap-1 text-xs font-medium ' + color}>
      <Icono className="h-3.5 w-3.5" />{v > 0 ? '+' : ''}{v}% vs. 30 días anteriores
    </span>
  );
}

function Tarjeta({ titulo, valor, cifra }: { titulo: string; valor: string; cifra: Cifra }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{titulo}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{valor}</p>
      <div className="mt-1"><Variacion v={cifra.variacion} /></div>
    </div>
  );
}

/** Últimos 30 días contra los 30 anteriores: ventas, pedidos y ticket promedio (sin cancelados ni pruebas). */
export default function Resumen30({ datos }: { datos: Hoy['ultimos30'] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Últimos 30 días</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Tarjeta titulo="Ventas" valor={formatPrice(datos.ventas.valor)} cifra={datos.ventas} />
        <Tarjeta titulo="Pedidos" valor={String(datos.pedidos.valor)} cifra={datos.pedidos} />
        <Tarjeta titulo="Ticket promedio" valor={formatPrice(datos.ticket.valor)} cifra={datos.ticket} />
      </div>
    </section>
  );
}
