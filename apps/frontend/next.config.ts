import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // El lint es un chequeo aparte (`npm run lint`, y CI) — no bloquea el build
  // de producción. Con esto en false, `next build`/Vercel fallaría cada vez
  // que exista una sola línea de deuda de lint ya conocida (ver
  // docs/convenciones-codigo.md), que hoy es la mayoría de los componentes.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // Desarrollo local
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      // Railway (backend en producción)
      { protocol: 'https', hostname: '*.railway.app' },
      { protocol: 'https', hostname: '*.up.railway.app' },
      // Catálogo y foto oficial de respaldo para el pack de overgrips.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.bullpadel.com' },
    ],
  },
  // El login con Google pasa por el dominio de la tienda: Google muestra
  // "Iniciar sesión en <dominio de vuelta>", y con la vuelta directa al
  // backend mostraba la dirección técnica del backend. La ida y la vuelta
  // tienen que ir por el mismo dominio porque la cookie de PKCE se guarda en
  // el que atiende la ida.
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return [];
    return [{ source: '/api/auth/google/:path*', destination: api.replace(/\/+$/, '') + '/auth/google/:path*' }];
  },
};

export default nextConfig;
