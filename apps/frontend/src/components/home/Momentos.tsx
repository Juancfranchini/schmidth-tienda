import Link from 'next/link';
import { MOMENTOS } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';
import Revelar from './Revelar';
import Paralaje from './Paralaje';

/**
 * "Una cartera para cada momento": tres escenas, la del medio más baja, como
 * una página de revista. Cada foto se descubre al llegar con el scroll y lleva
 * a la colección.
 */
export default function Momentos() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-28">
      <Revelar className="mx-auto mb-12 max-w-2xl text-center lg:mb-20">
        <p className="rotulo mb-4 text-bordo">Lookbook</p>
        <TituloEditorial texto="Una cartera para cada *momento*" className="text-4xl leading-tight sm:text-6xl" />
      </Revelar>
      <ul className="grid gap-12 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {MOMENTOS.map((m, i) => (
          <li key={m.titulo} className={i === 1 ? 'sm:mt-24' : ''}>
            <Link href={m.href} className="group block">
              <Revelar tipo="foto" retardo={i * 180} className="relative aspect-[3/4] overflow-hidden bg-chip">
                <div className="asentar h-full w-full">
                  {/* La foto es más alta que su recuadro y se desplaza con el scroll: el recuadro funciona como una ventana con profundidad. */}
                  <Paralaje fuerza={44} className="absolute -top-[9%] left-0 h-[118%] w-full">
                    <img src={m.src} alt={m.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]" />
                  </Paralaje>
                </div>
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/10" aria-hidden />
              </Revelar>
              <Revelar retardo={i * 180 + 250}>
                <div className="mt-6 flex items-center gap-4">
                  <span className="rotulo text-fg-muted">0{i + 1}</span>
                  <span className="h-px w-8 bg-fg/30 transition-all duration-700 group-hover:w-16 group-hover:bg-bordo" aria-hidden />
                </div>
                <h3 className="mt-3 font-display text-3xl italic text-fg transition-colors duration-500 group-hover:text-bordo">{m.titulo}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-soft">{m.texto}</p>
              </Revelar>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
