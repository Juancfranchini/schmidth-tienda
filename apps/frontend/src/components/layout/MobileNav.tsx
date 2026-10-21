'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenuCategorias } from '@/hooks/useMenuCategorias';
import { isNavActive } from './navState';

interface Props {
  links: { label: string; href: string }[];
  onNavigate: () => void;
}

/**
 * Menú del celular: la colección, sus categorías y los colores arriba; debajo,
 * los links informativos que en escritorio van en el pie. Si la API no
 * responde, las categorías no aparecen y el resto sigue funcionando.
 */
export default function MobileNav({ links, onNavigate }: Props) {
  const categorias = useMenuCategorias();
  const pathname = usePathname();

  const principales = [
    { label: 'Toda la colección', href: '/catalogo' },
    ...categorias.map((c) => ({ label: c.name, href: '/catalogo?categoria=' + c.slug })),
    { label: 'Colores', href: '/#colores' },
    { label: 'A pedido', href: '/#a-pedido' },
  ];
  const secundarios = [...links, { label: 'Mi cuenta', href: '/cuenta' }];

  return (
    <nav className="max-h-[calc(100dvh-110px)] overflow-y-auto border-t border-line bg-page lg:hidden" aria-label="Navegación móvil">
      <ul className="px-6 py-4">
        {principales.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={isNavActive(pathname, link.href) ? 'page' : undefined}
              className="block border-b border-line py-3.5 font-display text-2xl text-fg transition-colors hover:text-bordo"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="px-6 pb-6">
        {secundarios.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onNavigate} className="rotulo block py-2.5 text-fg-soft transition-colors hover:text-bordo">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
