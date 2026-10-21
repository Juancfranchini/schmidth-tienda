'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FOTO_NEWSLETTER } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';
import { MARCA } from '@/config/marca';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const schema = z.object({
  email: z.string().trim().min(1, 'Escribí tu email').email('Ese email no es válido'),
});
type Datos = z.infer<typeof schema>;

/** Suscripción al newsletter (POST /newsletter/subscribe). */
export default function Newsletter() {
  const [estado, setEstado] = useState<'idle' | 'ok' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Datos>({ resolver: zodResolver(schema) });

  const enviar = async ({ email }: Datos) => {
    try {
      const res = await fetch(API_URL + '/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      if (!res.ok) {
        setEstado('error');
        setMensaje(Array.isArray(data.message) ? data.message.join(' · ') : data.message || 'No pudimos suscribirte. Probá de nuevo.');
        return;
      }
      setEstado('ok');
      reset();
    } catch {
      setEstado('error');
      setMensaje('No pudimos conectarnos. Probá de nuevo en un rato.');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="grid overflow-hidden bg-night lg:grid-cols-[1fr_1.2fr]">
        <div className="hidden aspect-[4/5] lg:block">
          <img src={FOTO_NEWSLETTER.src} alt={FOTO_NEWSLETTER.alt} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16">
        <div>
          <p className="rotulo mb-4 text-bordo">El club {MARCA.nombre}</p>
          <TituloEditorial texto="Enterate *primero* de los modelos nuevos" className="text-4xl leading-tight sm:text-5xl" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-soft">Lanzamientos, colores nuevos y ediciones limitadas. Sin spam: solo cuando hay algo lindo para contarte.</p>
        </div>
        {estado === 'ok' ? (
          <p className="font-display text-2xl text-fg">¡Listo! Te vamos a escribir cuando haya novedades.</p>
        ) : (
          <form onSubmit={handleSubmit(enviar)} noValidate className="w-full">
            <div className="flex border-b border-fg">
              <label htmlFor="newsletter-email" className="sr-only">Email</label>
              <input id="newsletter-email" type="email" autoComplete="email" placeholder="Tu email" {...register('email')}
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-fg placeholder-fg-muted focus:outline-none" />
              <button type="submit" disabled={isSubmitting} className="rotulo px-2 text-fg transition-colors hover:text-bordo disabled:opacity-50">
                {isSubmitting ? 'Enviando…' : 'Suscribirme'}
              </button>
            </div>
            {(errors.email || estado === 'error') && (
              <p className="mt-2 text-xs text-bordo" role="alert">{errors.email?.message ?? mensaje}</p>
            )}
          </form>
        )}
        </div>
      </div>
    </section>
  );
}
