import type { ReactNode } from 'react';
import { AlertCircle, DollarSign, Users } from 'lucide-react';
import { ETAPAS, ORDEN_ETAPAS, pesos } from './formato';
import type { Etapa, Resumen } from './tipos';

const TARJETA = 'rounded-xl border border-gray-200 bg-white p-4';

function Cifra({ icono, titulo, valor, nota }: { icono: ReactNode; titulo: string; valor: string; nota?: string }) {
  return (
    <div className={TARJETA}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">{icono}{titulo}</div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{valor}</p>
      {nota && <p className="mt-0.5 text-xs text-gray-500">{nota}</p>}
    </div>
  );
}

/** Las cifras de arriba y el embudo: cuánta gente hay en cada etapa. Tocar una etapa filtra la lista. */
export function CrmResumen({ resumen, etapa, onEtapa }: { resumen: Resumen; etapa: Etapa | ''; onEtapa: (e: Etapa | '') => void }) {
  const compradores = resumen.porEtapa.cliente + resumen.porEtapa.frecuente;
  const maximo = Math.max(1, ...ORDEN_ETAPAS.map((e) => resumen.porEtapa[e]));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cifra icono={<Users className="h-4 w-4" />} titulo="Personas" valor={String(resumen.total)} />
        <Cifra icono={<Users className="h-4 w-4" />} titulo="Compradores" valor={String(compradores)} nota={resumen.total ? Math.round((compradores / resumen.total) * 100) + '% de las personas' : undefined} />
        <Cifra icono={<DollarSign className="h-4 w-4" />} titulo="Facturado" valor={pesos(resumen.facturado)} nota={compradores ? pesos(Math.round(resumen.facturado / compradores)) + ' por comprador' : undefined} />
        <Cifra icono={<AlertCircle className="h-4 w-4" />} titulo="Para hacer hoy" valor={String(resumen.accionesVencidas)} nota="acciones con fecha vencida" />
      </div>
      <div className={TARJETA}>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Etapas</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ORDEN_ETAPAS.map((e) => {
            const info = ETAPAS[e];
            const activa = etapa === e;
            return (
              <button key={e} type="button" title={info.ayuda} onClick={() => onEtapa(activa ? '' : e)}
                className={'rounded-lg border p-2.5 text-left transition-colors ' + (activa ? 'border-[#0f172a] bg-[#0f172a]/5' : 'border-gray-200 hover:bg-gray-50')}>
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><span className={'h-2 w-2 rounded-full ' + info.punto} />{info.texto}</span>
                <span className="mt-1 block text-lg font-bold text-gray-900">{resumen.porEtapa[e]}</span>
                <span className="mt-1 block h-1 overflow-hidden rounded bg-gray-100"><span className={'block h-full ' + info.punto} style={{ width: (resumen.porEtapa[e] / maximo) * 100 + '%' }} /></span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
