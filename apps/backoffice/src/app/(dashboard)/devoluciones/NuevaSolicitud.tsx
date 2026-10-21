'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import type { NuevaSolicitudDatos } from './useSolicitudes';

const schema = z.object({
  tipo: z.enum(['ARREPENTIMIENTO', 'CAMBIO', 'FALLA']),
  nombre: z.string().trim().min(2, 'Poné el nombre de la clienta').max(120),
  email: z.string().trim().email('Ese email no es válido').max(160),
  telefono: z.string().trim().max(40).optional(),
  pedidoNumero: z.string().trim().min(1, 'Poné el número de pedido').max(60),
  motivo: z.string().trim().max(2000).optional(),
});

const campo = 'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm normal-case tracking-normal focus:border-[#B3855C] focus:outline-none focus:ring-2 focus:ring-[#B3855C]/30';
const etiqueta = 'block text-xs font-medium uppercase tracking-wider text-gray-500';
const error = 'mt-1 block text-xs normal-case tracking-normal text-red-600';

/** Para lo que llega por WhatsApp, Instagram o en el local: queda registrado igual que lo de la tienda. */
export function NuevaSolicitud({ abierta, guardando, onCerrar, onCrear }: {
  abierta: boolean; guardando: boolean; onCerrar: () => void; onCrear: (d: NuevaSolicitudDatos) => Promise<boolean>;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NuevaSolicitudDatos>({
    resolver: zodResolver(schema), defaultValues: { tipo: 'CAMBIO' },
  });
  const enviar = async (d: NuevaSolicitudDatos) => { if (await onCrear(d)) reset(); };

  return (
    <Modal isOpen={abierta} onClose={onCerrar} title="Nueva solicitud" size="md">
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-3 p-5">
        <label className={etiqueta}>Tipo
          <select {...register('tipo')} className={campo}>
            <option value="CAMBIO">Cambio (talle, color, modelo)</option>
            <option value="FALLA">Falla o producto dañado</option>
            <option value="ARREPENTIMIENTO">Arrepentimiento de compra</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={etiqueta}>Nombre<input {...register('nombre')} className={campo} />
            {errors.nombre && <span className={error}>{errors.nombre.message}</span>}</label>
          <label className={etiqueta}>Número de pedido<input {...register('pedidoNumero')} placeholder="SCH-1001" className={campo} />
            {errors.pedidoNumero && <span className={error}>{errors.pedidoNumero.message}</span>}</label>
          <label className={etiqueta}>Email<input {...register('email')} type="email" className={campo} />
            {errors.email && <span className={error}>{errors.email.message}</span>}</label>
          <label className={etiqueta}>Teléfono (opcional)<input {...register('telefono')} type="tel" className={campo} /></label>
        </div>
        <label className={etiqueta}>Qué pasó (opcional)
          <textarea {...register('motivo')} rows={3} className={campo} />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onCerrar} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium">Cancelar</button>
          <button type="submit" disabled={guardando} className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300">
            {guardando ? 'Guardando…' : 'Crear solicitud'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
