'use client';

import { Building2, Home } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CheckoutFormData } from './checkoutSchema';

const NOMBRES: Partial<Record<CheckoutFormData['shippingMethod'], string>> = { correo_argentino: 'Correo Argentino', andreani: 'Andreani' };

/** Transportistas que dejan elegir entre domicilio y sucursal. */
export const conSucursal = (metodo: CheckoutFormData['shippingMethod']) => metodo in NOMBRES;

const opcion = (activa: boolean) =>
  'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ' +
  (activa ? 'border-[#B7D31A] bg-[#B7D31A]/10 text-fg' : 'border-chip text-fg-soft hover:border-[#B7D31A]/40');

const inputClass = 'w-full bg-field border border-chip rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-field border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-red-500 transition-colors';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  metodo: CheckoutFormData['shippingMethod'];
  modalidad: CheckoutFormData['modalidad'];
}

/** A domicilio o retiro en una sucursal del correo; si es sucursal, cuál (la escribe el cliente). */
export default function CheckoutModalidad({ register, errors, metodo, modalidad }: Props) {
  const nombre = NOMBRES[metodo];
  if (!nombre) return null;
  const enSucursal = modalidad === 'sucursal';
  return (
    <div className="mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de entrega">
        <label className={opcion(!enSucursal)}>
          <input {...register('modalidad')} type="radio" value="domicilio" className="sr-only" />
          <Home size={16} className="text-brand-fg flex-shrink-0" /> A domicilio
        </label>
        <label className={opcion(enSucursal)}>
          <input {...register('modalidad')} type="radio" value="sucursal" className="sr-only" />
          <Building2 size={16} className="text-brand-fg flex-shrink-0" /> Retiro en sucursal
        </label>
      </div>
      {enSucursal && (
        <div>
          <label htmlFor="checkout-sucursal" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Sucursal de {nombre} *</label>
          <input id="checkout-sucursal" {...register('sucursal')} type="text" maxLength={150} placeholder="Nombre o dirección de la sucursal" className={errors.sucursal ? errorInputClass : inputClass} />
          {errors.sucursal
            ? <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.sucursal.message)}</p>
            : <p className="text-fg-muted text-xs mt-1">Escribí la sucursal de {nombre} más cercana donde querés retirar. Abajo completá tu ciudad y código postal.</p>}
        </div>
      )}
    </div>
  );
}
