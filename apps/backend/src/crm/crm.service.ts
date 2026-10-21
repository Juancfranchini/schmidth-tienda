import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mailsDePrueba } from '../common/test-accounts';
import {
  armarContactos, Contacto, etiquetasEnUso, filtrarContactos, Insumos, normalizarMail, resumirContactos,
} from './crm.contactos';
import { ActualizarFichaDto, FiltroContactosDto } from './dto/crm.dto';

const POR_PAGINA = 25;

function notasDelPedido(notes: string | null): { buyerEmail?: string; buyerName?: string; buyerPhone?: string; paymentMethod?: string } {
  try {
    const datos = notes ? JSON.parse(notes) : {};
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    return {};
  }
}

/** Etiquetas limpias: sin espacios de más, en minúsculas, sin repetir. */
export function limpiarEtiquetas(etiquetas: string[]): string[] {
  return [...new Set(etiquetas.map((e) => e.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Todas las personas, armadas de lo que ya existe. Las cuentas y los
   * pedidos de prueba quedan afuera, igual que en las estadísticas. Se lee
   * todo y se arma en memoria: para el volumen de una tienda (cientos o pocos
   * miles de personas) es más simple y más rápido que un SQL con varios JOIN.
   */
  private async cargarContactos(): Promise<Contacto[]> {
    const prueba = await mailsDePrueba(this.prisma);
    const [usuarios, pedidos, carritos, suscriptos, fichas] = await Promise.all([
      this.prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { email: true, name: true, phone: true, createdAt: true } }),
      this.prisma.order.findMany({
        where: { isTest: false },
        select: { status: true, total: true, createdAt: true, notes: true, user: { select: { email: true, name: true, phone: true } } },
      }),
      this.prisma.abandonedCart.findMany({ where: { isTest: false }, select: { email: true, name: true, phone: true, total: true, updatedAt: true, recoveredAt: true } }),
      this.prisma.newsletter.findMany({ where: { active: true }, select: { email: true, createdAt: true } }),
      this.prisma.crmContact.findMany({ select: { email: true, tags: true, nextAction: true, nextActionAt: true, lastContactAt: true } }),
    ]);

    const insumos: Insumos = {
      usuarios,
      pedidos: pedidos.map((p) => {
        const n = notasDelPedido(p.notes);
        return { email: n.buyerEmail || p.user?.email || '', name: n.buyerName || p.user?.name || null, phone: n.buyerPhone || p.user?.phone || null, status: p.status, total: p.total, createdAt: p.createdAt, transferencia: n.paymentMethod === 'transfer' };
      }),
      carritos,
      suscriptos,
      fichas,
    };
    const fueraDePrueba = (email: string) => !prueba.has(normalizarMail(email));
    return armarContactos({
      usuarios: insumos.usuarios.filter((x) => fueraDePrueba(x.email)),
      pedidos: insumos.pedidos.filter((x) => x.email && fueraDePrueba(x.email)),
      carritos: insumos.carritos.filter((x) => fueraDePrueba(x.email)),
      suscriptos: insumos.suscriptos.filter((x) => fueraDePrueba(x.email)),
      fichas: insumos.fichas,
    });
  }

  async listar(filtro: FiltroContactosDto) {
    const todos = await this.cargarContactos();
    const filtrados = filtrarContactos(todos, filtro);
    const limite = filtro.limite ?? POR_PAGINA;
    const pagina = filtro.pagina ?? 1;
    return {
      contactos: filtrados.slice((pagina - 1) * limite, pagina * limite),
      total: filtrados.length,
      pagina,
      paginas: Math.max(1, Math.ceil(filtrados.length / limite)),
      // El resumen y las etiquetas son de todos, no del filtro: son el panel de arriba.
      resumen: resumirContactos(todos),
      etiquetas: etiquetasEnUso(todos),
    };
  }

  async detalle(emailCrudo: string) {
    const email = normalizarMail(emailCrudo);
    const contacto = (await this.cargarContactos()).find((c) => c.email === email);
    if (!contacto) throw new NotFoundException('No encontramos a esa persona.');

    const [pedidos, carrito, ficha] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          isTest: false,
          OR: [
            { user: { email: { equals: email, mode: 'insensitive' } } },
            { notes: { contains: '"buyerEmail":"' + email + '"', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, number: true, status: true, total: true, createdAt: true, items: { select: { quantity: true, product: { select: { name: true } } } } },
      }),
      this.prisma.abandonedCart.findUnique({ where: { email }, select: { items: true, total: true, updatedAt: true, recoveredAt: true, isTest: true } }),
      this.prisma.crmContact.findUnique({ where: { email }, include: { notes: { orderBy: { createdAt: 'desc' } } } }),
    ]);

    return {
      contacto,
      pedidos: pedidos.map((p) => ({
        id: p.id, number: p.number, status: p.status, total: p.total, createdAt: p.createdAt,
        productos: p.items.map((i) => ({ nombre: i.product?.name ?? 'Producto', cantidad: i.quantity })),
      })),
      carrito: carrito && !carrito.isTest && !carrito.recoveredAt ? { items: carrito.items, total: carrito.total, actualizado: carrito.updatedAt } : null,
      notas: (ficha?.notes ?? []).map((n) => ({ id: n.id, texto: n.text, autor: n.authorName, fecha: n.createdAt })),
    };
  }

  /** La ficha solo se crea para personas que existen en la tienda: no se llena de mails sueltos. */
  private async asegurarQueExiste(email: string): Promise<void> {
    const igual = { equals: email, mode: 'insensitive' as const };
    const [usuario, pedido, carrito, suscripto] = await Promise.all([
      this.prisma.user.count({ where: { email: igual } }),
      this.prisma.order.count({ where: { notes: { contains: '"buyerEmail":"' + email + '"', mode: 'insensitive' } } }),
      this.prisma.abandonedCart.count({ where: { email: igual } }),
      this.prisma.newsletter.count({ where: { email: igual } }),
    ]);
    if (usuario + pedido + carrito + suscripto === 0) throw new NotFoundException('No encontramos a esa persona.');
  }

  async actualizarFicha(dto: ActualizarFichaDto) {
    const email = normalizarMail(dto.email);
    await this.asegurarQueExiste(email);
    // undefined = no se toca; null = se borra.
    const datos = {
      ...(dto.etiquetas !== undefined ? { tags: limpiarEtiquetas(dto.etiquetas) } : {}),
      ...(dto.proximaAccion !== undefined ? { nextAction: dto.proximaAccion } : {}),
      ...(dto.proximaAccionFecha !== undefined ? { nextActionAt: dto.proximaAccionFecha ? new Date(dto.proximaAccionFecha) : null } : {}),
      ...(dto.ultimoContacto !== undefined ? { lastContactAt: dto.ultimoContacto ? new Date(dto.ultimoContacto) : null } : {}),
    };
    await this.prisma.crmContact.upsert({ where: { email }, create: { email, ...datos }, update: datos });
    return this.detalle(email);
  }

  async agregarNota(emailCrudo: string, texto: string, autor: string) {
    const email = normalizarMail(emailCrudo);
    await this.asegurarQueExiste(email);
    const ficha = await this.prisma.crmContact.upsert({ where: { email }, create: { email }, update: {} });
    await this.prisma.crmNote.create({ data: { contactId: ficha.id, text: texto.trim(), authorName: autor } });
    return this.detalle(email);
  }

  async borrarNota(id: string) {
    const nota = await this.prisma.crmNote.findUnique({ where: { id }, include: { contact: { select: { email: true } } } });
    if (!nota) throw new NotFoundException('La nota no existe.');
    await this.prisma.crmNote.delete({ where: { id } });
    return this.detalle(nota.contact.email);
  }
}
