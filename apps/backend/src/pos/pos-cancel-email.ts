// Mail al cliente cuando la tienda cancela un pedido (a mano o por devolución total).
//
// Va después de que la cancelación quedó guardada y sin esperar: un mail que
// falla (dominio, casilla inexistente) no puede deshacer la cancelación.

import { Logger } from '@nestjs/common';
import { PaymentKind, PaymentMethod, PaymentState } from '@prisma/client';
import type { EmailService } from '../email/email.service';
import type { PrismaService } from '../prisma/prisma.service';

const logger = new Logger('AvisoCancelacion');

const MEDIOS: Record<PaymentMethod, string> = {
  MERCADOPAGO: 'Mercado Pago',
  TRANSFER: 'transferencia',
  CASH: 'efectivo',
  CARD: 'tarjeta',
  DIGITAL_WALLET: 'billetera virtual',
  EXTERNAL_TERMINAL: 'posnet',
};

interface PagoParaMail {
  method: PaymentMethod;
  kind: PaymentKind;
  amount: number;
  status: PaymentState;
}

/** Lo reintegrado en total y por qué medio (si fue uno solo). */
export function reintegroDe(pagos: PagoParaMail[]): { monto: number; medio: string | null } {
  const reintegros = pagos.filter((p) => p.kind === PaymentKind.REFUND && p.status === PaymentState.CONFIRMED);
  const medios = [...new Set(reintegros.map((p) => p.method))];
  return {
    monto: Math.round(reintegros.reduce((suma, p) => suma + p.amount, 0)),
    medio: medios.length === 1 ? MEDIOS[medios[0]] : null,
  };
}

/** A quién se le avisa: el mail del checkout y, si no hay, el de la cuenta. */
export function destinatarioDe(notes: string | null, emailDeCuenta?: string | null): { email: string | null; nombre: string } {
  let notas: { buyerEmail?: unknown; buyerName?: unknown } = {};
  try {
    notas = notes ? JSON.parse(notes) : {};
  } catch {
    notas = {};
  }
  const email = (typeof notas.buyerEmail === 'string' && notas.buyerEmail.trim()) || emailDeCuenta || null;
  const nombre = (typeof notas.buyerName === 'string' && notas.buyerName.trim()) || 'Cliente';
  return { email, nombre };
}

export async function avisarCancelacion(prisma: PrismaService, emails: EmailService | undefined, orderId: string): Promise<void> {
  if (!emails) return;
  try {
    const pedido = await prisma.order.findUnique({
      where: { id: orderId },
      select: { number: true, notes: true, user: { select: { email: true } }, payments: { select: { method: true, kind: true, amount: true, status: true } } },
    });
    if (!pedido) return;
    const { email, nombre } = destinatarioDe(pedido.notes, pedido.user?.email);
    if (!email) return;
    const { monto, medio } = reintegroDe(pedido.payments);
    await emails.sendOrderCancelled(email, { orderNumber: pedido.number, customerName: nombre, reintegro: monto, medio });
  } catch (err) {
    logger.error('No se pudo avisar la cancelación del pedido ' + orderId + ': ' + err);
  }
}
