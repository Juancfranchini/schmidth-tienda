import Link from 'next/link';
import { MOMENTOS } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';

/**
 * "Una cartera para cada momento": tres escenas en arco, la del medio más
 * baja, como una página de revista. Llevan a la colección.
 */
export default function Momentos() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-28">
      <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
        <p className="rotulo mb-4 text-bordo">Lookbook</p>
        <TituloEditorial texto="Una cartera para cada *momento*" className="text-4xl leading-tight sm:text-6xl" />
      </div>
      <ul className="grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {MOMENTOS.map((m, i) => (
          <li key={m.titulo} className={i === 1 ? 'sm:mt-20' : ''}>
            <Link href={m.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-chip">
                <img src={m.src} alt={m.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                <span className="rotulo absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-page/90 px-4 py-2 !text-[10px] text-fg opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  Ver modelos
                </span>
              </div>
              <p className="rotulo mt-6 text-fg-muted">0{i + 1}</p>
              <h3 className="mt-1 font-display text-3xl italic text-fg transition-colors group-hover:text-bordo">{m.titulo}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-soft">{m.texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
