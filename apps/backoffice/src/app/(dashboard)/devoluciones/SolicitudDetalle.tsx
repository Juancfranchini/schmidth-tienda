'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MessageCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import { fechaCorta, whatsappDe } from '../pedidos/formato';
import { ESTADOS, haceCuanto, EstadoSolicitud, Solicitud, TIPOS } from './tipos';

const schema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_CURSO', 'RESUELTA', 'RECHAZADA']),
  notas: z.string().trim().max(4000, 'Hasta 4000 caracteres'),
});
type Datos = z.infer<typeof schema>;

const campo = 'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#B3855C] focus:outline-none focus:ring-2 focus:ring-[#B3855C]/30';

function Contacto({ s }: { s: Solicitud }) {
  const whatsapp = whatsappDe(s.telefono);
  return (
    <section className="space-y-1 rounded-xl border border-gray-200 bg-white p-4 text-sm">
      <p className="font-semibold text-gray-900">{s.nombre}</p>
      <a href={'mailto:' + s.email + '?subject=' + encodeURIComponent('Tu solicitud ' + s.codigo)} className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
        <Mail className="h-4 w-4" />{s.email}
      </a>
      {s.telefono && (whatsapp
        ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-700 hover:text-green-600"><MessageCircle className="h-4 w-4" />{s.telefono}</a>
        : <p className="text-gray-700">{s.telefono}</p>)}
    </section>
  );
}

function Pedido({ s }: { s: Solicitud }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
      <h3 className="mb-1 font-semibold text-gray-900">Pedido</h3>
      {s.order ? (
        <>
          <Link href={'/pedidos?q=' + encodeURIComponent(s.order.number)} className="font-medium text-blue-700 hover:underline">#{s.order.number}</Link>
          <p className="text-xs text-gray-500">{fechaCorta(s.order.createdAt)} · {formatPrice(s.order.total)} · {haceCuanto(s.order.createdAt)}</p>
        </>
      ) : (
        <p className="text-gray-600">La clienta escribió «{s.pedidoNumero}» y no coincide con ningún pedido. Buscalo por su mail.</p>
      )}
    </section>
  );
}

export function SolicitudDetalle({ solicitud, guardando, onGuardar, onCerrar }: {
  solicitud: Solicitud | null; guardando: boolean; onGuardar: (id: string, d: { estado: EstadoSolicitud; notas: string }) => void; onCerrar: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<Datos>({ resolver: zodResolver(schema) });
  useEffect(() => { if (solicitud) reset({ estado: solicitud.estado, notas: solicitud.notas || '' }); }, [solicitud, reset]);
  if (!solicitud) return null;
  const s = solicitud;

  return (
    <Modal isOpen onClose={onCerrar} title={TIPOS[s.tipo] + ' · ' + s.codigo} size="lg">
      <div className="grid gap-4 bg-gray-50 p-4 sm:p-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p className="text-xs text-gray-500">Entró el {fechaCorta(s.createdAt)} desde {s.origen === 'tienda' ? 'la tienda' : 'el panel'} · {haceCuanto(s.createdAt)}</p>
            <p className="mt-2 whitespace-pre-line">{s.motivo || 'Sin motivo escrito.'}</p>
          </section>
          <form onSubmit={handleSubmit((d) => onGuardar(s.id, d))} noValidate className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-xs font-medium text-gray-500">Estado
              <select {...register('estado')} className={campo}>
                {(Object.keys(ESTADOS) as EstadoSolicitud[]).map((e) => <option key={e} value={e}>{ESTADOS[e].texto}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-gray-500">Notas internas (la clienta no las ve)
              <textarea {...register('notas')} rows={4} className={campo} placeholder="Ej.: le ofrecimos cambio por el color suela; retira el viernes." />
              {errors.notas && <span className="mt-1 block text-xs text-red-600">{errors.notas.message}</span>}
            </label>
            <button type="submit" disabled={!isDirty || guardando} className="w-full rounded-lg bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400">
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            {s.tipo === 'ARREPENTIMIENTO' && <p className="text-xs text-gray-500">El reintegro o la devolución del stock se cargan en el pedido, en «Cambio o devolución».</p>}
          </form>
        </div>
        <div className="space-y-4"><Contacto s={s} /><Pedido s={s} /></div>
      </div>
    </Modal>
  );
}
