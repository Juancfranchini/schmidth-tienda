import { CalendarClock, MessageCircle } from 'lucide-react';
import type { Contacto, Etapa } from './tipos';
import { capitalizar, estaVencida, ETAPAS, fechaCorta, hace, iniciales, pendienteDe, pesos, whatsappDe } from './formato';

export function InsigniaEtapa({ etapa }: { etapa: Etapa }) {
  const info = ETAPAS[etapa];
  return <span title={info.ayuda} className={'inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ' + info.insignia}>{info.texto}</span>;
}

export function Avatar({ nombre, grande }: { nombre: string; grande?: boolean }) {
  return (
    <span className={'flex flex-shrink-0 items-center justify-center rounded-full bg-[#0f172a] font-bold text-[#C8FF00] ' + (grande ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs')}>
      {iniciales(nombre)}
    </span>
  );
}

function Etiquetas({ etiquetas }: { etiquetas: string[] }) {
  if (!etiquetas.length) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {etiquetas.slice(0, 3).map((t) => <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">{capitalizar(t)}</span>)}
      {etiquetas.length > 3 && <span className="text-[10px] text-gray-400">+{etiquetas.length - 3}</span>}
    </span>
  );
}

function Accion({ c }: { c: Contacto }) {
  if (!c.proximaAccion) return <span className="text-gray-300">—</span>;
  const vencida = estaVencida(c.proximaAccionFecha);
  return (
    <span className={'flex items-start gap-1 text-xs ' + (vencida ? 'font-medium text-rose-600' : 'text-gray-600')}>
      <CalendarClock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{c.proximaAccion}{c.proximaAccionFecha && <span className="block text-[11px] opacity-80">{fechaCorta(c.proximaAccionFecha)}</span>}</span>
    </span>
  );
}

function Persona({ c }: { c: Contacto }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar nombre={c.nombre} />
      <span className="min-w-0">
        <span className="block truncate font-medium text-gray-900">{c.nombre}</span>
        <span className="block truncate text-xs text-gray-500">{c.email}</span>
        <Etiquetas etiquetas={c.etiquetas} />
      </span>
    </span>
  );
}

function BotonWhatsapp({ telefono }: { telefono: string | null }) {
  const enlace = whatsappDe(telefono);
  if (!enlace) return null;
  return (
    <a href={enlace} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp" onClick={(e) => e.stopPropagation()}
      className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"><MessageCircle className="h-4 w-4" /></a>
  );
}

function FilaDeTabla({ c, onAbrir }: { c: Contacto; onAbrir: (email: string) => void }) {
  const pendiente = pendienteDe(c);
  return (
    <tr onClick={() => onAbrir(c.email)} className="cursor-pointer hover:bg-gray-50">
      <td className="max-w-[280px] px-4 py-3"><Persona c={c} /></td>
      <td className="px-3 py-3"><InsigniaEtapa etapa={c.etapa} />{pendiente && <span className="mt-1 block text-xs text-gray-500">{pendiente}</span>}</td>
      <td className="px-3 py-3 text-right tabular-nums">{c.pedidos}</td>
      <td className="px-3 py-3 text-right font-medium tabular-nums">{c.gastado > 0 ? pesos(c.gastado) : <span className="text-gray-300">—</span>}</td>
      <td className="max-w-[200px] px-3 py-3"><Accion c={c} /></td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">{hace(c.ultimoMovimiento)}</td>
      <td className="px-2 py-3"><BotonWhatsapp telefono={c.telefono} /></td>
    </tr>
  );
}

function TarjetaMovil({ c, onAbrir }: { c: Contacto; onAbrir: (email: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onAbrir(c.email)} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left">
        <Persona c={c} />
        <span className="mt-2 flex items-center justify-between gap-2">
          <InsigniaEtapa etapa={c.etapa} />
          <span className="text-sm font-medium">{c.gastado > 0 ? pesos(c.gastado) : ''}</span>
        </span>
        <span className="mt-1 flex justify-between text-xs text-gray-500"><span>{c.pedidos} pedidos</span><span>{hace(c.ultimoMovimiento)}</span></span>
      </button>
    </li>
  );
}

export function CrmTabla({ contactos, onAbrir }: { contactos: Contacto[]; onAbrir: (email: string) => void }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Persona</th><th className="px-3 py-2.5 font-medium">Etapa</th>
              <th className="px-3 py-2.5 text-right font-medium">Pedidos</th><th className="px-3 py-2.5 text-right font-medium">Gastado</th>
              <th className="px-3 py-2.5 font-medium">Próxima acción</th><th className="px-3 py-2.5 font-medium">Último movimiento</th><th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contactos.map((c) => <FilaDeTabla key={c.email} c={c} onAbrir={onAbrir} />)}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden">
        {contactos.map((c) => <TarjetaMovil key={c.email} c={c} onAbrir={onAbrir} />)}
      </ul>
    </>
  );
}
