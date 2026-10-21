import { esCodigoDePruebaValido, esOrigenDeProduccion } from './meta-destino';
import { clienteDesdeRequest } from './meta-cliente';

describe('esOrigenDeProduccion', () => {
  const entorno = process.env;
  afterEach(() => {
    process.env = entorno;
  });

  it('solo la tienda de producción, por https', () => {
    expect(esOrigenDeProduccion('https://www.schmidt.example')).toBe(true);
    expect(esOrigenDeProduccion('https://www.schmidt.example/checkout?x=1')).toBe(true);
    expect(esOrigenDeProduccion('http://www.schmidt.example')).toBe(false);
    expect(esOrigenDeProduccion('http://localhost:3000')).toBe(false);
    expect(esOrigenDeProduccion('https://otro-dominio.example')).toBe(false);
    expect(esOrigenDeProduccion('https://www.schmidt.example.evil.com')).toBe(false);
    expect(esOrigenDeProduccion(undefined)).toBe(false);
    expect(esOrigenDeProduccion('cualquier cosa')).toBe(false);
  });

  it('los dominios de producción se pueden cambiar por entorno', () => {
    process.env = { ...entorno, META_PRODUCTION_HOSTS: 'schmidt.example, www.schmidt.example' };
    expect(esOrigenDeProduccion('https://schmidt.example')).toBe(true);
  });
});

describe('esCodigoDePruebaValido', () => {
  const entorno = process.env;
  afterEach(() => {
    process.env = entorno;
  });

  it('solo vale el código cargado en el backoffice o en el entorno', () => {
    expect(esCodigoDePruebaValido({ testEventCode: 'TEST1' }, 'TEST1')).toBe(true);
    expect(esCodigoDePruebaValido({ testEventCode: 'TEST1' }, 'TEST2')).toBe(false);
    expect(esCodigoDePruebaValido({}, 'TEST1')).toBe(false);
    expect(esCodigoDePruebaValido({ testEventCode: 'TEST1' }, undefined)).toBe(false);
    process.env = { ...entorno, META_TEST_EVENT_CODE: 'ENV9' };
    expect(esCodigoDePruebaValido({ testEventCode: 'TEST1' }, 'ENV9')).toBe(true);
  });
});

describe('clienteDesdeRequest', () => {
  const req = (headers: Record<string, string>) => ({ headers, socket: {} }) as never;

  it('sin header Origin toma el origen del Referer', () => {
    expect(clienteDesdeRequest(req({ referer: 'https://www.schmidt.example/checkout' })).origen).toBe('https://www.schmidt.example');
  });

  it('prefiere las cookies que manda el navegador y descarta las que no tienen formato de Pixel', () => {
    const cliente = clienteDesdeRequest(req({ cookie: '_fbp=basura; _fbc=fb.1.1700000000000.Cookie' }), { fbp: 'fb.1.1700000000000.123' });
    expect(cliente.fbp).toBe('fb.1.1700000000000.123');
    expect(cliente.fbc).toBe('fb.1.1700000000000.Cookie');
  });
});
