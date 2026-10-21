import type { ReactNode } from 'react';

/** Parte "Elegí tu *favorita*" en texto normal y cursiva (lo que va entre asteriscos). */
export function conCursiva(texto: string): ReactNode[] {
  return texto.split(/(\*[^*]+\*)/g).filter(Boolean).map((parte, i) =>
    parte.startsWith('*') && parte.endsWith('*') ? <em key={i}>{parte.slice(1, -1)}</em> : parte,
  );
}

/**
 * Título en Playfair con una palabra en cursiva bordó. Sirve también para los
 * textos que vienen del backoffice: con *palabra* se marca la cursiva.
 */
export default function TituloEditorial({ texto, como = 'h2', claro = false, className = '' }: {
  texto: string; como?: 'h1' | 'h2'; claro?: boolean; className?: string;
}) {
  const Tag = como;
  return <Tag className={'titulo-editorial font-display ' + (claro ? 'claro ' : '') + className}>{conCursiva(texto)}</Tag>;
}
