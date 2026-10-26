'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { SECCIONES_MENU, ubicacion } from './navegacion';
import { MARCA } from '@/config/marca';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const TIENDA_URL = (process.env.NEXT_PUBLIC_STORE_URL || MARCA.sitio.url).replace(/\/+$/, '');

/** Marca de la barra: el logo en letras (Playfair) y, con la barra angosta, solo la inicial. */
function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/" className="flex items-center overflow-hidden text-gray-900" aria-label={MARCA.nombre + ': ir al inicio'}>
      <span className={'font-display text-[15px] uppercase tracking-[0.3em] ' + (collapsed ? 'lg:hidden' : '')}>{MARCA.nombreLogo}</span>
      <span className={'hidden font-display text-xl italic ' + (collapsed ? 'lg:inline' : '')}>{MARCA.nombre.charAt(0)}</span>
    </Link>
  );
}

function Navegacion({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const actual = ubicacion(pathname)?.seccion.id;
  return (
    <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {SECCIONES_MENU.map((seccion) => {
          const activa = seccion.id === actual;
          const Icono = seccion.icon;
          return (
            <li key={seccion.id}>
              <Link
                href={seccion.href}
                title={collapsed ? seccion.label : undefined}
                aria-current={activa ? 'page' : undefined}
                className={
                  'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors ' +
                  (activa ? 'bg-gray-900/[0.06] font-semibold text-gray-900' : 'text-gray-600 hover:bg-gray-900/[0.04] hover:text-gray-900') +
                  (collapsed ? ' lg:justify-center lg:px-2' : '')
                }
              >
                <Icono className={'h-[18px] w-[18px] shrink-0 ' + (activa ? 'text-gray-900' : 'text-gray-500')} strokeWidth={1.6} />
                <span className={collapsed ? 'lg:hidden' : ''}>{seccion.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // En el celular, el menú se cierra al elegir una pantalla. La función se guarda en una referencia
  // porque cambia en cada render del layout y no debe volver a disparar el cierre.
  const cerrar = useRef(onMobileClose);
  cerrar.current = onMobileClose;
  useEffect(() => { cerrar.current(); }, [pathname]);

  useEffect(() => {
    const alTocarAfuera = (e: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) onMobileClose();
    };
    document.addEventListener('mousedown', alTocarAfuera);
    return () => document.removeEventListener('mousedown', alTocarAfuera);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[1px] lg:hidden" onClick={onMobileClose} />}

      <aside
        ref={sidebarRef}
        className={
          'fixed left-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-[#FBFBFA] transition-all duration-300 lg:sticky ' +
          (collapsed ? 'lg:!w-16' : 'lg:w-60') + ' ' +
          (mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <Logo collapsed={collapsed} />
          <button type="button" onClick={onMobileClose} aria-label="Cerrar menú" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Navegacion pathname={pathname} collapsed={collapsed} />

        <div className="shrink-0 border-t border-gray-200 p-3">
          <a
            href={TIENDA_URL} target="_blank" rel="noopener noreferrer" title="Ver la tienda"
            className={'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-gray-500 transition-colors hover:bg-gray-900/[0.04] hover:text-gray-900' + (collapsed ? ' lg:justify-center lg:px-2' : '')}
          >
            <ArrowUpRight className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
            <span className={collapsed ? 'lg:hidden' : ''}>Ver la tienda</span>
          </a>
        </div>
      </aside>
    </>
  );
}
