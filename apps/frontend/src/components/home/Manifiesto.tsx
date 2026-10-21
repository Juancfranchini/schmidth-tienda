import { MARCA } from '@/config/marca';

/** La frase de la marca, como en el branding: centrada, en mayúsculas espaciadas, sobre el rosado. */
export default function Manifiesto() {
  return (
    <section className="bg-rosado">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-5 py-20 text-center sm:py-28">
        <p className="rotulo !text-sm leading-loose !tracking-[0.28em] text-fg sm:!text-base">{MARCA.frases.companera}</p>
        <span className="guion text-fg" aria-hidden />
        <ul className="rotulo flex flex-wrap justify-center gap-x-6 gap-y-2 text-fg-soft">
          {MARCA.valores.map((v) => <li key={v}>{v}</li>)}
        </ul>
      </div>
    </section>
  );
}
