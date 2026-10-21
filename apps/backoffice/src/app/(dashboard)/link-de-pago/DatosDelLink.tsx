'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link2 } from 'lucide-react';
import type { DatosDelLink as Datos } from './useLinkDePago';

const schema = z.object({
  canal: z.enum(['WHATSAPP', 'INSTAGRAM', 'PHONE', 'SOCIAL']),
  nombre: z.string().trim().max(120).optional(),
  telefono: z.string().trim().max(40).optional(),
  email: z.union([z.literal(''), z.string().trim().email('Ese email no es válido').max(160)]).optional(),
  notas: z.string().trim().max(1000).optional(),
}).refine((d) => !(d.telefono || d.email) || !!d.nombre, { path: ['nombre'], message: 'Con teléfono o email, poné también el nombre' });

const CANALES = [
  { valor: 'WHATSAPP', texto: 'WhatsApp' },
  { valor: 'INSTAGRAM', texto: 'Instagram' },
  { valor: 'PHONE', texto: 'Teléfono' },
  { valor: 'SOCIAL', texto: 'Otra red' },
] as const;

const campo = 'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#B3855C] focus:outline-none focus:ring-2 focus:ring-[#B3855C]/30';
const etiqueta = 'block text-xs font-medium uppercase tracking-wider text-gray-500';

/** Datos opcionales de la clienta y canal de la venta. Con el teléfono, el link sale directo por WhatsApp. */
export default function DatosDelLink({ onCrear, creando, deshabilitado }: { onCrear: (d: Datos) => void; creando: boolean; deshabilitado: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Datos>({ resolver: zodResolver(schema), defaultValues: { canal: 'WHATSAPP' } });
  return (
    <form onSubmit={handleSubmit(onCrear)} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={etiqueta}>Nombre (opcional)<input {...register('nombre')} className={campo} />
          {errors.nombre && <span className="mt-1 block text-xs normal-case tracking-normal text-red-600">{errors.nombre.message}</span>}</label>
        <label className={etiqueta}>Teléfono (opcional)<input {...register('telefono')} type="tel" placeholder="11 1234-5678" className={campo} /></label>
        <label className={etiqueta}>Email (opcional)<input {...register('email')} type="email" className={campo} />
          {errors.email && <span className="mt-1 block text-xs normal-case tracking-normal text-red-600">{errors.email.message}</span>}</label>
        <label className={etiqueta}>Canal<select {...register('canal')} className={campo}>
          {CANALES.map((c) => <option key={c.valor} value={c.valor}>{c.texto}</option>)}
        </select></label>
      </div>
      <label className={etiqueta}>Nota interna (opcional)<textarea {...register('notas')} rows={2} className={campo + ' resize-none'} /></label>
      <button type="submit" disabled={creando || deshabilitado}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A] disabled:opacity-40">
        <Link2 className="h-4 w-4" />{creando ? 'Creando…' : 'Crear link de pago'}
      </button>
    </form>
  );
}
