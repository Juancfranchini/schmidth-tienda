import { createElement } from 'react';
import { Truck, CreditCard, RefreshCw, Shield, Package, Headphones, type LucideIcon } from 'lucide-react';
import type { Benefit } from '@/types';

const ICONOS: Record<string, LucideIcon> = { Truck, CreditCard, RefreshCw, Shield, Package, Headphones };

/** Beneficios cargados en el backoffice, en una fila sobria. */
export default function Beneficios({ benefits }: { benefits: Benefit[] }) {
  const visibles = benefits.filter((b) => b.active !== false).slice(0, 4);
  if (visibles.length === 0) return null;
  return (
    <section className="border-b border-line">
      <ul className="mx-auto grid max-w-7xl divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {visibles.map((b) => (
          <li key={b.id ?? b.title} className="flex items-center gap-4 py-6 sm:justify-center sm:px-6 sm:py-10">
            {createElement(ICONOS[b.icon] ?? Package, { size: 22, strokeWidth: 1.25, className: 'shrink-0 text-bordo' })}
            <span>
              <span className="block text-sm text-fg">{b.title}</span>
              {b.description && <span className="block text-xs text-fg-muted">{b.description}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
