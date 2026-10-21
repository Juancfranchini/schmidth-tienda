'use client';

import { X } from 'lucide-react';
import CatalogSidebar from './CatalogSidebar';

interface Props {
  open: boolean;
  onClose: () => void;
  sidebarProps: React.ComponentProps<typeof CatalogSidebar>;
}

/** Filtros en el celular: un panel que entra desde la izquierda sobre un velo suave. */
export default function CatalogMobileSidebar({ open, onClose, sidebarProps }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
      <div className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="panel-entra absolute bottom-0 left-0 top-0 flex w-[19rem] max-w-[85vw] flex-col overflow-y-auto bg-page px-6 pb-8 pt-5 shadow-2xl">
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="text-fg-muted transition-transform duration-300 hover:rotate-90 hover:text-fg">
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>
        <CatalogSidebar {...sidebarProps} />
        <button type="button" onClick={onClose} className="barrido rotulo mt-8 bg-ink py-4 text-on-accent">Ver modelos</button>
      </div>
    </div>
  );
}
