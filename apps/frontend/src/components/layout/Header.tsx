'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useMenuCategorias } from '@/hooks/useMenuCategorias';
import BrandLogo from '@/components/ui/BrandLogo';
import CartDrawer from '@/components/cart/CartDrawer';
import CartAddedFeedback from '@/components/cart/CartAddedFeedback';
import MobileNav from './MobileNav';
import HeaderSearch from './HeaderSearch';
import { isNavActive } from './navState';
import { MARCA } from '@/config/marca';

// Links informativos: en escritorio van en el pie; en el celular, al final del menú.
const LINKS_INFO = [
  { label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },
  { label: 'Preguntas frecuentes', href: '/faq' },
  { label: 'Contacto', href: '/contacto' },
];


function NavEscritorio() {
  const categorias = useMenuCategorias();
  const pathname = usePathname();
  const items = [
    { label: 'Colección', href: '/catalogo' },
    ...categorias.slice(0, 3).map((c) => ({ label: c.name, href: '/catalogo?categoria=' + c.slug })),
    { label: 'Colores', href: '/#colores' },
  ];
  return (
    <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={'rotulo py-1 transition-colors hover:text-bordo ' + (isNavActive(pathname, item.href) ? 'text-fg' : 'text-fg-soft')}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Acciones({ onCart, onSearch, itemCount, mounted }: { onCart: () => void; onSearch: () => void; itemCount: number; mounted: boolean }) {
  return (
    <div className="flex items-center justify-end gap-4 text-fg sm:gap-5">
      <button onClick={onSearch} className="transition-colors hover:text-bordo" aria-label="Buscar">
        <Search size={19} strokeWidth={1.5} />
      </button>
      <Link href="/cuenta" className="hidden transition-colors hover:text-bordo sm:block" aria-label="Mi cuenta">
        <User size={19} strokeWidth={1.5} />
      </Link>
      <button onClick={onCart} className="relative flex items-center gap-1.5 transition-colors hover:text-bordo" aria-label="Carrito">
        <ShoppingBag size={19} strokeWidth={1.5} />
        <span className="text-xs tabular-nums">{mounted ? itemCount : 0}</span>
      </button>
    </div>
  );
}

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-on-accent">
        <p className="rotulo !text-[10px] sm:!text-[11px]">Envíos a todo el país<span className="hidden sm:inline"> · Tu cartera en el color que elijas</span></p>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-line bg-page/95 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-20 lg:px-8">
          <div className="flex items-center">
            <button
              className="text-fg transition-colors hover:text-bordo lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
            <NavEscritorio />
          </div>

          <Link href="/" aria-label={MARCA.nombre + ' — Inicio'} className="text-fg">
            <BrandLogo size="md" />
          </Link>

          <Acciones onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(!searchOpen)} itemCount={itemCount} mounted={mounted} />
        </div>

        {searchOpen && (
          <div className="border-t border-line px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl"><HeaderSearch onSearch={() => setSearchOpen(false)} /></div>
          </div>
        )}

        {menuOpen && <MobileNav links={LINKS_INFO} onNavigate={() => setMenuOpen(false)} />}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <CartAddedFeedback />
    </>
  );
}
