import Link from 'next/link';
import { Plus, Link2, ExternalLink } from 'lucide-react';

const TIENDA = (process.env.NEXT_PUBLIC_STORE_URL || '').replace(/\/+$/, '');

/** Saludo con la fecha y los accesos que más se usan. */
export default function Encabezado() {
  const fecha = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  const boton = 'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors';
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inicio</h1>
        <p className="mt-0.5 text-sm text-gray-500 first-letter:uppercase">{fecha}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/link-de-pago" className={boton + ' border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'}>
          <Link2 className="h-4 w-4" /> Crear link de pago
        </Link>
        <Link href="/productos?nuevo=1" className={boton + ' border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Link>
        {TIENDA && (
          <a href={TIENDA} target="_blank" rel="noopener noreferrer" className={boton + ' border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}>
            <ExternalLink className="h-4 w-4" /> Ver tienda
          </a>
        )}
      </div>
    </div>
  );
}
