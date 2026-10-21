# Schmidt — estado por etapas

Tienda de carteras de eco cuero armada sobre la base de HomePadel (`../homepadel`, solo lectura: no se toca).
Este archivo es el punto de partida para retomar en una conversación nueva.

| Etapa | Estado |
|---|---|
| 1. Proyecto limpio + configuración central de marca | ✅ Terminada (2026-10-20) |
| 2. Modelo de producto, ocultar módulos, seed de 5 productos | ⏸ No empezada: esperar OK |
| 3. Tema y diseño de la tienda (home, producto, carrito, checkout) | Pendiente |
| 4. Textos, mails y páginas legales | Pendiente |
| 5. Revisión final y pendientes del cliente | Pendiente |

## Etapa 1: qué se hizo

- Copia de los archivos versionados de homepadel (`git archive`): sin `.git`, `node_modules`, `.next`, `dist`, `.env*`, `uploads` ni `tsbuildinfo`. Repo git nuevo en `main`.
- **Configuración central de marca**: `packages/marca/marca.json` (nombre, rubro, descripción, dominio, mails, WhatsApp, redes, colores, logo, prefijo de pedidos `SCH`, prefijo de storage, carpeta de Cloudinary).
  - `node scripts/sync-marca.mjs` la copia a `apps/*/src/config/marca.ts` (generado, se commitea: Railway y Vercel construyen cada app por separado y no pueden importar de afuera).
  - CI: job `marca` con `--check`, falla si algún `marca.ts` quedó desactualizado.
- El código lee `MARCA` en lugar de "Home Pádel": SEO, footer, logo, mails (remitente, asunto, logo), CORS, hosts de Meta, feed de catálogo, carpeta de Cloudinary, número de pedido, claves de localStorage, defaults del CMS y del backoffice, seed y reset de admin.
- Logo provisorio en texto serif: `apps/{frontend,backoffice}/public/marca/logo.svg`. La imagen para redes (`opengraph-image`) se dibuja con el nombre y los colores de la marca.
- **Datos reales de HomePadel eliminados**:
  - `prisma/seed_channels.sql` (WhatsApp real, mail, Instagram, Messenger): borrado.
  - Códigos de verificación de Google Search Console y de dominio en Meta en `layout.tsx`: ahora por `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`.
  - Redirección `homepadel.store → homepadel.com.ar` en `next.config.ts`: borrada.
  - URL de producción de Railway en `.claude/launch.json`: reemplazada por localhost.
  - Logos de HomePadel (`home-padel-logo.png`, `public/email/logo.png`): borrados.
  - Teléfono `11 4083-2310` de los tests: reemplazado por `11 5555-0123` (ficticio).
  - Datos del repartidor de Envío Flex (nombre y dirección): sacados de comentarios y textos.
- No se encontraron credenciales (tokens de Mercado Pago, Resend, Meta, Google, Cloudinary ni cadenas de base) en el código. Los `.env.example` solo traen valores de ejemplo.

## Etapa 1: qué se corrió (resultado real)

| App | Compilación (`tsc --noEmit`) | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 56 suites, 411 tests | 0 errores, 168 warnings (igual que el origen) | — |
| frontend | ✅ | ✅ 21 tests (`npm test`) | 0 errores, 64 warnings (igual que el origen) | ✅ `next build` |
| backoffice | ✅ | sin tests | 0 errores, 307 warnings (igual que el origen) | ✅ `next build` |

Los warnings de lint son deuda heredada (el origen no da limpio a propósito). No se corrió nada contra una base de datos: no hay `.env`.

## Pendiente que quedó de la etapa 1

- **Logo de los mails**: `MARCA.logo.mail` apunta a `/email/logo.png`, que no existe (se borró el de HomePadel). Los mails salen con la imagen rota hasta que haya un PNG del logo (Gmail/Outlook no muestran SVG). Resolver en la etapa 4.
- **Contenido de pádel**: 41 archivos de `src` siguen con textos o lógica de pádel (paletas, formatos, niveles, categorías, imágenes de `public/images/categories`, bolsa de regalo). Corresponde a las etapas 2 a 4.
- `docs/` sigue describiendo HomePadel en varios lugares (ejemplos, historia). Se revisa en la etapa 4.

## Decisiones del cliente (respuestas del 2026-10-20)

- Datos de la marca (dominio, WhatsApp, Instagram, mails, razón social/CUIT): **pendientes**. En `marca.json` hay valores de ejemplo (`*.schmidt.example`) y WhatsApp/redes vacíos (los links de WhatsApp llevan a /contacto mientras tanto). En el catálogo de Canva figura el WhatsApp 11 6115-0361: confirmar antes de cargarlo.
- Fotos: usar provisorias de ejemplo.
- Envíos: **desestimado por ahora** (no se integra Correo Argentino ni Flex; queda lo que hay).
- Bolsa de regalo: **desestimada por ahora**.
- Credenciales cargadas desde el backoffice (Meta, Instagram, Correo Argentino, token de MP de respaldo): **se dejan editables** como en el origen.
- Categorías: **separarlas** (no todo "Carteras").
- Diseño: libre, más distintivo que el mockup; investigar ecommerces de carteras que venden bien.
- Etapa 2 (Prisma): "hacé lo más correcto" → plan: migración que solo agrega `Product.material` y `ProductVariant.colorHex`; medidas en `dimensionWidth/Height` (cm); bolsillos en `features`; columnas de pádel quedan en la base pero salen de DTOs, formularios y tienda.

## Datos para la etapa 2 (del catálogo de Canva)

- "Elegí tu color": todos los modelos se pueden hacer a pedido en otros colores. **Stock inmediato** = colores disponibles para entrega; **A pedido** = se confecciona. El modelo ya tiene `isMadeToOrder`, `estimatedDays` y `requiredDeposit` en `Product`.
- **Ambar**: el catálogo dice **36 cm de ancho** x 20 cm de alto (el pedido decía 30 cm): confirmar con la clienta. Forrado interno.
- **Astra**: forrado interno.
- Stock por color desconocido: usar 10 de prueba y avisar.

## TODO de Correo Argentino (`apps/backend/src/shipping/shipping.service.ts`)

No está resuelto: `createShipment` solo crea un `Shipment` en `PENDING`, sin llamar a la API Paq.ar. El costo de envío es una tarifa fija + umbral de envío gratis (backoffice); el seguimiento se carga a mano; la sucursal la escribe el cliente. `POST /shipping` recibe `any` sin DTO (ninguna pantalla lo usa). Para resolverlo hace falta contrato con Correo Argentino (agreement + API key), peso y medidas de cada paquete y la integración. Desestimado por ahora.

## Cómo retomar

```bash
cd apps/backend && npm install && npx prisma generate   # ídem frontend / backoffice con npm install
node scripts/sync-marca.mjs                             # después de editar packages/marca/marca.json
```
