'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Parallax al hacer scroll: el contenido se desplaza un poco más lento (o más
 * rápido) que la página, lo que da sensación de profundidad. Para una foto,
 * el contenedor tiene que ser más alto que el recuadro que la muestra (con
 * overflow oculto) para que no queden bordes. `fuerza` son los píxeles de
 * recorrido; con "reducir movimiento" queda quieto.
 */
export default function Paralaje({ children, fuerza = 40, className = '' }: {
  children: ReactNode; fuerza?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cuadro = 0;
    const calcular = () => {
      const caja = (el.parentElement ?? el).getBoundingClientRect();
      if (caja.bottom < -200 || caja.top > window.innerHeight + 200) return;
      // -1 cuando el recuadro entra por abajo, +1 cuando sale por arriba.
      const avance = Math.max(-1, Math.min(1, (caja.top + caja.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.transform = 'translate3d(0,' + (avance * fuerza).toFixed(1) + 'px,0)';
    };
    const alScroll = () => { cancelAnimationFrame(cuadro); cuadro = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
    };
  }, [fuerza]);

  return <div ref={ref} className={className} style={{ willChange: 'transform' }}>{children}</div>;
}
