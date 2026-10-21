import type { CSSProperties, ReactNode } from 'react';

/** Parte "Elegí tu *favorita*" en texto normal y cursiva (lo que va entre asteriscos). */
export function conCursiva(texto: string): ReactNode[] {
  return texto.split(/(\*[^*]+\*)/g).filter(Boolean).map((parte, i) =>
    parte.startsWith('*') && parte.endsWith('*') ? <em key={i}>{parte.slice(1, -1)}</em> : parte,
  );
}

/** Igual que conCursiva, pero cada palabra en su ranura para que suban de a una (clase .palabra). */
function palabraPorPalabra(texto: string): ReactNode[] {
  let n = 0;
  return texto.split(/(\*[^*]+\*)/g).filter(Boolean).flatMap((parte, i) => {
    const cursiva = parte.startsWith('*') && parte.endsWith('*');
    const limpio = cursiva ? parte.slice(1, -1) : parte;
    return limpio.split(/(\s+)/).filter(Boolean).map((pal, j) => {
      if (/^\s+$/.test(pal)) return ' ';
      const ranura = <span className="palabra"><span style={{ '--i': n++ } as CSSProperties}>{pal}</span></span>;
      return cursiva ? <em key={i + '-' + j}>{ranura}</em> : <span key={i + '-' + j}>{ranura}</span>;
    });
  });
}

/**
 * Título en Playfair con una palabra en cursiva bordó. Sirve también para los
 * textos que vienen del backoffice: con *palabra* se marca la cursiva.
 * `animado` hace subir las palabras de a una (para la portada).
 */
export default function TituloEditorial({ texto, como = 'h2', claro = false, animado = false, className = '' }: {
  texto: string; como?: 'h1' | 'h2'; claro?: boolean; animado?: boolean; className?: string;
}) {
  const Tag = como;
  return (
    <Tag className={'titulo-editorial font-display ' + (claro ? 'claro ' : '') + className} aria-label={animado ? texto.replace(/\*/g, '') : undefined}>
      {animado ? palabraPorPalabra(texto) : conCursiva(texto)}
    </Tag>
  );
}
