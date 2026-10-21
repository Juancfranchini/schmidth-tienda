import {
  Activity, Award, Link2, Banknote, BarChart3, BadgeCheck, CreditCard, FileCheck, FileEdit, FileText, HelpCircle, Image, Info, Instagram,
  LayoutDashboard, Mail, Megaphone, MessageSquare, MessagesSquare, Package, Palette, Percent, PlaySquare, Receipt, RefreshCw, RotateCcw, Ruler,
  Settings, Shapes, Shield, ShoppingBag, ShoppingCart, Sparkles, Star, Store, Tag, Tags, Truck, UserCheck, Users, Wallet,
} from 'lucide-react';
import { MARCA } from '@/config/marca';

export interface ItemMenu {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GrupoMenu {
  /** Sin título: siempre visible arriba (Inicio). */
  title?: string;
  items: ItemMenu[];
}

/**
 * Menú del backoffice, agrupado por tarea, de lo diario a lo que se toca poco:
 * vender (Ventas), el catálogo (Productos), atraer (Marketing), medir
 * (Análisis), la vidriera (Tienda online y Páginas) y la configuración. Para
 * sumar una pantalla, agregarla al grupo que corresponda; las direcciones no
 * cambian. Los módulos apagados en packages/marca/marca.json
 * (backoffice.rutasOcultas) se filtran abajo.
 */
const GRUPOS_COMPLETOS: GrupoMenu[] = [
  { items: [{ label: 'Inicio', href: '/', icon: LayoutDashboard }] },
  {
    title: 'Ventas',
    items: [
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
      { label: 'Link de pago', href: '/link-de-pago', icon: Link2 },
      { label: 'Devoluciones', href: '/devoluciones', icon: RotateCcw },
      { label: 'Carritos abandonados', href: '/carritos-abandonados', icon: ShoppingCart },
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Punto de Venta', href: '/punto-de-venta', icon: Store },
      { label: 'Caja', href: '/caja', icon: Wallet },
    ],
  },
  {
    title: 'Productos',
    items: [
      { label: 'Productos', href: '/productos', icon: Package },
      { label: 'Categorías', href: '/categorias', icon: Tags },
      { label: 'Contenido de fichas', href: '/productos-contenido', icon: FileEdit },
      { label: 'Marcas', href: '/marcas', icon: Award },
      { label: 'Formatos de paleta', href: '/configuracion/formatos-paleta', icon: Shapes },
      { label: 'Guía de talles', href: '/configuracion/talles', icon: Ruler },
      { label: 'Reseñas', href: '/reviews', icon: Star },
      { label: 'Info de reseñas', href: '/configuracion/reviews-info', icon: BadgeCheck },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Cupones', href: '/cupones', icon: Tag },
      { label: 'Promociones', href: '/promociones', icon: Percent },
      { label: 'Newsletter', href: '/newsletter', icon: Mail },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { label: 'Estadísticas de ventas', href: '/estadisticas-ventas', icon: BarChart3 },
      { label: 'Métricas de Meta', href: '/marketing', icon: Activity },
    ],
  },
  {
    title: 'Tienda online',
    items: [
      { label: 'Portada (hero)', href: '/hero', icon: PlaySquare },
      { label: 'Banners', href: '/banners', icon: Image },
      { label: 'Beneficios', href: '/beneficios', icon: Sparkles },
      { label: 'Instagram', href: '/configuracion/instagram', icon: Instagram },
      { label: 'Sobre nosotros', href: '/configuracion/about', icon: Info },
      { label: 'Mensaje final', href: '/configuracion/mensaje-final', icon: Megaphone },
      { label: 'Confianza en fichas', href: '/configuracion/confianza-productos', icon: Shield },
      { label: 'Testimonios', href: '/testimonios', icon: MessageSquare },
      { label: 'Logo y favicon', href: '/configuracion/branding', icon: Palette },
    ],
  },
  {
    title: 'Páginas',
    items: [
      { label: 'Preguntas frecuentes', href: '/faq', icon: HelpCircle },
      { label: 'Contacto', href: '/contacto', icon: FileText },
      { label: 'Canales de contacto', href: '/configuracion/canales-contacto', icon: MessagesSquare },
      { label: 'Envíos', href: '/configuracion/envios', icon: Truck },
      { label: 'Cambios y devoluciones', href: '/configuracion/paginas', icon: RefreshCw },
      { label: 'Privacidad', href: '/configuracion/privacidad', icon: UserCheck },
      { label: 'Términos y condiciones', href: '/configuracion/terminos', icon: FileCheck },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'General', href: '/configuracion', icon: Settings },
      { label: 'Medios de pago', href: '/configuracion/medios-pago', icon: CreditCard },
      { label: 'Cuotas', href: '/configuracion/cuotas', icon: CreditCard },
      { label: 'Tarifas de envío', href: '/configuracion/tarifa-envio', icon: Banknote },
      { label: 'Gastos', href: '/gastos', icon: Receipt },
      { label: 'Equipo PDV', href: '/equipo-pdv', icon: Shield },
      { label: 'Configuración PDV', href: '/configuracion-pdv', icon: Settings },
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

export const GRUPOS_MENU: GrupoMenu[] = GRUPOS_COMPLETOS
  .map((grupo) => ({ ...grupo, items: grupo.items.filter((item) => !RUTAS_OCULTAS.includes(item.href)) }))
  .filter((grupo) => grupo.items.length > 0);

/** Rutas que tienen subpáginas propias en el menú: se marcan solo si coinciden exacto. */
const EXACTAS = ['/', '/productos', '/configuracion'];

export function rutaActiva(pathname: string, href: string): boolean {
  if (EXACTAS.includes(href)) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}
