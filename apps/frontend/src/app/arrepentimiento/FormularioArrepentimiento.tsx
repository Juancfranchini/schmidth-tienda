'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MARCA } from '@/config/marca';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const schema = z.object({
  nombre: z.string().trim().min(1, 'Escribí tu nombre').max(120),
  email: z.string().trim().email('Ese email no es válido').max(160),
  telefono: z.string().trim().max(40).optional(),
  pedido: z.string().trim().min(1, 'Escribí el número de pedido').max(60),
  motivo: z.string().trim().max(2000).optional(),
});
type Datos = z.infer<typeof schema>;

const campo = 'w-full border-b border-line bg-transparent py-3 text-base text-fg placeholder-fg-muted focus:border-fg focus:outline-none';

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="rotulo text-fg-soft">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-bordo" role="alert">{error}</span>}
    </label>
  );
}

/** Formulario del botón de arrepentimiento. Si sale bien, muestra el código de la solicitud. */
export default function FormularioArrepentimiento() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [sinMail, setSinMail] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Datos>({ resolver: zodResolver(schema) });

  const enviar = async (datos: Datos) => {
    setError('');
    try {
      const res = await fetch(API_URL + '/contact/arrepentimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, telefono: datos.telefono || undefined, motivo: datos.motivo || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { codigo?: string; avisoEnviado?: boolean; message?: string | string[] };
      if (!res.ok || !data.codigo) {
        setError((Array.isArray(data.message) ? data.message.join(' · ') : data.message) || 'No pudimos registrar tu pedido.');
        return;
      }
      setCodigo(data.codigo);
      setSinMail(data.avisoEnviado === false);
    } catch {
      setError('No pudimos conectarnos.');
    }
  };

  if (codigo) {
    return (
      <div className="border border-line bg-panel p-8 text-center">
        <p className="rotulo text-bordo">Recibimos tu pedido</p>
        <p className="mt-4 font-display text-3xl text-fg">{codigo}</p>
        <p className="mt-4 text-fg-soft">
          {sinMail
            ? 'Es el código de tu solicitud: guardalo. No pudimos mandarte el mail, pero el pedido quedó registrado y te escribimos para coordinar la devolución.'
            : 'Es el código de tu solicitud. También te lo mandamos por mail. Te escribimos para coordinar la devolución.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <Campo label="Nombre y apellido" error={errors.nombre?.message}><input {...register('nombre')} autoComplete="name" className={campo} /></Campo>
      <Campo label="Email" error={errors.email?.message}><input {...register('email')} type="email" autoComplete="email" className={campo} /></Campo>
      <Campo label="Teléfono (opcional)" error={errors.telefono?.message}><input {...register('telefono')} type="tel" autoComplete="tel" className={campo} /></Campo>
      <Campo label="Número de pedido" error={errors.pedido?.message}><input {...register('pedido')} placeholder={MARCA.prefijoPedido + '-…'} className={campo} /></Campo>
      <Campo label="Motivo (opcional)" error={errors.motivo?.message}><textarea {...register('motivo')} rows={3} className={campo + ' resize-none'} /></Campo>
      {error && (
        <p className="text-sm text-bordo" role="alert">
          {error} Mail: <a href={'mailto:' + MARCA.email.contacto} className="underline">{MARCA.email.contacto}</a>.
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className="rotulo w-full bg-ink py-4 text-on-accent transition-colors hover:bg-bordo disabled:opacity-50">
        {isSubmitting ? 'Enviando…' : 'Cancelar mi compra'}
      </button>
    </form>
  );
}
