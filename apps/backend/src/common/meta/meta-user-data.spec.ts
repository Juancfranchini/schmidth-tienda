import * as crypto from 'crypto';
import { userDataParaMeta, variantesTelefono } from './meta-user-data';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

describe('variantesTelefono', () => {
  it('arma las dos variantes internacionales de un celular argentino', () => {
    expect(variantesTelefono('11 5555-0123')).toEqual(['5491155550123', '541155550123']);
  });

  it('da lo mismo si ya viene con +54 9, con +54 o con 0 adelante', () => {
    const esperado = ['5491155550123', '541155550123'];
    expect(variantesTelefono('+54 9 11 5555 0123')).toEqual(esperado);
    expect(variantesTelefono('+54 11 5555 0123')).toEqual(esperado);
    expect(variantesTelefono('011 5555 0123')).toEqual(esperado);
    expect(variantesTelefono('0054 9 11 5555 0123')).toEqual(esperado);
  });

  it('descarta lo que no puede ser un teléfono', () => {
    expect(variantesTelefono('123')).toEqual([]);
    expect(variantesTelefono('')).toEqual([]);
  });
});

describe('userDataParaMeta', () => {
  it('manda el email normalizado y cifrado, nunca en claro', () => {
    const datos = userDataParaMeta({ emails: ['  Cliente@Ejemplo.com '] });
    expect(datos.em).toEqual([sha256('cliente@ejemplo.com')]);
    expect(JSON.stringify(datos)).not.toContain('ejemplo');
  });

  it('manda las dos variantes del teléfono cifradas', () => {
    const datos = userDataParaMeta({ telefono: '11 5555-0123' });
    expect(datos.ph).toEqual([sha256('5491155550123'), sha256('541155550123')]);
    expect(JSON.stringify(datos)).not.toContain('55550123');
  });

  it('no repite un email que llega dos veces (checkout y Mercado Pago) y descarta los inválidos', () => {
    const datos = userDataParaMeta({ emails: ['a@b.com', 'A@B.com', 'no-es-un-email', null, undefined] });
    expect(datos.em).toEqual([sha256('a@b.com')]);
  });

  it('omite lo que no hay en vez de mandar campos vacíos', () => {
    expect(userDataParaMeta({})).toEqual({});
    expect(userDataParaMeta({ ip: '1.2.3.4', userAgent: 'jest' })).toEqual({ client_ip_address: '1.2.3.4', client_user_agent: 'jest' });
  });
});
