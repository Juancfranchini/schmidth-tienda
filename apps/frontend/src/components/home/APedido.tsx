import Link from 'next/link';
import type { CSSProperties } from 'react';
import { WHATSAPP_URL } from '@/lib/marcaLinks';
import { FOTO_A_PEDIDO } from '@/config/editorial';
import TituloEditorial from './TituloEditorial';
import Revelar from './Revelar';

/**
 * Lo que distingue a la marca, tal como lo cuenta su catálogo: cada modelo se
 * puede hacer en otro color. Stock inmediato o a pedido.
 */
export default function APedido() {
  return (
    <section id="a-pedido" className="scroll-mt-24 bg-bordo text-on-accent">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:py-28">
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          {/* El mismo marco fino desplazado de la portada, en rosado. */}
          <span aria-hidden className="absolute -bottom-5 -right-5 left-5 top-5 border border-rosado/50" />
          <Revelar tipo="foto" className="relative aspect-[4/5] overflow-hidden">
            <div className="asentar h-full w-full">
              <img src={FOTO_A_PEDIDO.src} alt={FOTO_A_PEDIDO.alt} loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Revelar>
          <span className="rotulo absolute -bottom-3 left-8 bg-rosado px-5 py-2.5 text-ink">Hecho para vos</span>
        </div>
        <Revelar retardo={200}>
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
          <Link href={WHATSAPP_URL} style={{ '--barrido': 'rgb(var(--c-rosado))' } as CSSProperties}
            className="barrido rotulo mt-10 inline-flex items-center gap-3 bg-on-accent px-9 py-4 text-bordo">
            Consultar por un color <span aria-hidden>→</span>
          </Link>
        </Revelar>
      </div>
    </section>
  );
}
