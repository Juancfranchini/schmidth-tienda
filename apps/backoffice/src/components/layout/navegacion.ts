import {
  BarChart3, LayoutDashboard, Megaphone, Package, Settings, ShoppingBag, Store, Users, Globe,
} from 'lucide-react';
import { MARCA } from '@/config/marca';

export interface Subpestana {
  label: string;
  href: string;
}

export interface Pestana {
  label: string;
  /** Pantalla a la que lleva la pestaña. */
  href: string;
  /** Otras pantallas que dejan esta pestaña marcada (por ejemplo, el alta de un producto). */
  tambien?: string[];
  /** Pantallas hermanas dentro de la pestaña: se muestran como una segunda fila. */
  sub?: Subpestana[];
}

export interface Seccion {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Pantalla a la que lleva la entrada del menú: la primera pestaña disponible. */
  href: string;
  pestanas: Pestana[];
  /** Botón de acción de la sección (arriba a la derecha de las pestañas). */
  accion?: { label: string; href: string };
  /** Entradas del menú que van también en la barra inferior del celular. */
  enCelular?: boolean;
}

/**
 * Menú del backoffice: pocas entradas, cada una con sus pantallas como
 * pestañas (como en Shopify o Tiendanube). Las direcciones de cada pantalla no
 * cambian; solo se agrupan. Los módulos apagados en packages/marca/marca.json
 * (backoffice.rutasOcultas) se filtran más abajo: una pestaña oculta no se
 * muestra y una sección sin pestañas desaparece.
 */
