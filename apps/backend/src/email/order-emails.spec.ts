import { enlaceWhatsapp, mailCancelado, mailDespachado, mailPagoRecibido, mailTransferencia } from './order-emails';

const PEDIDO = { orderNumber: 'SCH-1', customerName: 'Ana', items: [{ name: 'Paleta Nox', quantity: 2, price: 100000 }], total: 200000 };
const CUENTA = { alias: 'schmidt.ventas', cbu: '0000003100012345678901', titular: 'Schmidt SRL', banco: 'Banco Ejemplo' };

describe('mail de transferencia', () => {
  it('da los datos de la cuenta, el total y pide el comprobante por WhatsApp con el número de la tienda', () => {
    const { html, subject } = mailTransferencia({ ...PEDIDO, datos: CUENTA, whatsapp: '1155550123' });
    expect(subject).toContain('SCH-1');
    expect(html).toContain('schmidt.ventas');
    expect(html).toContain('0000003100012345678901');
    expect(html).toContain('$');
    expect(html).toMatch(/comprobante/i);
    expect(html).toContain('https://wa.me/5491155550123');
    expect(html).toContain('1155550123');
  });

  it('sin número de WhatsApp cargado igual pide el comprobante, pero sin inventar un link', () => {
    const { html } = mailTransferencia({ ...PEDIDO, datos: CUENTA, whatsapp: null });
    expect(html).toMatch(/comprobante/i);
    expect(html).not.toContain('wa.me');
  });

  it('sin datos de cuenta no deja un recuadro vacío', () => {
    const { html } = mailTransferencia({ ...PEDIDO, datos: null, whatsapp: '1155550123' });
    expect(html).not.toContain('Transferí');
  });

  it('escapa lo que escribió el cliente: no se puede meter HTML en el mail', () => {
    const { html } = mailTransferencia({ ...PEDIDO, customerName: '<script>alert(1)</script>', datos: CUENTA, whatsapp: null });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('mail de pago recibido', () => {
  it('con envío, avisa que va a llegar el seguimiento', () => {
    expect(mailPagoRecibido({ ...PEDIDO, esRetiro: false }).html).toMatch(/seguimiento/i);
  });
  it('con retiro en el local no promete seguimiento', () => {
    const { html } = mailPagoRecibido({ ...PEDIDO, esRetiro: true });
    expect(html).not.toMatch(/seguimiento/i);
    expect(html).toMatch(/retirar/i);
  });
});

describe('mail de pedido despachado', () => {
  it('lleva el número y el link de seguimiento', () => {
    const { html } = mailDespachado({ orderNumber: 'SCH-1', customerName: 'Ana', trackingNumber: 'AR123', trackingUrl: 'https://correo.example/seguir?n=AR123' });
    expect(html).toContain('AR123');
    expect(html).toContain('href="https://correo.example/seguir?n=AR123"');
  });
  it('sin seguimiento avisa igual, sin un "Pendiente" inventado', () => {
    const { html } = mailDespachado({ orderNumber: 'SCH-1', customerName: 'Ana' });
    expect(html).toMatch(/en camino/i);
    expect(html).not.toMatch(/pendiente|seguimiento:/i);
  });
  it('un link que no es http(s) se descarta (javascript: en un href)', () => {
    expect(mailDespachado({ orderNumber: 'SCH-1', customerName: 'Ana', trackingUrl: 'javascript:alert(1)' }).html).not.toContain('javascript');
  });
});

describe('enlaceWhatsapp', () => {
  it('arma el link con el código de país', () => {
    expect(enlaceWhatsapp('11 5555-0123')).toBe('https://wa.me/5491155550123');
    expect(enlaceWhatsapp('+54 9 11 5555 0123')).toBe('https://wa.me/5491155550123');
    expect(enlaceWhatsapp('123')).toBeNull();
    expect(enlaceWhatsapp(null)).toBeNull();
  });
});

describe('mailCancelado', () => {
  const base = { orderNumber: 'SCH-9', customerName: '<b>Ana</b>', whatsapp: 'https://wa.me/5491155550123' };

  it('dice cuánto se reintegró y por qué medio, y escapa el nombre', () => {
    const m = mailCancelado({ ...base, reintegro: 450000, medio: 'Mercado Pago' });
    expect(m.subject).toBe('Tu pedido SCH-9 fue cancelado');
    expect(m.html).toContain('450.000');
    expect(m.html).toContain('por Mercado Pago');
    expect(m.html).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(m.html).toContain('wa.me/5491155550123');
  });

  it('sin reintegro no menciona plata; sin WhatsApp ofrece responder el mail', () => {
    const m = mailCancelado({ ...base, whatsapp: null, reintegro: 0, medio: null });
    expect(m.html).not.toContain('reintegramos');
    expect(m.html).toContain('respondé este mail');
  });
});
