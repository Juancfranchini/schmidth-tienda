import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShoppingBag, CreditCard, ShoppingCart, Link2, PackageOpen } from 'lucide-react';
import type { Tarea } from './tipos';

const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  paraPreparar: ShoppingBag,
  porCobrar: CreditCard,
  carritos: ShoppingCart,
  links: Link2,
  stock: PackageOpen,
};

/** Lo pendiente del día, cada cosa con un acceso directo a la pantalla donde se resuelve. */
export default function ParaHacerHoy({ tareas }: { tareas: Tarea[] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Para hacer hoy</h2>
      {tareas.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="h-5 w-5 text-green-600" /> Todo al día: no hay pedidos, cobros ni carritos pendientes.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tareas.map((t) => {
            const Icono = ICONOS[t.clave] ?? ShoppingBag;
            return (
              <li key={t.clave}>
                <Link href={t.href} className="group flex h-full items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#B3855C] hover:bg-[#B3855C]/5">
                  <Icono className="mt-0.5 h-5 w-5 shrink-0 text-[#B3855C]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-gray-900"><strong className="text-lg">{t.cantidad}</strong> {t.titulo}</span>
                    <span className="block text-xs text-gray-500">{t.detalle}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#B3855C]" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
