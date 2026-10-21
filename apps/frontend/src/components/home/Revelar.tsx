'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * Aparece cuando entra en pantalla (una sola vez). "texto" sube y se aclara;
 * "foto" se descubre como una cortina y la imagen se asienta con un zoom leve
 * (la imagen tiene que ir dentro de un elemento con la clase `asentar`).
 * Los estilos están en globals.css y se apagan con "reducir movimiento".
 */
export default function Revelar({ children, tipo = 'texto', retardo = 0, className = '' }: {
  children: ReactNode; tipo?: 'texto' | 'foto'; retardo?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      el.classList.add('visible');
      observador.disconnect();
    }, { rootMargin: '0px 0px -12% 0px' });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} className={(tipo === 'foto' ? 'revelar-foto ' : 'revelar ') + className} style={{ '--retardo': retardo + 'ms' } as CSSProperties}>
      {children}
    </div>
  );
}
