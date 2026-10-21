export type Etapa = 'frecuente' | 'cliente' | 'por_cobrar' | 'carrito' | 'suscriptor' | 'registrado';
export type Orden = 'reciente' | 'gastado' | 'pedidos' | 'nombre';

export interface Contacto {
  email: string;
  nombre: string;
  telefono: string | null;
  etapa: Etapa;
  pedidos: number;
  gastado: number;
  porCobrar: number;
  carrito: number;
  tieneCuenta: boolean;
  suscripto: boolean;
  clienteDesde: string | null;
  ultimoMovimiento: string;
  etiquetas: string[];
  proximaAccion: string | null;
  proximaAccionFecha: string | null;
  ultimoContacto: string | null;
}

export interface Resumen {
  total: number;
  porEtapa: Record<Etapa, number>;
  facturado: number;
  accionesVencidas: number;
}

export interface Filtros {
  q: string;
  etapa: Etapa | '';
  etiqueta: string;
  orden: Orden;
  conAccionVencida: boolean;
  pagina: number;
}

export interface ListaContactos {
  contactos: Contacto[];
  total: number;
  pagina: number;
  paginas: number;
  resumen: Resumen;
  etiquetas: string[];
}

export interface PedidoDeContacto {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  productos: { nombre: string; cantidad: number }[];
}

export interface NotaCrm {
  id: string;
  texto: string;
  autor: string;
  fecha: string;
}

export interface CarritoDeContacto {
  items: { name?: string; quantity?: number; price?: number }[];
  total: number;
  actualizado: string;
}

export interface DetalleContacto {
  contacto: Contacto;
  pedidos: PedidoDeContacto[];
  carrito: CarritoDeContacto | null;
  notas: NotaCrm[];
}

export interface CambiosFicha {
  etiquetas?: string[];
  proximaAccion?: string | null;
  proximaAccionFecha?: string | null;
  ultimoContacto?: string | null;
}
