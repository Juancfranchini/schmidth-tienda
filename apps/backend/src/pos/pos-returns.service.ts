import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  InventoryMovementType,
  InventoryStatus,
  PaymentKind,
  PaymentMethod,
  PaymentState,
  Prisma,
} from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CancelSaleDto, CreateReturnDto } from './dto/returns.dto';
import { PosPaymentsService } from './pos-payments.service';
import { EmailService } from '../email/email.service';
import { avisarCancelacion } from './pos-cancel-email';

@Injectable()
export class PosReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly payments: PosPaymentsService,
    @Optional() private readonly emails?: EmailService,
  ) {}

  async createReturn(orderId: string, dto: CreateReturnDto, actorId: string) {
    const { devolucion, cancelado } = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { isMadeToOrder: true } }, returnItems: true } },
        },
      });
      if (!order) throw new NotFoundException('Venta no encontrada');
      if (order.status === 'CANCELLED') throw new ConflictException('La venta está cancelada');

      const resolved = dto.items.map((requested) => {
        const item = order.items.find((candidate) => candidate.id === requested.orderItemId);
        if (!item) throw new BadRequestException('Un producto no pertenece a la venta');
        const returned = item.returnItems.reduce((sum, entry) => sum + entry.quantity, 0);
        if (requested.quantity + returned > item.quantity) {
          throw new BadRequestException('La cantidad devuelta supera la cantidad vendida');
        }
        return { requested, item };
      });
      const saleReturn = await tx.saleReturn.create({
        data: {
          orderId,
          type: dto.type,
          reason: dto.reason,
          refundAmount: dto.refundAmount ?? 0,
          createdById: actorId,
          items: {
            create: resolved.map(({ requested, item }) => ({
              orderItemId: item.id,
              quantity: requested.quantity,
              restock: requested.restock ?? true,
              amount: item.price * requested.quantity,
            })),
          },
        },
      });

      const restock = resolved
        .filter(({ requested, item }) => (requested.restock ?? true) && !item.product.isMadeToOrder)
        .map(({ requested, item }) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: requested.quantity,
        }));
      await this.inventory.restoreWithClient(tx, restock, {
        orderId,
        branchId: order.branchId || undefined,
        userId: actorId,
        type: InventoryMovementType.RETURN,
        reason: `${dto.type === 'EXCHANGE' ? 'Cambio' : 'Devolución'}: ${dto.reason}`,
      });

      await this.reintegrarDevolucion(tx, order, dto, actorId);
      await tx.auditLog.create({
        data: {
          actorId,
          entityType: 'Order',
          entityId: orderId,
          action: dto.type,
          changes: { returnId: saleReturn.id, refundAmount: dto.refundAmount ?? 0 },
        },
      });
      const cancelado = dto.type === 'RETURN' && devolvioTodo(order.items, dto.items)
        ? await this.cancelarPorDevolucionTotal(tx, orderId, dto.reason, actorId)
        : false;
      const devolucion = await tx.saleReturn.findUnique({
        where: { id: saleReturn.id },
        include: {
          items: { include: { orderItem: { include: { product: true, variant: true } } } },
        },
      });
      return { devolucion, cancelado };
    });
    if (cancelado) void avisarCancelacion(this.prisma, this.emails, orderId);
    return devolucion;
  }

  private async reintegrarDevolucion(
    tx: Prisma.TransactionClient,
    order: { id: string; total: number },
    dto: CreateReturnDto,
    actorId: string,
  ) {
    if ((dto.refundAmount ?? 0) <= 0) return;
    if (!dto.refundMethod) throw new BadRequestException('Indicá el medio del reintegro');
    const refund = await this.payments.refundWithClient(
      tx,
      order,
      dto.refundAmount!,
      dto.refundMethod,
      actorId,
      dto.reference,
      dto.cashSessionId,
    );
    await tx.order.update({ where: { id: order.id }, data: { paymentStatus: refund.status } });
  }

  /** Se devolvió todo lo comprado: la venta queda cancelada (el stock ya volvió con la devolución). */
  private async cancelarPorDevolucionTotal(tx: Prisma.TransactionClient, orderId: string, reason: string, actorId: string) {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: 'Devolución total: ' + reason, updatedById: actorId },
    });
    await tx.auditLog.create({
      data: { actorId, entityType: 'Order', entityId: orderId, action: 'CANCELLED', changes: { reason: 'Devolución total: ' + reason } },
    });
    return true;
  }

  async cancel(orderId: string, dto: CancelSaleDto, actorId: string) {
    const { pedido, recienCancelado } = await this.prisma.$transaction((tx) => this.cancelWithClient(tx, orderId, dto, actorId));
    if (recienCancelado) void avisarCancelacion(this.prisma, this.emails, orderId);
    return pedido;
  }

  private async cancelWithClient(
    tx: Prisma.TransactionClient,
    orderId: string,
    dto: CancelSaleDto,
    actorId: string,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { isMadeToOrder: true } } } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Venta no encontrada');
    if (order.status === 'CANCELLED') return { pedido: order, recienCancelado: false };
    this.assertMercadoPagoRefunded(order, dto.mercadoPagoReference);
    await this.restoreCancelledStock(tx, order, dto.reason, actorId);
    const chargeCount = await this.refundCharges(tx, order, dto, actorId);
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: chargeCount ? 'REFUNDED' : 'PENDING',
        inventoryStatus:
          order.inventoryStatus === InventoryStatus.DEDUCTED
            ? InventoryStatus.RESTORED
            : order.inventoryStatus,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
        updatedById: actorId,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        entityType: 'Order',
        entityId: orderId,
        action: 'CANCELLED',
        changes: { reason: dto.reason },
      },
    });
    return { pedido: updated, recienCancelado: true };
  }

  /**
   * Lo cobrado por Mercado Pago se devuelve desde Mercado Pago (acá no se mueve
   * plata): para cancelar hace falta la referencia de ese reintegro.
   */
  private assertMercadoPagoRefunded(order: CancelOrder, reference?: string) {
    const balance = this.paymentBalances(order).get(PaymentMethod.MERCADOPAGO) ?? 0;
    if (balance > 0.009 && !reference?.trim()) {
      throw new ConflictException(
        'Este pedido se cobró por Mercado Pago. Devolvé el dinero desde Mercado Pago y cargá la referencia del reintegro para cancelarlo.',
      );
    }
  }

  private async restoreCancelledStock(
    tx: Prisma.TransactionClient,
    order: CancelOrder,
    reason: string,
    actorId: string,
  ) {
    if (order.inventoryStatus !== InventoryStatus.DEDUCTED) return;
    await this.inventory.restoreWithClient(
      tx,
      order.items
        .filter((item) => !item.product.isMadeToOrder)
        .map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      {
        orderId: order.id,
        branchId: order.branchId || undefined,
        userId: actorId,
        type: InventoryMovementType.CANCELLATION,
        reason: `Cancelación: ${reason}`,
      },
    );
  }

  private async refundCharges(
    tx: Prisma.TransactionClient,
    order: CancelOrder,
    dto: CancelSaleDto,
    actorId: string,
  ) {
    const charges = order.payments.filter((payment) => payment.kind === PaymentKind.CHARGE);
    for (const [method, amount] of this.paymentBalances(order)) {
      if (amount > 0) {
        await this.payments.refundWithClient(
          tx,
          order,
          amount,
          method,
          actorId,
          method === PaymentMethod.MERCADOPAGO ? dto.mercadoPagoReference?.trim() : `Cancelación ${order.number}`,
          dto.cashSessionId,
        );
      }
    }
    return charges.length;
  }

  private paymentBalances(order: CancelOrder) {
    const balances = new Map<PaymentMethod, number>();
    for (const payment of order.payments) {
      if (payment.status !== PaymentState.CONFIRMED) continue;
      const signed = payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount;
      balances.set(payment.method, (balances.get(payment.method) ?? 0) + signed);
    }
    return balances;
  }
}

/** true si, sumando esta devolución a las anteriores, no queda ninguna unidad sin devolver. */
export function devolvioTodo(
  items: { id: string; quantity: number; returnItems: { quantity: number }[] }[],
  ahora: { orderItemId: string; quantity: number }[],
): boolean {
  return items.length > 0 && items.every((item) => {
    const antes = item.returnItems.reduce((suma, r) => suma + r.quantity, 0);
    const nuevas = ahora.filter((r) => r.orderItemId === item.id).reduce((suma, r) => suma + r.quantity, 0);
    return antes + nuevas >= item.quantity;
  });
}

type CancelOrder = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { select: { isMadeToOrder: true } } } };
    payments: true;
  };
}>;
