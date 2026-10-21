import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { CambiosFicha, Contacto } from './tipos';
import { capitalizar, fechaCorta } from './formato';
import { motivoDelError } from './useCrm';

const CAMPO = 'w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B3855C]/40';
const ETIQUETAS_SUGERIDAS = ['vip', 'profesor', 'club', 'mayorista', 'reventa'];

type Guardar = (cambios: CambiosFicha) => Promise<void>;

/** La fecha elegida en el calendario se guarda al mediodía, para que no cambie de día según la zona horaria. */
const aIso = (dia: string) => (dia ? new Date(dia + 'T12:00:00').toISOString() : null);
const aDia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-CA') : '');

function EditorDeEtiquetas({ etiquetas, onGuardar }: { etiquetas: string[]; onGuardar: (t: string[]) => void }) {
  const [nueva, setNueva] = useState('');
  const agregar = (texto: string) => {
    const t = texto.trim().toLowerCase();
    setNueva('');
    if (t && !etiquetas.includes(t)) onGuardar([...etiquetas, t]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {etiquetas.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full bg-gray-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-gray-700">
            {capitalizar(t)}
            <button type="button" aria-label={'Quitar ' + t} onClick={() => onGuardar(etiquetas.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-gray-200"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); agregar(nueva); }} className="mt-2 flex gap-2">
        <input value={nueva} onChange={(e) => setNueva(e.target.value)} maxLength={30} placeholder="Nueva etiqueta" list="etiquetas-sugeridas" className={CAMPO} />
        <datalist id="etiquetas-sugeridas">{ETIQUETAS_SUGERIDAS.filter((t) => !etiquetas.includes(t)).map((t) => <option key={t} value={t} />)}</datalist>
        <button type="submit" className="rounded-lg bg-[#1A1A1A] px-3 text-sm font-medium text-white">Agregar</button>
      </form>
    </div>
  );
}

function EditorDeAccion({ contacto, onGuardar }: { contacto: Contacto; onGuardar: Guardar }) {
  const [texto, setTexto] = useState(contacto.proximaAccion ?? '');
  const [dia, setDia] = useState(aDia(contacto.proximaAccionFecha));
  const [guardando, setGuardando] = useState(false);
  useEffect(() => { setTexto(contacto.proximaAccion ?? ''); setDia(aDia(contacto.proximaAccionFecha)); }, [contacto.proximaAccion, contacto.proximaAccionFecha]);
  const sinCambios = texto === (contacto.proximaAccion ?? '') && dia === aDia(contacto.proximaAccionFecha);

  const guardar = async (cambios: CambiosFicha) => {
    setGuardando(true);
    try { await onGuardar(cambios); } finally { setGuardando(false); }
  };
  return (
    <div className="space-y-2">
      <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={200} placeholder="Ej: Llamar para ofrecerle la paleta nueva" className={CAMPO} />
      <div className="flex gap-2">
        <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className={CAMPO} aria-label="Fecha de la acción" />
        <button type="button" disabled={sinCambios || guardando} onClick={() => guardar({ proximaAccion: texto.trim(), proximaAccionFecha: aIso(dia) })}
          className="rounded-lg bg-[#1A1A1A] px-3 text-sm font-medium text-white disabled:opacity-40">Guardar</button>
        {contacto.proximaAccion && (
          <button type="button" disabled={guardando} onClick={() => guardar({ proximaAccion: null, proximaAccionFecha: null, ultimoContacto: new Date().toISOString() })}
            className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-medium text-green-700"><Check className="h-4 w-4" />Hecho</button>
        )}
      </div>
    </div>
  );
}

export function CrmSeguimiento({ contacto, onGuardar }: { contacto: Contacto; onGuardar: Guardar }) {
  const { toast } = useToast();
  const guardar: Guardar = async (cambios) => {
    try { await onGuardar(cambios); } catch (err) { toast(motivoDelError(err, 'No se pudo guardar'), 'error'); }
  };
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Seguimiento</h3>
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Etiquetas</p>
        <EditorDeEtiquetas etiquetas={contacto.etiquetas} onGuardar={(etiquetas) => guardar({ etiquetas })} />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Próxima acción</p>
        <EditorDeAccion contacto={contacto} onGuardar={guardar} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Último contacto: <span className="font-medium text-gray-800">{contacto.ultimoContacto ? fechaCorta(contacto.ultimoContacto) : 'nunca'}</span></span>
        <button type="button" onClick={() => guardar({ ultimoContacto: new Date().toISOString() })} className="text-xs font-medium text-[#1A1A1A] underline">Lo contacté hoy</button>
      </div>
    </section>
  );
}
