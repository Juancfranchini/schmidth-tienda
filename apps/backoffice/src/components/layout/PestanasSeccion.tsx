'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { pestanaActiva, rutaActiva, ubicacion } from './navegacion';

/**
 * Pestañas de la sección abierta (Pedidos → Pedidos · Devoluciones · …), con una
 * segunda fila cuando una pestaña agrupa varias pantallas, y el botón de acción
 * de la sección. En el celular las pestañas se deslizan de costado.
 */
export function PestanasSeccion() {
  const pathname = usePathname();
  const lugar = ubicacion(pathname);
  if (!lugar) return null;
  const { seccion, pestana: actual } = lugar;
  const accion = seccion.accion && !rutaActiva(pathname, seccion.accion.href) ? seccion.accion : null;
  if (seccion.pestanas.length < 2 && !accion) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200">
        <nav aria-label={'Pantallas de ' + seccion.label} className="sin-barra -mb-px flex gap-6 overflow-x-auto">
          {seccion.pestanas.map((p) => {
            const activa = pestanaActiva(pathname, p);
            return (
              <Link
                key={p.href} href={p.href} aria-current={activa ? 'page' : undefined}
                className={
                  'whitespace-nowrap border-b-2 py-3 text-[13px] transition-colors ' +
                  (activa ? 'border-gray-900 font-semibold text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900')
                }
              >
                {p.label}
              </Link>
            );
          })}
        </nav>
        {accion && (
          <Link href={accion.href} aria-label={accion.label} title={accion.label} className="mb-2 inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gray-900 px-2.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-700 sm:px-3">
            <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{accion.label}</span>
          </Link>
        )}
      </div>

      {actual.sub && (
        <nav aria-label={'Dentro de ' + actual.label} className="sin-barra -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 pt-4 sm:mx-0 sm:px-0">
          {actual.sub.map((s) => {
            const activa = rutaActiva(pathname, s.href);
            return (
              <Link
                key={s.href} href={s.href} aria-current={activa ? 'page' : undefined}
                className={
                  'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs transition-colors ' +
                  (activa ? 'border-gray-900 bg-gray-900 font-medium text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900')
                }
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
