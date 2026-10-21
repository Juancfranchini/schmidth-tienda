'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const esquema = z.object({
  precio: z.coerce.number({ invalid_type_error: 'Ingresá un número' }).min(0, 'No puede ser negativo').max(1_000_000, 'Revisá el precio: es demasiado alto'),
  activa: z.boolean(),
});
type Datos = z.infer<typeof esquema>;

function motivo(err: unknown): string {
  const m = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof m === 'string' ? m : 'No se pudo guardar. Probá de nuevo.';
}

/** Precio por bolsa de regalo y si se ofrece en la tienda. Se guarda en la sección "bolsa_regalo". */
export default function BotonBolsaRegalo() {
  const { toast } = useToast();
  const [abierto, setAbierto] = useState(false);
  const form = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: { precio: 0, activa: true } });

  const abrir = async () => {
    setAbierto(true);
    try {
      const { data } = await api.get('/site-sections/bolsa_regalo');
      const d = (data?.data ?? {}) as { precio?: number; activa?: boolean };
      form.reset({ precio: Number(d.precio) || 0, activa: d.activa !== false });
    } catch {
      form.reset({ precio: 0, activa: true });
    }
  };

  const guardar = async (datos: Datos) => {
    try {
      await api.put('/site-sections/bolsa_regalo', { data: { precio: Math.round(datos.precio), activa: datos.activa } });
      toast(datos.activa ? 'Bolsa de regalo: ' + (datos.precio > 0 ? '$' + Math.round(datos.precio).toLocaleString('es-AR') + ' por bolsa' : 'sin cargo') : 'La bolsa de regalo ya no se ofrece', 'success');
      setAbierto(false);
    } catch (err) {
      toast(motivo(err), 'error');
    }
  };

  const activa = form.watch('activa');
  return (
    <>
      <button type="button" onClick={abrir} className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 whitespace-nowrap shrink-0">
        <Gift className="w-4 h-4" /><span>Bolsa de regalo</span>
      </button>
      <Modal isOpen={abierto} onClose={() => setAbierto(false)} title="Bolsa de regalo" size="sm">
        <form onSubmit={form.handleSubmit(guardar)} noValidate className="space-y-4 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span className="font-medium text-gray-800">Ofrecerla en el carrito y el checkout</span>
            <input type="checkbox" {...form.register('activa')} className="h-4 w-4" />
          </label>
          <label className="block">
            <span className="font-medium text-gray-800">Precio por bolsa ($)</span>
            <input type="number" min={0} step={1} inputMode="numeric" readOnly={!activa} {...form.register('precio')}
              className={'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 ' + (activa ? '' : 'bg-gray-50 text-gray-400')} />
            {form.formState.errors.precio && <span className="text-xs text-red-600">{form.formState.errors.precio.message}</span>}
          </label>
          <p className="text-gray-500">Se cobra una por producto como máximo. Con 0 va sin cargo. El precio se suma al total del pedido y aparece en Mercado Pago y en el mail al cliente.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAbierto(false)} className="rounded-lg border px-3 py-2 font-medium text-gray-700">Cancelar</button>
            <button type="submit" disabled={form.formState.isSubmitting} className="rounded-lg bg-[#C8FF00] px-3 py-2 font-semibold text-[#0f172a] disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
