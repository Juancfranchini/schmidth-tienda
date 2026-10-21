interface Props {
  ancho: number;
  alto: number;
  /** Píxeles por centímetro: con la misma escala, dos siluetas se comparan de verdad. */
  escala: number;
  /** Con cotas (las flechas de ancho y alto). */
  cotas?: boolean;
  etiqueta?: string;
}

const ASA = 0.45; // alto del asa respecto del alto del cuerpo, solo para dibujar
const MARGEN = 18;

/**
 * Dibujo lineal de una cartera a escala real relativa: cuerpo de ancho × alto
 * y un asa. No pretende ser el modelo exacto (eso lo muestran las fotos), sino
 * responder "¿qué tan grande es?", la duda que más frena una compra online.
 */
export default function SiluetaCartera({ ancho, alto, escala, cotas = false, etiqueta }: Props) {
  const w = ancho * escala;
  const h = alto * escala;
  const asa = Math.min(h * ASA, 60);
  const extra = cotas ? MARGEN : 0;
  const vbW = w + extra + 2;
  const vbH = h + asa + extra + 2;
  const x = 1;
  const y = asa + 1;

  return (
    <svg width={vbW} height={vbH} viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label={etiqueta ?? `${ancho} cm de ancho por ${alto} cm de alto`} className="block overflow-visible text-fg">
      <path d={`M ${x + w * 0.28} ${y} C ${x + w * 0.28} ${y - asa}, ${x + w * 0.72} ${y - asa}, ${x + w * 0.72} ${y}`} fill="none" stroke="currentColor" strokeWidth="1.25" />
      <rect x={x} y={y} width={w} height={h} rx={Math.min(6, w * 0.04)} fill="rgb(var(--c-chip))" stroke="currentColor" strokeWidth="1.25" />
      {cotas && (
        <g stroke="currentColor" strokeWidth="0.75" fill="currentColor" className="text-fg-muted">
          <line x1={x} y1={y + h + 10} x2={x + w} y2={y + h + 10} />
          <line x1={x} y1={y + h + 6} x2={x} y2={y + h + 14} />
          <line x1={x + w} y1={y + h + 6} x2={x + w} y2={y + h + 14} />
          <line x1={x + w + 10} y1={y} x2={x + w + 10} y2={y + h} />
          <line x1={x + w + 6} y1={y} x2={x + w + 14} y2={y} />
          <line x1={x + w + 6} y1={y + h} x2={x + w + 14} y2={y + h} />
        </g>
      )}
    </svg>
  );
}
