'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronDown, Rocket } from 'lucide-react';
import type { PasoPuestaEnMarcha } from './tipos';

const CLAVE = 'inicio-puesta-en-marcha-abierta';

/**
 * Guía de lo que falta para vender de verdad. Se puede plegar (se recuerda en
 * el navegador) y desaparece sola cuando está todo listo.
 */
export default function PuestaEnMarcha({ pasos }: { pasos: PasoPuestaEnMarcha[] }) {
  const [abierta, setAbierta] = useState(true);
  useEffect(() => {
    try { setAbierta(localStorage.getItem(CLAVE) !== 'no'); } catch { /* sin almacenamiento: queda abierta */ }
  }, []);
  const alternar = () => {
    setAbierta((a) => {
      try { localStorage.setItem(CLAVE, a ? 'no' : 'si'); } catch { /* sin almacenamiento: vale para esta visita */ }
      return !a;
    });
  };

  const listos = pasos.filter((p) => p.listo).length;
  if (pasos.length === 0 || listos === pasos.length) return null;
  const porcentaje = Math.round((listos / pasos.length) * 100);

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={alternar} aria-expanded={abierta} className="flex w-full items-center gap-3 p-5 text-left">
        <Rocket className="h-5 w-5 shrink-0 text-[#B3855C]" />
        <span className="flex-1">
          <span className="block text-base font-semibold text-gray-900">Puesta en marcha</span>
          <span className="block text-xs text-gray-500">{listos} de {pasos.length} listos para vender de verdad</span>
        </span>
        <span className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-gray-100 sm:block" aria-hidden>
          <span className="block h-full bg-[#B3855C]" style={{ width: porcentaje + '%' }} />
        </span>
        <ChevronDown className={'h-4 w-4 text-gray-400 transition-transform ' + (abierta ? 'rotate-180' : '')} />
      </button>
      {abierta && (
        <ul className="divide-y divide-gray-100 border-t border-gray-100">
          {pasos.map((p) => (
            <li key={p.clave}>
              <Link href={p.href} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50">
                {p.listo ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />}
                <span className={p.listo ? 'text-sm text-gray-400 line-through' : 'text-sm text-gray-900'}>
                  {p.titulo}
                  {!p.listo && <span className="block text-xs text-gray-500">{p.detalle}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