const SECCIONES_COMPLETAS: Omit<Seccion, 'href'>[] = [
  {
    id: 'inicio', label: 'Inicio', icon: LayoutDashboard, enCelular: true,
    pestanas: [{ label: 'Inicio', href: '/' }],
  },
  {
    id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, enCelular: true,
    accion: { label: 'Crear link de pago', href: '/link-de-pago' },
    pestanas: [
      { label: 'Pedidos', href: '/pedidos', tambien: ['/link-de-pago'] },
      { label: 'Devoluciones', href: '/devoluciones' },
      { label: 'Carritos abandonados', href: '/carritos-abandonados' },
    ],
  },
  {
    id: 'productos', label: 'Productos', icon: Package, enCelular: true,
    pestanas: [
      { label: 'Productos', href: '/productos' },
      { label: 'Categorías', href: '/categorias' },
      { label: 'Contenido de fichas', href: '/productos-contenido' },
      { label: 'Marcas', href: '/marcas' },
      { label: 'Atributos', href: '/configuracion/talles', sub: [
        { label: 'Guía de talles', href: '/configuracion/talles' },
        { label: 'Formatos de paleta', href: '/configuracion/formatos-paleta' },
      ] },
      { label: 'Reseñas', href: '/reviews', tambien: ['/configuracion/reviews-info'] },
    ],
  },
  {
    id: 'clientes', label: 'Clientes', icon: Users, enCelular: true,
    pestanas: [{ label: 'Clientes', href: '/clientes' }],
  },
  {
    id: 'marketing', label: 'Marketing', icon: Megaphone,
    pestanas: [
      { label: 'Cupones', href: '/cupones' },
      { label: 'Promociones', href: '/promociones' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Meta', href: '/marketing' },
    ],
  },
  {
    id: 'analisis', label: 'Análisis', icon: BarChart3,
    pestanas: [
      { label: 'Ventas', href: '/estadisticas-ventas' },
      { label: 'Gastos', href: '/gastos' },
    ],
  },
  {
    id: 'tienda', label: 'Tienda online', icon: Globe,
    pestanas: [
      { label: 'Inicio de la tienda', href: '/hero', sub: [
        { label: 'Portada', href: '/hero' },
        { label: 'Banners', href: '/banners' },
        { label: 'Beneficios', href: '/beneficios' },
        { label: 'Instagram', href: '/configuracion/instagram' },
        { label: 'Sobre nosotros', href: '/configuracion/about' },
        { label: 'Mensaje final', href: '/configuracion/mensaje-final' },
        { label: 'Testimonios', href: '/testimonios' },
      ] },
      { label: 'Fichas de producto', href: '/configuracion/confianza-productos' },
      { label: 'Páginas', href: '/faq', sub: [
        { label: 'Preguntas frecuentes', href: '/faq' },
        { label: 'Contacto', href: '/contacto' },
        { label: 'Canales de contacto', href: '/configuracion/canales-contacto' },
        { label: 'Envíos', href: '/configuracion/envios' },
        { label: 'Cambios y devoluciones', href: '/configuracion/paginas' },
        { label: 'Privacidad', href: '/configuracion/privacidad' },
        { label: 'Términos y condiciones', href: '/configuracion/terminos' },
      ] },
      { label: 'Marca', href: '/configuracion/branding' },
    ],
  },
  {
    id: 'pdv', label: 'Punto de venta', icon: Store,
    pestanas: [
      { label: 'Venta', href: '/punto-de-venta' },
      { label: 'Caja', href: '/caja' },
      { label: 'Equipo', href: '/equipo-pdv' },
      { label: 'Configuración', href: '/configuracion-pdv' },
    ],
  },
  {
    id: 'configuracion', label: 'Configuración', icon: Settings,
    pestanas: [
      { label: 'General', href: '/configuracion', tambien: ['/configuracion/cloudinary'] },
      { label: 'Pagos', href: '/configuracion/medios-pago', sub: [
        { label: 'Medios de pago', href: '/configuracion/medios-pago' },
        { label: 'Cuotas', href: '/configuracion/cuotas' },
      ] },
      { label: 'Envíos', href: '/configuracion/tarifa-envio' },
    ],
  },
];

/**
 * Módulos apagados desde packages/marca/marca.json (backoffice.rutasOcultas):
 * no aparecen en el menú y `esRutaOculta` bloquea entrar escribiendo la dirección.
 */
const RUTAS_OCULTAS: readonly string[] = MARCA.backoffice.rutasOcultas;

export function esRutaOculta(pathname: string): boolean {
  return RUTAS_OCULTAS.some((ruta) => pathname === ruta || pathname.startsWith(ruta + '/'));
}

const visible = (href: string) => !RUTAS_OCULTAS.includes(href);

function sinOcultas(pestana: Pestana): Pestana | null {
  const sub = pestana.sub?.filter((s) => visible(s.href));
  if (!visible(pestana.href) && !(sub && sub.length > 0)) return null;
  // Si la pantalla principal de la pestaña está oculta, lleva a la primera hermana visible.
  const href = visible(pestana.href) ? pestana.href : (sub as Subpestana[])[0].href;
  return { ...pestana, href, sub: sub && sub.length > 1 ? sub : undefined };
}

export const SECCIONES_MENU: Seccion[] = SECCIONES_COMPLETAS
  .map((seccion) => {
    const pestanas = seccion.pestanas.map(sinOcultas).filter((p): p is Pestana => p !== null);
    return { ...seccion, pestanas, href: pestanas[0]?.href ?? '/' };
  })
  .filter((seccion) => seccion.pestanas.length > 0);

/** Rutas con subpantallas propias: se marcan solo si coinciden exacto. */
const EXACTAS = ['/', '/configuracion'];

export function rutaActiva(pathname: string, href: string): boolean {
  if (EXACTAS.includes(href)) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/** Todas las pantallas que dejan marcada una pestaña. */
function rutasDe(pestana: Pestana): string[] {
  return [pestana.href, ...(pestana.tambien ?? []), ...(pestana.sub?.map((s) => s.href) ?? [])];
}

export function pestanaActiva(pathname: string, pestana: Pestana): boolean {
  return rutasDe(pestana).some((ruta) => rutaActiva(pathname, ruta));
}

/** La sección y la pestaña de la pantalla abierta (la coincidencia más específica gana). */
export function ubicacion(pathname: string): { seccion: Seccion; pestana: Pestana } | null {
  let mejor: { seccion: Seccion; pestana: Pestana; largo: number } | null = null;
  for (const seccion of SECCIONES_MENU) {
    for (const pestana of seccion.pestanas) {
      for (const ruta of rutasDe(pestana)) {
        if (rutaActiva(pathname, ruta) && (!mejor || ruta.length > mejor.largo)) mejor = { seccion, pestana, largo: ruta.length };
      }
    }
  }
  return mejor ? { seccion: mejor.seccion, pestana: mejor.pestana } : null;
}
