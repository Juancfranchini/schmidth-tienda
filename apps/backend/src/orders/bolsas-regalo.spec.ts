import { bolsasDeRegalo, cargoDeBolsas, configBolsa, lineaDeBolsas, notasDeBolsas, validarConfigBolsa } from './bolsas-regalo';

describe('bolsasDeRegalo', () => {
  const items = [{ quantity: 2 }, { quantity: 1 }];

  it('sin pedido no van bolsas', () => {
    expect(bolsasDeRegalo(undefined, items)).toBe(0);
  });

  it('respeta lo pedido si no pasa las unidades', () => {
    expect(bolsasDeRegalo(2, items)).toBe(2);
  });

  it('nunca más bolsas que unidades compradas', () => {
    expect(bolsasDeRegalo(10, items)).toBe(3);
  });

  it('descarta negativos y decimales', () => {
    expect(bolsasDeRegalo(-4, items)).toBe(0);
    expect(bolsasDeRegalo(1.9, items)).toBe(1);
  });
});

describe('precio de la bolsa', () => {
  const items = [{ quantity: 2 }];

  it('sin configurar: ofrecida y sin cargo; valores raros se sanean', () => {
    expect(configBolsa(undefined)).toEqual({ precio: 0, activa: true });
    expect(configBolsa({ precio: '2500.4', activa: true })).toEqual({ precio: 2500, activa: true });
    expect(configBolsa({ precio: -5 })).toEqual({ precio: 0, activa: true });
    expect(configBolsa({ precio: 'abc', activa: false })).toEqual({ precio: 0, activa: false });
  });

  it('el cargo es por bolsa y respeta el tope de unidades', () => {
    expect(cargoDeBolsas(5, items, { precio: 3000, activa: true })).toEqual({ cantidad: 2, precio: 3000, total: 6000 });
    expect(cargoDeBolsas(1, items, { precio: 3000, activa: false })).toEqual({ cantidad: 0, precio: 3000, total: 0 });
  });

  it('guardar exige un precio válido', () => {
    expect(validarConfigBolsa({ precio: 2000, activa: true })).toEqual({ precio: 2000, activa: true });
    expect(() => validarConfigBolsa({ precio: -1 })).toThrow(/entre 0 y/);
    expect(() => validarConfigBolsa({ precio: 'gratis' })).toThrow(/entre 0 y/);
    expect(() => validarConfigBolsa({ precio: 9_999_999 })).toThrow(/entre 0 y/);
    expect(() => validarConfigBolsa({ precio: 0, activa: 'si' })).toThrow(/se ofrece/);
  });

  it('notas y renglón para los mails', () => {
    expect(notasDeBolsas({ cantidad: 2, precio: 3000, total: 6000 })).toEqual({ bolsasRegalo: 2, precioBolsaRegalo: 3000 });
    expect(notasDeBolsas({ cantidad: 1, precio: 0, total: 0 })).toEqual({ bolsasRegalo: 1 });
    expect(lineaDeBolsas({ bolsasRegalo: 2, precioBolsaRegalo: 3000 })).toEqual([{ name: 'Bolsa de regalo Schmidt', quantity: 2, price: 3000 }]);
    expect(lineaDeBolsas({})).toEqual([]);
  });
});
