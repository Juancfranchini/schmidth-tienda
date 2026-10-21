import { ConflictException } from '@nestjs/common';
import { PosReturnsService, devolvioTodo } from './pos-returns.service';
import { destinatarioDe, reintegroDe } from './pos-cancel-email';

const pago = (method: string, kind: string, amount: number) => ({ method, kind, amount, status: 'CONFIRMED' });

function armar(orden: Record<string, unknown>) {
  const tx = {
    order: { findUnique: jest.fn().mockResolvedValue(orden), update: jest.fn().mockImplementation(({ data }) => ({ ...orden, ...data })) },
    auditLog: { create: jest.fn() },
    saleReturn: { create: jest.fn().mockResolvedValue({ id: 'dev-1' }), findUnique: jest.fn().mockResolvedValue({ id: 'dev-1' }) },
  };
  const prisma = {
    $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    order: { findUnique: jest.fn().mockResolvedValue({ number: 'SCH-1', notes: JSON.stringify({ buyerEmail: 'ana@x.com', buyerName: 'Ana' }), user: null, payments: [pago('MERCADOPAGO', 'REFUND', 5000)] }) },
  };
  const inventory = { restoreWithClient: jest.fn() };
  const payments = { refundWithClient: jest.fn().mockResolvedValue({ status: 'REFUNDED' }) };
  const emails = { sendOrderCancelled: jest.fn().mockResolvedValue({}) };
  const service = new PosReturnsService(prisma as never, inventory as never, payments as never, emails as never);
  return { tx, prisma, payments, emails, service };
}

const pedidoMp = {
  id: 'o-1', number: 'SCH-1', status: 'PAID', total: 5000, inventoryStatus: 'DEDUCTED', branchId: null,
  items: [{ id: 'i-1', productId: 'p-1', variantId: null, quantity: 1, product: { isMadeToOrder: false }, returnItems: [] }],
  payments: [pago('MERCADOPAGO', 'CHARGE', 5000)],
};
const espera = () => new Promise((r) => setImmediate(r));

describe('cancelar venta', () => {
  it('cobrada por Mercado Pago y sin referencia: explica qué hacer y no toca nada', async () => {
    const { tx, service } = armar(pedidoMp);
    await expect(service.cancel('o-1', { reason: 'Se arrepintió' }, 'u-1')).rejects.toThrow(ConflictException);
    await expect(service.cancel('o-1', { reason: 'x' }, 'u-1')).rejects.toThrow(/Devolvé el dinero desde Mercado Pago/);
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('con la referencia: registra el reintegro, cancela y le avisa al cliente', async () => {
    const { tx, payments, emails, service } = armar(pedidoMp);
    const r = await service.cancel('o-1', { reason: 'Sin stock', mercadoPagoReference: ' 123456789 ' }, 'u-1');
    expect(payments.refundWithClient).toHaveBeenCalledWith(tx, pedidoMp, 5000, 'MERCADOPAGO', 'u-1', '123456789', undefined);
    expect(r).toMatchObject({ status: 'CANCELLED', paymentStatus: 'REFUNDED' });
    await espera();
    expect(emails.sendOrderCancelled).toHaveBeenCalledWith('ana@x.com', { orderNumber: 'SCH-1', customerName: 'Ana', reintegro: 5000, medio: 'Mercado Pago' });
  });

  it('una venta ya cancelada no se vuelve a cancelar ni manda otro mail', async () => {
    const { tx, emails, service } = armar({ ...pedidoMp, status: 'CANCELLED' });
    await service.cancel('o-1', { reason: 'x' }, 'u-1');
    await espera();
    expect(tx.order.update).not.toHaveBeenCalled();
    expect(emails.sendOrderCancelled).not.toHaveBeenCalled();
  });

  it('si el mail falla, la cancelación queda igual', async () => {
    const { emails, service } = armar({ ...pedidoMp, payments: [] });
    emails.sendOrderCancelled.mockRejectedValue(new Error('dominio sin verificar'));
    await expect(service.cancel('o-1', { reason: 'x' }, 'u-1')).resolves.toMatchObject({ status: 'CANCELLED' });
    await espera();
  });
});

describe('devolución total', () => {
  const dto = (cantidad: number) => ({ type: 'RETURN' as const, reason: 'Falla', items: [{ orderItemId: 'i-1', quantity: cantidad }] });
  const pedido = { ...pedidoMp, items: [{ ...pedidoMp.items[0], quantity: 2 }] };

  it('devolver todo cancela el pedido y avisa', async () => {
    const { tx, emails, service } = armar(pedido);
    await service.createReturn('o-1', dto(2), 'u-1');
    expect(tx.order.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) }));
    await espera();
    expect(emails.sendOrderCancelled).toHaveBeenCalled();
  });

  it('una devolución parcial o un cambio no cancelan', async () => {
    const a = armar(pedido);
    await a.service.createReturn('o-1', dto(1), 'u-1');
    const b = armar(pedido);
    await b.service.createReturn('o-1', { ...dto(2), type: 'EXCHANGE' }, 'u-1');
    for (const { tx } of [a, b]) {
      expect(tx.order.update).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) }));
    }
  });
});

describe('cálculos', () => {
  it('devolvioTodo suma lo devuelto antes', () => {
    const items = [{ id: 'a', quantity: 2, returnItems: [{ quantity: 1 }] }, { id: 'b', quantity: 1, returnItems: [] }];
    expect(devolvioTodo(items, [{ orderItemId: 'a', quantity: 1 }])).toBe(false);
    expect(devolvioTodo(items, [{ orderItemId: 'a', quantity: 1 }, { orderItemId: 'b', quantity: 1 }])).toBe(true);
    expect(devolvioTodo([], [])).toBe(false);
  });

  it('reintegroDe solo cuenta reintegros confirmados y nombra el medio si es uno', () => {
    expect(reintegroDe([pago('MERCADOPAGO', 'CHARGE', 100), pago('MERCADOPAGO', 'REFUND', 100)] as never)).toEqual({ monto: 100, medio: 'Mercado Pago' });
    expect(reintegroDe([pago('CASH', 'REFUND', 50), pago('TRANSFER', 'REFUND', 50)] as never)).toEqual({ monto: 100, medio: null });
    expect(reintegroDe([{ ...pago('CASH', 'REFUND', 50), status: 'VOIDED' }] as never)).toEqual({ monto: 0, medio: null });
  });

  it('destinatarioDe usa el mail del checkout y si no el de la cuenta', () => {
    expect(destinatarioDe(JSON.stringify({ buyerEmail: 'a@x.com', buyerName: 'Ana' }), 'b@x.com')).toEqual({ email: 'a@x.com', nombre: 'Ana' });
    expect(destinatarioDe('no es json', 'b@x.com')).toEqual({ email: 'b@x.com', nombre: 'Cliente' });
    expect(destinatarioDe(null, null)).toEqual({ email: null, nombre: 'Cliente' });
  });
});
