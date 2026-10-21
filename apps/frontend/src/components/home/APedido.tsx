import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/marcaLinks';

/**
 * Lo que distingue a la marca, tal como lo cuenta su catálogo: cada modelo se
 * puede hacer en otro color. Stock inmediato o a pedido.
 */
export default function APedido() {
  return (
    <section id="a-pedido" className="scroll-mt-24 bg-bordo text-on-accent">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-24">
        <div>
          <p className="rotulo mb-4 text-on-accent/70">Hecho para vos</p>
          <h2 className="text-4xl leading-tight sm:text-6xl">¿Te gusta un modelo en otro color?</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-accent/85">
            Todos nuestros modelos pueden hacerse en otros colores además de los que tenemos en stock. Consultanos y vemos las opciones para hacerlo especialmente para vos.
          </p>
          <Link href={WHATSAPP_URL} className="rotulo mt-8 inline-block border border-on-accent px-8 py-4 transition-colors hover:bg-on-accent hover:text-bordo">
            Consultar por un color
          </Link>
        </div>
        <dl className="grid gap-px bg-on-accent/20 sm:grid-cols-2 lg:grid-cols-1">
          <div className="bg-bordo py-6 sm:pr-6 lg:pr-0">
            <dt className="font-display text-3xl">Stock inmediato</dt>
            <dd className="mt-2 text-on-accent/80">Los colores disponibles para entrega. Los ves marcados en cada modelo.</dd>
          </div>
          <div className="bg-bordo py-6 sm:pl-6 lg:pl-0">
            <dt className="font-display text-3xl">A pedido</dt>
            <dd className="mt-2 text-on-accent/80">Elegí el color y lo confeccionamos para vos.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
