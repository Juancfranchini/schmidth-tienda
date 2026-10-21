import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/marcaLinks';
import { FOTO_A_PEDIDO } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';

/**
 * Lo que distingue a la marca, tal como lo cuenta su catálogo: cada modelo se
 * puede hacer en otro color. Stock inmediato o a pedido.
 */
export default function APedido() {
  return (
    <section id="a-pedido" className="scroll-mt-24 bg-bordo text-on-accent">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:py-24">
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="aspect-[4/5] overflow-hidden rounded-t-full">
            <img src={FOTO_A_PEDIDO.src} alt={FOTO_A_PEDIDO.alt} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <span className="rotulo absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rosado px-5 py-2.5 text-ink">Hecho para vos</span>
        </div>
        <div>
          <TituloEditorial claro texto="¿Te gusta un modelo en *otro color*?" className="text-4xl leading-tight sm:text-6xl" />
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-accent/85">
            Todos nuestros modelos pueden hacerse en otros colores además de los que tenemos en stock. Consultanos y vemos las opciones para hacerlo especialmente para vos.
          </p>
          <dl className="mt-10 grid gap-px bg-on-accent/20 sm:grid-cols-2">
            <div className="bg-bordo py-5 sm:pr-6">
              <dt className="font-display text-3xl italic">Stock inmediato</dt>
              <dd className="mt-2 text-sm text-on-accent/80">Los colores disponibles para entrega. Los ves marcados en cada modelo.</dd>
            </div>
            <div className="bg-bordo py-5 sm:pl-6">
              <dt className="font-display text-3xl italic">A pedido</dt>
              <dd className="mt-2 text-sm text-on-accent/80">Elegí el color y lo confeccionamos para vos.</dd>
            </div>
          </dl>
          <Link href={WHATSAPP_URL} className="rotulo mt-10 inline-flex items-center gap-3 rounded-full bg-on-accent px-8 py-4 text-bordo transition-colors hover:bg-rosado">
            Consultar por un color <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
