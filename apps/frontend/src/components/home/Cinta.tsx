import { MARCA } from '@/config/marca';

const FRASES = ['Eco cuero', 'Hecho en Argentina', 'Envíos a todo el país', 'Tu modelo en el color que elijas', ...MARCA.valores];

/** Cinta bordó con las frases de la marca corriendo de lado a lado (se detiene si se piden menos animaciones). */
export default function Cinta() {
  const fila = (oculta: boolean) => (
    <ul aria-hidden={oculta} className="flex shrink-0 items-center">
      {FRASES.map((f) => (
        <li key={f} className="flex items-center whitespace-nowrap font-display text-xl italic sm:text-2xl">
          <span className="px-6 sm:px-8">{f}</span>
          <span className="text-sm not-italic text-rosado" aria-hidden>✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Lo que nos define" className="overflow-hidden bg-bordo py-4 text-on-accent sm:py-5">
      <div className="cinta flex w-max">{fila(false)}{fila(true)}</div>
    </section>
  );
}
