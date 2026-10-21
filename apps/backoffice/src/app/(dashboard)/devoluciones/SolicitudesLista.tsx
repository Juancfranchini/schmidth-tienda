'use client';

import { fechaCorta } from '../pedidos/formato';
import { diasDesde, ESTADOS, estaAbierta, haceCuanto, Solicitud, TIPOS } from './tipos';

function Insignia({ s }: { s: Solicitud }) {
  const e = ESTADOS[s.estado];
  return <span className={'inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ' + e.color}>{e.texto}</span>;
}

/** Más de 5 días abierta se marca: el arrepentimiento tiene plazos y la clienta espera respuesta. */
function Dias({ s }: { s: Solicitud }) {
  const dias = diasDesde(s.createdAt);
  const demorada = estaAbierta(s) && dias > 5;
  return <span className={demorada ? 'font-semibold text-red-600' : 'text-gray-500'}>{haceCuanto(s.createdAt)}</span>;
}

const TH = 'px-3 py-3 text-left text-xs font-semibold text-gray-500';

export function SolicitudesLista({ solicitudes, onAbrir }: { solicitudes: Solicitud[]; onAbrir: (s: Solicitud) => void }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={TH}>Código</th><th className={TH}>Tipo</th><th className={TH}>Clienta</th>
              <th className={TH}>Pedido</th><th className={TH}>Entró</th><th className={TH}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id} onClick={() => onAbrir(s)} className="cursor-pointer border-t border-gray-100 text-sm hover:bg-gray-50">
                <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-700">{s.codigo}</td>
                <td className="px-3 py-3 text-gray-700">{TIPOS[s.tipo]}</td>
                <td className="px-3 py-3"><p className="font-medium text-gray-900">{s.nombre}</p><p className="text-xs text-gray-400">{s.email}</p></td>
                <td className="px-3 py-3 text-gray-700">{s.order ? '#' + s.order.number : <span className="text-amber-700">{s.pedidoNumero} (sin vincular)</span>}</td>
                <td className="whitespace-nowrap px-3 py-3"><p className="text-gray-700">{fechaCorta(s.createdAt)}</p><p className="text-xs"><Dias s={s} /></p></td>
                <td className="px-3 py-3"><Insignia s={s} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {solicitudes.map((s) => (
          <button key={s.id} type="button" onClick={() => onAbrir(s)} className="block w-full space-y-1 rounded-xl border border-gray-200 bg-white p-4 text-left">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700">{s.codigo}</span><Insignia s={s} />
            </div>
            <p className="text-sm font-medium text-gray-900">{TIPOS[s.tipo]} · {s.nombre}</p>
            <p className="text-xs text-gray-500">Pedido {s.order ? '#' + s.order.number : s.pedidoNumero} · <Dias s={s} /></p>
          </button>
        ))}
      </div>
    </>
  );
}
