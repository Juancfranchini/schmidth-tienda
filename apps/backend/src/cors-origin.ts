import { MARCA } from './config/marca';

/**
 * Qué orígenes puede aceptar el backend por CORS.
 *
 * Dominios propios de la tienda: salen de la configuración de marca
 * (packages/marca/marca.json → sitio.hosts), no de una variable de entorno.
 * Si depende solo de `FRONTEND_URL`, una mudanza de dominio con el DNS a
 * medio propagar deja afuera al dominio que todavía recibe las visitas y se
 * cae todo lo que depende del backend.
 *
 * No son datos sensibles —son los dominios públicos del sitio—, así que
 * conviene tenerlos acá en vez de en una sola variable de entorno que hay que
 * mantener perfectamente sincronizada con el dominio de turno durante
 * cualquier migración futura.
 */
export const DOMINIOS_PROPIOS: string[] = MARCA.sitio.hosts.flatMap((host) => {
  const sinWww = host.replace(/^www\./, '');
  return ['https://' + sinWww, 'https://www.' + sinWww];
});

/**
 * Decide si un origen puede pasar el CORS, en producción.
 *
 * `frontendUrl` y `backofficeUrl` son las variables de entorno del mismo
 * nombre: siguen sumándose a la lista fija, así que una preview de Vercel con
 * otra URL, o un entorno de staging, se puede seguir habilitando sin tocar
 * código.
 */
export function esOrigenPermitido(
  origin: string | undefined,
  env: { frontendUrl?: string; backofficeUrl?: string },
): boolean {
  // Sin origen (curl, Postman, llamadas server-side) — permitir.
  if (!origin) return true;

  const permitidos = [
    ...DOMINIOS_PROPIOS,
    env.frontendUrl,
    env.backofficeUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((valor): valor is string => Boolean(valor));

  // Acepta cualquier subdominio de vercel.app (previews incluidas).
  return permitidos.includes(origin) || origin.endsWith('.vercel.app');
}
