'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useSolicitudes } from './useSolicitudes';
import { SolicitudesLista } from './SolicitudesLista';
import { SolicitudDetalle } from './SolicitudDetalle';
import { NuevaSolicitud } from './NuevaSolicitud';
import { enPestana, Pestana, PESTANAS } from './tipos';

/**
 * Devoluciones: lo que pide la clienta después de comprar. Los arrepentimientos
 * del botón de la tienda entran solos; cambios y fallas se cargan acá. El
 * reintegro y el stock se siguen registrando en el pedido.
 */
export default function DevolucionesPage() {
  const { solicitudes, cargando, guardando, actualizar, crear } = useSolicitudes();
  const [pestana, setPestana] = useState<Pestana>('abiertas');
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  // Desde la línea de tiempo del pedido se llega con ?codigo=…: se abre esa solicitud.
  const pedidaPorLink = useRef(false);
  useEffect(() => {
    if (pedidaPorLink.current || cargando) return;
    pedidaPorLink.current = true;
    const codigo = new URLSearchParams(window.location.search).get('codigo');
    const encontrada = codigo ? solicitudes.find((s) => s.codigo === codigo) : undefined;
    if (encontrada) { setAbiertaId(encontrada.id); setPestana('todas'); }
  }, [solicitudes, cargando]);

  const cuentas = useMemo(
    () => Object.fromEntries(PESTANAS.map((p) => [p.valor, solicitudes.filter((s) => enPestana(s, p.valor)).length])) as Record<Pestana, number>,
    [solicitudes],
  );
  const visibles = solicitudes.filter((s) => enPestana(s, pestana));
  const abierta = solicitudes.find((s) => s.id === abiertaId) ?? null;

  if (cargando) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devoluciones</h1>
          <p className="mt-0.5 text-sm text-gray-500">Arrepentimientos, cambios y fallas · {cuentas.abiertas} para resolver</p>
        </div>
        <button type="button" onClick={() => setCreando(true)} className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Nueva solicitud
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-gray-200 bg-white p-3">
        {PESTANAS.map((p) => {
          const activa = pestana === p.valor;
          return (
            <button key={p.valor} type="button" onClick={() => setPestana(p.valor)}
              className={'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ' + (activa ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}>
              {p.texto}
              <span className={'rounded-full px-1.5 text-[10px] font-bold ' + (activa ? 'bg-[#B3855C] text-[#1A1A1A]' : 'bg-gray-100 text-gray-500')}>{cuentas[p.valor]}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0
        ? <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">{pestana === 'abiertas' ? 'No hay nada para resolver. ¡Bien!' : 'No hay solicitudes acá.'}</div>
        : <SolicitudesLista solicitudes={visibles} onAbrir={(s) => setAbiertaId(s.id)} />}

      <SolicitudDetalle solicitud={abierta} guardando={guardando} onCerrar={() => setAbiertaId(null)}
        onGuardar={async (id, d) => { if (await actualizar(id, d)) setAbiertaId(null); }} />
      <NuevaSolicitud abierta={creando} guardando={guardando} onCerrar={() => setCreando(false)}
        onCrear={async (d) => { const s = await crear(d); if (s) setCreando(false); return Boolean(s); }} />
    </div>
  );
}
