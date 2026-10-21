import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { NotaCrm } from './tipos';
import { fechaYHora } from './formato';
import { motivoDelError } from './useCrm';

interface Props {
  notas: NotaCrm[];
  onAgregar: (texto: string) => Promise<void>;
  onBorrar: (id: string) => Promise<void>;
}

/** Notas internas: solo las ve el equipo, el cliente nunca. */
export function CrmNotas({ notas, onAgregar, onBorrar }: Props) {
  const { toast } = useToast();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const correr = async (accion: () => Promise<void>, error: string) => {
    try { await accion(); return true; } catch (err) { toast(motivoDelError(err, error), 'error'); return false; }
  };
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    if (await correr(() => onAgregar(texto.trim()), 'No se pudo guardar la nota')) setTexto('');
    setEnviando(false);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Notas internas</h3>
      <p className="text-xs text-gray-500">Solo las ve el equipo.</p>
      <form onSubmit={enviar} className="mt-3 space-y-2">
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} rows={2} placeholder="Ej: Prefiere retirar en el local, juega los sábados"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40" />
        <button type="submit" disabled={enviando || !texto.trim()} className="rounded-lg bg-[#0f172a] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40">Agregar nota</button>
      </form>
      <ul className="mt-3 space-y-2">
        {notas.map((n) => (
          <li key={n.id} className="rounded-lg bg-amber-50/60 p-3 text-sm">
            <p className="whitespace-pre-wrap text-gray-800">{n.texto}</p>
            <p className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
              <span>{n.autor} · {fechaYHora(n.fecha)}</span>
              <button type="button" aria-label="Borrar nota" onClick={() => correr(() => onBorrar(n.id), 'No se pudo borrar la nota')} className="rounded p-1 text-gray-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
            </p>
          </li>
        ))}
        {notas.length === 0 && <li className="text-sm text-gray-400">Todavía no hay notas.</li>}
      </ul>
    </section>
  );
}
