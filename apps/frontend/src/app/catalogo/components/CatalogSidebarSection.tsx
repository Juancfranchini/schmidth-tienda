'use client';

import CatalogSidebarButton from './CatalogSidebarButton';

interface Props {
  label: string;
  /** Filtro aplicado hoy, para verlo sin abrir la sección. */
  value?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Filtro plegable de la barra lateral, separado por líneas finas. Se despliega
 * debajo del control (la grilla de productos no se mueve) y se abre con una
 * transición de altura suave; cerrado queda inerte para el teclado.
 */
export default function CatalogSidebarSection({ label, value, open, onToggle, children }: Props) {
  return (
    <div className="border-b border-line">
      <CatalogSidebarButton label={label} value={value} expanded={open} onClick={onToggle} />
      <div className={'grid transition-[grid-template-rows,opacity] duration-500 ease-out ' + (open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} inert={!open}>
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
