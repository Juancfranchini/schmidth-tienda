/**
 * El 26/09/2026, al mudar el sitio de schmidt.example a schmidt.example,
 * cambiar `FRONTEND_URL` al dominio nuevo antes de que el DNS terminara de
 * propagar dejó afuera a schmidt.example —que seguía siendo el dominio real
 * que la gente visitaba— y se cayeron envíos, medios de pago, Instagram y la
 * configuración general en el sitio en producción.
 *
 * Estas pruebas fijan que los dos dominios de la tienda entran siempre,
 * pase lo que pase con la variable de entorno.
 */

import { esOrigenPermitido } from './cors-origin';

describe('esOrigenPermitido', () => {
  it('permite los dos dominios de la tienda aunque FRONTEND_URL apunte a otro', () => {
    const env = { frontendUrl: 'https://schmidt.example' };

    expect(esOrigenPermitido('https://schmidt.example', env)).toBe(true);
    expect(esOrigenPermitido('https://www.schmidt.example', env)).toBe(true);
    expect(esOrigenPermitido('https://schmidt.example', env)).toBe(true);
    expect(esOrigenPermitido('https://www.schmidt.example', env)).toBe(true);
  });

  it('los permite incluso sin ninguna variable de entorno configurada', () => {
    expect(esOrigenPermitido('https://schmidt.example', {})).toBe(true);
    expect(esOrigenPermitido('https://schmidt.example', {})).toBe(true);
  });

  it('sigue sumando lo que diga FRONTEND_URL, para una preview o un staging', () => {
    const env = { frontendUrl: 'https://schmidt-git-preview.vercel.app' };
    expect(esOrigenPermitido('https://schmidt-git-preview.vercel.app', env)).toBe(true);
  });

  it('acepta cualquier subdominio de vercel.app', () => {
    expect(esOrigenPermitido('https://schmidt-abc123.vercel.app', {})).toBe(true);
  });

  it('sin origen —curl, Postman, llamadas server-side— deja pasar', () => {
    expect(esOrigenPermitido(undefined, {})).toBe(true);
  });

  it('rechaza un origen que no es ninguno de los conocidos', () => {
    expect(esOrigenPermitido('https://un-sitio-cualquiera.com', {})).toBe(false);
  });

  it('rechaza un dominio parecido pero no exacto', () => {
    expect(esOrigenPermitido('https://schmidt.example.evil.com', {})).toBe(false);
    expect(esOrigenPermitido('http://schmidt.example', {})).toBe(false); // http, no https
  });
});
