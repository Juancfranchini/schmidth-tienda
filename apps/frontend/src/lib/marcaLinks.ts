import { MARCA } from '@/config/marca';

/** Enlace de WhatsApp de la marca (solo dígitos, con código de país). Sin número cargado, lleva a la página de contacto. */
export const WHATSAPP_URL = MARCA.whatsapp ? 'https://wa.me/' + MARCA.whatsapp : '/contacto';
