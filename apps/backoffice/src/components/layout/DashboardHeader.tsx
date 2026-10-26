'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ubicacion } from './navegacion';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onCollapseToggle: () => void;
  collapsed: boolean;
}

/**
 * Cabecera mínima: dónde estás (Sección / Pestaña) a la izquierda y la salida
 * a la derecha. El título de cada pantalla lo pone la pantalla; acá solo va la
 * ruta, que sale del mismo menú (navegacion.ts) para no desactualizarse.
 */
export function DashboardHeader({ onMenuClick, onCollapseToggle, collapsed }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lugar = ubicacion(pathname);

  const cerrarSesion = () => {
    localStorage.removeItem('bo_token');
    document.cookie = 'bo_token=; Max-Age=0; path=/';
    router.push('/login');
  };

  const boton = 'rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900';
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" onClick={onMenuClick} className={boton + ' lg:hidden'} aria-label="Abrir menú">
          <Menu className="h-5 w-5" strokeWidth={1.6} />
        </button>
        <button type="button" onClick={onCollapseToggle} className={boton + ' hidden lg:block'} aria-label={collapsed ? 'Expandir el menú' : 'Contraer el menú'}>
          {collapsed ? <PanelLeftOpen className="h-5 w-5" strokeWidth={1.6} /> : <PanelLeftClose className="h-5 w-5" strokeWidth={1.6} />}
        </button>
        {lugar && (
          <p className="truncate text-[13px] text-gray-500">
            <span className={lugar.seccion.label === lugar.pestana.label ? 'font-medium text-gray-900' : ''}>{lugar.seccion.label}</span>
            {lugar.seccion.label !== lugar.pestana.label && (
              <>
                <span className="mx-2 text-gray-300" aria-hidden>/</span>
                <span className="font-medium text-gray-900">{lugar.pestana.label}</span>
              </>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="mr-1 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:flex" aria-hidden>AD</span>
        <button type="button" onClick={cerrarSesion} className={boton + ' flex items-center gap-2 text-[13px]'} title="Cerrar sesión">
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
