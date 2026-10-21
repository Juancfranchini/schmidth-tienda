import type { Metadata } from 'next';
import Link from 'next/link';
import FormularioArrepentimiento from './FormularioArrepentimiento';

export const metadata: Metadata = {
  title: 'Botón de arrepentimiento',
  description: 'Cancelá tu compra dentro de los 10 días corridos desde que recibiste el pedido.',
  alternates: { canonical: '/arrepentimiento' },
};

/** Botón de arrepentimiento (Res. 424/2020 y art. 34 de la Ley 24.240). Link fijo en el pie del sitio. */
export default function ArrepentimientoPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-14 sm:px-8 lg:py-20">
      <p className="rotulo mb-3 text-bordo">Botón de arrepentimiento</p>
      <h1 className="text-4xl sm:text-5xl">Cancelar una compra</h1>
      <span className="guion mt-6 text-fg" aria-hidden />
      <div className="mt-6 space-y-3 text-fg-soft">
        <p>Tenés 10 días corridos desde que recibiste el pedido para cancelar la compra, sin costo y sin dar explicaciones. Completá el formulario y te mandamos un código de tu solicitud.</p>
        <p className="text-sm">Las carteras confeccionadas a pedido en un color elegido por vos no tienen derecho de arrepentimiento, salvo falla. Más información en <Link href="/politica-de-devolucion" className="underline">cambios y devoluciones</Link>.</p>
      </div>
      <div className="mt-10"><FormularioArrepentimiento /></div>
    </div>
  );
}
