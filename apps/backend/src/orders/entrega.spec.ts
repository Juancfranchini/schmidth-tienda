import { BadRequestException } from '@nestjs/common';
import { direccionDeSucursal, entregaDe, entregaEnNotas } from './entrega';

describe('entregaDe', () => {
  it('Correo Argentino y Andreani: a domicilio salvo que pidan sucursal', () => {
    expect(entregaDe('correo_argentino')).toEqual({ modalidad: 'domicilio', sucursal: null });
    expect(entregaDe(undefined, 'domicilio')).toEqual({ modalidad: 'domicilio', sucursal: null });
    expect(entregaDe('andreani', 'sucursal', '  Pilar Centro ')).toEqual({ modalidad: 'sucursal', sucursal: 'Pilar Centro' });
  });

  it('retiro en sucursal sin decir cuál se rechaza con un mensaje claro', () => {
    expect(() => entregaDe('andreani', 'sucursal', ' ')).toThrow(BadRequestException);
    expect(() => entregaDe('correo_argentino', 'sucursal')).toThrow(/sucursal de Correo Argentino/);
  });

  it('Flex y retiro en el local no tienen modalidad, aunque el navegador mande una', () => {
    expect(entregaDe('flex', 'sucursal', 'X')).toEqual({ modalidad: null, sucursal: null });
    expect(entregaDe('retiro_local', 'sucursal', 'X')).toEqual({ modalidad: null, sucursal: null });
  });
});

describe('direccionDeSucursal y notas', () => {
  it('arma el texto que ve la tienda', () => {
    expect(direccionDeSucursal('andreani', 'Pilar Centro', 'Pilar, Buenos Aires (1629)')).toBe('Andreani — Retiro en sucursal: Pilar Centro — Pilar, Buenos Aires (1629)');
    expect(direccionDeSucursal(undefined, 'Sucursal 25', '')).toBe('Correo Argentino — Retiro en sucursal: Sucursal 25');
  });

  it('solo guarda en notas lo que aplica', () => {
    expect(entregaEnNotas({ modalidad: null, sucursal: null })).toEqual({});
    expect(entregaEnNotas({ modalidad: 'domicilio', sucursal: null })).toEqual({ shippingModalidad: 'domicilio' });
    expect(entregaEnNotas({ modalidad: 'sucursal', sucursal: 'X' })).toEqual({ shippingModalidad: 'sucursal', shippingSucursal: 'X' });
  });
});
