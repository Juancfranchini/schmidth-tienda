import { MARCA } from '@/config/marca';
import Revelar from './Revelar';
import Paralaje from './Paralaje';

/** La frase de la marca en grande, en cursiva, sobre el rosado del branding, con la S de fondo. */
export default function Manifiesto() {
  return (
    <section className="relative overflow-hidden bg-rosado">
      {/* La S de fondo se mueve más que la página: queda en un plano más lejano. */}
      <Paralaje fuerza={-110} className="pointer-events-none absolute -right-10 -top-24">
        <span aria-hidden className="block select-none font-display text-[22rem] italic leading-none text-page/40 sm:text-[30rem]">{MARCA.nombre.charAt(0)}</span>
      </Paralaje>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 px-5 py-24 text-center sm:py-32">
        <span className="rotulo text-bordo">Nuestra promesa</span>
        <Revelar retardo={150}>
        <blockquote className="font-display text-4xl italic leading-[1.15] text-fg sm:text-6xl">
          “{MARCA.frases.companera}”
        </blockquote>
        </Revelar>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {MARCA.valores.map((v, i) => (
            <li key={v} className="rotulo flex items-center gap-4 text-fg-soft">
              {i > 0 && <span className="text-bordo" aria-hidden>✦</span>}{v}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
