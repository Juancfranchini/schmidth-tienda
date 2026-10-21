/** Respuestas de GET /dashboard/hoy y GET /dashboard/puesta-en-marcha (backend src/dashboard/inicio.ts). */

export interface Tarea {
  clave: string;
  cantidad: number;
  titulo: string;
  detalle: string;
  href: string;
}

export interface Cifra {
  valor: number;
  /** % contra los 30 días anteriores; null si antes no hubo nada para comparar. */
  variacion: number | null;
}

export interface Hoy {
  tareas: Tarea[];
  ultimos30: { ventas: Cifra; pedidos: Cifra; ticket: Cifra };
}

export interface PasoPuestaEnMarcha {
  clave: string;
  titulo: string;
  detalle: string;
  listo: boolean;
  href: string;
}
