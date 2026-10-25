'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Inclinación 3D que sigue al mouse: el bloque gira unos grados hacia donde
 * apunta el cursor y, con `brillo`, un reflejo de luz lo acompaña. Los hijos
 * con la clase `capa` (y --z) quedan a distinta profundidad, así se separan
 * al inclinar. Solo con mouse: en pantallas táctiles o con "reducir
 * movimiento" queda quieto. Estilos en globals.css (.inclinar).
 */
export default function Inclinar({ children, max = 8, brillo = false, className = '' }: {
  children: ReactNode; max?: number; brillo?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!conMouse || sinMovimiento) return;

    let cuadro = 0;
    const poner = (rx: number, ry: number, mx: number, my: number) => {
      el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      el.style.setProperty('--mx', (mx * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (my * 100).toFixed(1) + '%');
    };
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => poner((0.5 - y) * 2 * max, (x - 0.5) * 2 * max, x, y));
    };
    const entrar = () => { el.dataset.activo = 'true'; };
    const salir = () => { cancelAnimationFrame(cuadro); el.dataset.activo = 'false'; poner(0, 0, 0.5, 0.5); };

    el.addEventListener('pointerenter', entrar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerleave', salir);
    return () => {
      cancelAnimationFrame(cuadro);
      el.removeEventListener('pointerenter', entrar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerleave', salir);
    };
  }, [max]);

  return (
    <div ref={ref} className={'inclinar ' + className}>
      {children}
      {brillo && <span className="inclinar-brillo" aria-hidden />}
    </div>
  );
}
