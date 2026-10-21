import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MARCA } from '../config/marca';
import { comparar, pasosPuestaEnMarcha, tareasDelDia } from './inicio';

const DIA = 24 * 60 * 60 * 1000;
const STOCK_BAJO = 2;
const SECCIONES_LEGALES = ['terminos', 'privacidad', 'envíos', 'politica_devolución'];

/** Datos de la pantalla de Inicio del backoffice: qué hacer hoy, cómo viene la venta y qué falta configurar. */
@Injectable()
export class InicioService {
  constructor(private readonly prisma: PrismaService) {}

  async hoy() {
    const ahora = Date.now();
    const haceSiete = new Date(ahora - 7 * DIA);
    const [porCobrar, paraPreparar, carritosParaContactar, stockBajo, linksSinPagar, actual, anterior] = await Promise.all([
      this.prisma.order.count({ where: { status: 'PENDING', isTest: false } }),
      this.prisma.order.count({ where: { status: 'PAID', isTest: false } }),
      this.prisma.abandonedCart.count({ where: { isTest: false, contactedAt: null, recoveredAt: null, updatedAt: { gte: haceSiete } } }),
      this.prisma.productVariant.count({
        where: { active: true, isDefault: false, stock: { lte: STOCK_BAJO }, product: { active: true, isMadeToOrder: false } },
      }),
      this.prisma.salesCheckoutLink.count({ where: { status: { in: ['OPEN', 'CHECKOUT'] }, expiresAt: { gt: new Date(ahora) } } }),
      this.periodo(new Date(ahora - 30 * DIA), new Date(ahora)),
      this.periodo(new Date(ahora - 60 * DIA), new Date(ahora - 30 * DIA)),
    ]);
    return {
      tareas: tareasDelDia({ porCobrar, paraPreparar, carritosParaContactar, stockBajo, linksSinPagar }),
      ultimos30: comparar(actual, anterior),
    };
  }

  /** Solo dice si cada cosa está o no: nunca devuelve claves ni tokens. */
  async puestaEnMarcha() {
    const secciones = await this.prisma.siteSection.findMany({
      where: { key: { in: ['payment_methods', 'email_settings', 'cloudinary', 'meta_pixel', ...SECCIONES_LEGALES] } },
    });
    const datos = (key: string) => (secciones.find((s) => s.key === key)?.data ?? {}) as Record<string, unknown>;
    const tiene = (valor: unknown) => typeof valor === 'string' && valor.trim().length > 0;
    const mp = (datos('payment_methods').mercadopago ?? {}) as Record<string, unknown>;
    const cloudinary = datos('cloudinary');
    // Fotos provisorias del seed (placehold.co): se busca en el array de imágenes de cada producto activo.
    const provisorias = await this.prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "Product" WHERE active AND array_to_string(images, ' ') LIKE '%placehold.co%'`;
    const fotosProvisorias = Number(provisorias[0]?.n ?? 0);

    return pasosPuestaEnMarcha({
      pagos: tiene(process.env.MERCADOPAGO_ACCESS_TOKEN) || tiene(mp.accessToken),
      mails: tiene(datos('email_settings').resendApiKey),
      imagenes: tiene(process.env.CLOUDINARY_URL) || (tiene(cloudinary.cloudName) && tiene(cloudinary.apiKey)),
      dominio: !MARCA.sitio.url.includes('.example'),
      datosMarca: tiene(MARCA.whatsapp) && tiene(MARCA.legal.cuit) && tiene(MARCA.legal.razonSocial),
      fotosReales: fotosProvisorias === 0,
      // Una sección que nunca se guardó muestra el texto base: cuenta como sin revisar.
      legalesRevisados: SECCIONES_LEGALES.every((key) => secciones.some((s) => s.key === key) && datos(key).aRevisar !== true),
      meta: tiene(datos('meta_pixel').pixelId),
    });
  }

  private async periodo(desde: Date, hasta: Date) {
    const r = await this.prisma.order.aggregate({
      where: { createdAt: { gte: desde, lt: hasta }, status: { not: 'CANCELLED' }, isTest: false },
      _sum: { total: true },
      _count: true,
    });
    return { ventas: r._sum.total ?? 0, pedidos: r._count };
  }
}
