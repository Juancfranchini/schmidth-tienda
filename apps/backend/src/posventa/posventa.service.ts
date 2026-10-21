import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoSolicitud, Prisma, TipoSolicitud } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { codigoSolicitud, fechaDeCierre, normalizarNumeroPedido } from './posventa';
import { ActualizarSolicitudDto } from './dto/solicitud.dto';

export interface DatosSolicitud {
  tipo: TipoSolicitud;
  nombre: string;
  email: string;
  telefono?: string;
  pedidoNumero: string;
  motivo?: string;
}

const CON_PEDIDO = { order: { select: { id: true, number: true, status: true, total: true, createdAt: true } } } as const;

/** Solicitudes de posventa: arrepentimiento (botón de la tienda), cambios y fallas. */
@Injectable()
export class PosventaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Guarda la solicitud y, si el número coincide con un pedido, la vincula. */
  async crear(datos: DatosSolicitud, origen: 'tienda' | 'panel') {
    const numero = normalizarNumeroPedido(datos.pedidoNumero);
    const pedido = await this.prisma.order.findFirst({
      where: { number: { equals: numero, mode: 'insensitive' } },
      select: { id: true },
    });
    return this.prisma.solicitudPosventa.create({
      data: {
        codigo: codigoSolicitud(datos.tipo),
        tipo: datos.tipo,
        origen,
        nombre: datos.nombre,
        email: datos.email.toLowerCase(),
        telefono: datos.telefono || null,
        pedidoNumero: numero,
        orderId: pedido?.id ?? null,
        motivo: datos.motivo || null,
      },
      include: CON_PEDIDO,
    });
  }

  listar(estado?: EstadoSolicitud) {
    const where: Prisma.SolicitudPosventaWhereInput = estado ? { estado } : {};
    return this.prisma.solicitudPosventa.findMany({ where, include: CON_PEDIDO, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async actualizar(id: string, dto: ActualizarSolicitudDto) {
    const existe = await this.prisma.solicitudPosventa.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw new NotFoundException('La solicitud no existe');
    return this.prisma.solicitudPosventa.update({
      where: { id },
      data: {
        ...(dto.estado ? { estado: dto.estado, resueltaAt: fechaDeCierre(dto.estado) } : {}),
        ...(dto.notas !== undefined ? { notas: dto.notas || null } : {}),
      },
      include: CON_PEDIDO,
    });
  }

  /** Para el Inicio del panel: las que todavía nadie cerró. */
  abiertas() {
    return this.prisma.solicitudPosventa.count({ where: { estado: { in: [EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_CURSO] } } });
  }
}
