import { ImageResponse } from 'next/og';
import { MARCA } from '@/config/marca';

/**
 * Imagen que muestran WhatsApp, Facebook, Instagram y X al compartir un link
 * de la tienda. Se genera una sola vez al compilar: el nombre de la marca en
 * texto sobre sus colores (provisorio hasta tener el logo definitivo).
 *
 * La ficha de producto declara su propia imagen (la foto del producto), que
 * reemplaza a esta.
 */
export const alt = MARCA.nombre + ' — ' + MARCA.rubro;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: MARCA.colores.negro,
          borderBottom: '14px solid ' + MARCA.colores.bordo,
        }}
      >
        <div style={{ fontSize: 150, color: MARCA.colores.blancoRoto, letterSpacing: 12, fontFamily: 'serif' }}>
          {MARCA.nombreLogo}
        </div>
        <div style={{ marginTop: 16, fontSize: 34, color: MARCA.colores.piedra, letterSpacing: 4, textTransform: 'uppercase' }}>
          {MARCA.bajada}
        </div>
      </div>
    ),
    size,
  );
}
