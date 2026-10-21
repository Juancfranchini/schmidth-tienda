# Schmidt — estado por etapas

Tienda de carteras de eco cuero armada sobre la base de HomePadel (`../homepadel`, solo lectura: no se toca).
Este archivo es el punto de partida para retomar en una conversación nueva.

| Etapa | Estado |
|---|---|
| 1. Proyecto limpio + configuración central de marca | ✅ Terminada (2026-10-20) |
| 2. Modelo de producto, ocultar módulos, seed de 5 productos | ✅ Terminada (2026-10-20), seed y migración sin probar contra una base |
| 3. Tema y diseño de la tienda (home, producto, carrito, checkout) | Pendiente |
| 4. Textos, mails y páginas legales | Pendiente |
| 5. Revisión final y pendientes del cliente | Pendiente |

## Etapa 2: qué se hizo

- **Prisma** (migración `20261020120000_add_material_color_hex`, solo agrega dos columnas opcionales, no borra nada): `Product.material` y `ProductVariant.colorHex` (color de la muestra en la tienda).
- **Campos de pádel**: las columnas `shape`, `level`, `gender`, `performanceStats`, `compareData`, `showPerformance` y `showCompare` **siguen en la base**, pero:
  - El DTO de producto ya no las acepta (el ValidationPipe devuelve 400 si alguien las manda; hay un test).
  - Se sacaron de los formularios del backoffice (modal rápido y página completa), del filtro de búsqueda avanzada y de las pestañas Rendimiento y Compara de "Contenido de fichas".
  - Se sacaron de la tienda: asesor del catálogo, estadísticas de rendimiento, comparador y formato en las tarjetas. Se borraron los componentes que quedaron sin uso (iconos de specs, selector de iconos, comparador, imagen de formato). Están en `../homepadel` si hicieran falta.
  - **Falta (etapa 3, al rediseñar el catálogo):** los filtros de género/formato/nivel de la tienda (y los parámetros `shape`, `gender`, `level` del endpoint de listado del backend) siguen en el código; quedan vacíos porque ningún producto tiene esos valores.
- **Producto nuevo**: formulario con Material y, por variante, color + selector de color de muestra (`colorHex`). Medidas: `dimensionWidth`/`dimensionHeight` en cm del producto. Bolsillos y compartimentos: JSON `features`.
- **Módulos ocultos** con un flag, sin borrar código: `backoffice.rutasOcultas` en `packages/marca/marca.json` (+ `node scripts/sync-marca.mjs`). Oculta del menú y bloquea la ruta (redirige al inicio): punto de venta, caja, equipo PDV, configuración PDV, gastos, guía de talles, clientes (CRM), reseñas (+ info de reseñas), testimonios, formatos de paleta y marcas. Para reactivar uno, sacarlo de la lista. Es solo del backoffice: **en la tienda las reseñas y testimonios siguen y se resuelven en la etapa 3**.
- **Seed** (`prisma/seed.ts`, reescrito): admin, 4 categorías (De hombro, Bandoleras, Totes, Bolsos), marca Schmidt, los 5 productos con sus colores (una variante por color con `colorHex` + variante base), canales de contacto, hero, beneficios, FAQ y secciones del sitio. Ya no siembra testimonios (eran inventados). El stock por color es **de prueba: 10 por color**. Fotos provisorias de placehold.co (agregado a los dominios permitidos de `next.config.ts`).
  - **A confirmar con la clienta**: medidas, bolsillos, forrado, categoría de cada modelo y precios (todo leído de capturas del catálogo).
  - Categorías (mi propuesta): Astra = De hombro, Siena = Bandoleras, Ambar y Soho = Totes, Monaco = Bolsos.
  - Ambar: el pedido dice 30 cm de ancho y el catálogo de Canva dice 36 cm; el seed usa 30.
- **Corrección a la etapa 1**: el barrido de marca de la etapa 1 usó una expresión que no reconocía las tildes en este entorno y dejó ~45 apariciones de "Home Pádel" (mails, páginas, login del backoffice, metadatos). Ya están pasadas a `MARCA`, y el barrido corregido (`home ?p.{1,2}del`) da cero en el código. Sigue habiendo texto de pádel genérico (ver abajo).

### Etapa 2: qué se corrió (resultado real)

| App | Compilación | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 57 suites, 419 tests (+8 nuevos del DTO) | 0 errores, 168 warnings (igual que el origen) | — |
| frontend | ✅ | ✅ 21 tests | 0 errores, 58 warnings (origen: 64) | ✅ |
| backoffice | ✅ | sin tests | 0 errores, 292 warnings (origen: 307) | ✅ |

**No se probó**: la migración y el seed contra una base real (no hay Postgres ni `.env` acá), ni guardar un producto desde el backoffice, ni la tienda con datos. Antes de usar, con una base de prueba: `npx prisma migrate deploy && npm run prisma:seed` (en `apps/backend`, con `SEED_ADMIN_PASSWORD` cargada).

### Pendiente para las etapas 3 y 4

- Home (`components/home`: marcas, categorías, hero, titular, newsletter), buscador, menú y footer todavía tienen **texto de pádel** ("Paletas, indumentaria…", "Bullpadel"), imágenes de categorías de pádel (`public/images/categories`) y la imagen de la bolsa de regalo. Etapa 3.
- **Redirecciones del sitio viejo de HomePadel** (Tiendanube) en `middleware.ts` y `lib/legacyUrls.ts` (+ su test): no aplican a Schmidt; borrar o reemplazar en la etapa 3.
- Textos legales, FAQ, páginas de información, mails y logo de mails: etapa 4.
- La bolsa de regalo (desestimada) sigue en el código, apagada por configuración (precio 0): ocultarla de la tienda en la etapa 3.

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
