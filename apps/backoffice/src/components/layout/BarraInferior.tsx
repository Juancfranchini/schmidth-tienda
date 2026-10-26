'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { SECCIONES_MENU, ubicacion } from './navegacion';

/**
 * Barra de abajo para el celular (como las apps de Shopify o Tiendanube): las
 * entradas de uso diario con el pulgar y "Menú" para el resto. En pantallas
 * grandes no se muestra: ahí manda la barra lateral.
 */
export function BarraInferior({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const actual = ubicacion(pathname)?.seccion.id;
  const principales = SECCIONES_MENU.filter((s) => s.enCelular).slice(0, 4);
  const enMenu = !!actual && !principales.some((s) => s.id === actual);

  const base = 'flex flex-col items-center gap-1 pb-1 pt-2.5 text-[10px] transition-colors ';
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {principales.map((s) => {
          const activa = s.id === actual;
          const Icono = s.icon;
          return (
            <li key={s.id}>
              <Link href={s.href} aria-current={activa ? 'page' : undefined} className={base + (activa ? 'font-semibold text-gray-900' : 'text-gray-500')}>
                <Icono className="h-5 w-5" strokeWidth={activa ? 2 : 1.5} />
                {s.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMenuClick} className={base + 'w-full ' + (enMenu ? 'font-semibold text-gray-900' : 'text-gray-500')}>
            <Menu className="h-5 w-5" strokeWidth={enMenu ? 2 : 1.5} />
            Menú
          </button>
        </li>
      </ul>
    </nav>
  );
}
