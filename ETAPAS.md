# Schmidt — estado por etapas

Tienda de carteras de eco cuero armada sobre la base de HomePadel (`../homepadel`, solo lectura: no se toca).
Este archivo es el punto de partida para retomar en una conversación nueva.

| Etapa | Estado |
|---|---|
| 1. Proyecto limpio + configuración central de marca | ✅ Terminada (2026-10-20) |
| 2. Modelo de producto, ocultar módulos, seed de 5 productos | ✅ Terminada (2026-10-20); seed y migraciones probados en la etapa 3 |
| 3. Tema y diseño de la tienda (home, producto, carrito, checkout) | ✅ Terminada (2026-10-21), probada en local con datos |
| 4. Textos, mails, páginas legales + branding completo | ✅ Terminada (2026-10-21); textos legales a revisar por un profesional |
| 5. Revisión final y pendientes del cliente | ✅ Terminada (2026-10-21): ver "Pendientes que dependen de vos" |
| Backoffice, fase 1 de 5 (menú, Inicio, link de pago, Clientes) | ✅ Terminada (2026-10-21) |
| Backoffice, fase 2 de 5 (pedidos, remitos, acciones masivas, devoluciones) | ✅ Terminada (2026-10-21) |

## Rediseño del backoffice

Plan acordado (5 fases, cada una se puede usar sola):
1. ✅ Menú nuevo, Inicio con "para hacer hoy", link de pago fuera del punto de venta, Clientes de vuelta.
2. ✅ Pedidos rediseñados (vista por estado, línea de tiempo, imprimir, acciones masivas) y pantalla de devoluciones/arrepentimientos.
3. Editor de producto unificado (hoy son tres: modal, página completa y "Contenido de fichas") y vista de stock.
4. "Tienda online" en una pantalla con vista previa, configuración reordenada y módulos activables desde el panel (hoy es `marca.json`).
5. Buscador global, registro de actividad (la tabla `AuditLog` ya existe) y usuarios con permisos.

### Fase 2: qué se hizo (2026-10-21)

- **Tabla nueva `SolicitudPosventa`** (aprobada): arrepentimientos, cambios y fallas con código, estado (pendiente, en curso, resuelta, rechazada), datos de la clienta, número de pedido escrito y vínculo al pedido si coincide. Migración `20261021120000_add_solicitud_posventa`: solo agrega (tabla, 2 enums, índices); no toca columnas existentes.
- **Botón de arrepentimiento de la tienda**: ahora primero guarda la solicitud y después intenta los mails. Antes, sin Resend configurado devolvía error 503 y el pedido de la clienta se perdía; ahora siempre recibe su código y, si el mail falla, la tienda le pide que lo guarde.
- **API** `GET/POST /api/posventa`, `PATCH /api/posventa/:id` (solo admin, con validación de DTOs). `GET /orders` incluye las solicitudes de cada pedido.
- **Backoffice → Ventas → Devoluciones** (`/devoluciones`, nuevo): pestañas por estado con cuentas, días desde que entró (en rojo si lleva más de 5 abierta), detalle con contacto (mail y WhatsApp), pedido vinculado, cambio de estado y notas internas; "Nueva solicitud" para lo que llega por WhatsApp, Instagram o el local. El Inicio suma la tarea "devoluciones o arrepentimientos abiertos".
- **Pedidos**:
  - **Historial** en el detalle: creado, cobros, reintegros, devoluciones/cambios registrados, solicitudes (con link) y cancelación.
  - **Imprimir remito** (uno desde el detalle, varios desde la selección): `/imprimir?ids=…`, una hoja por pedido con casilleros para armar el paquete.
  - **Selección múltiple** con barra de acciones: marcar enviados, marcar entregados, imprimir remitos y exportar CSV (abre bien en Excel). En lote solo avanzan pedidos ya cobrados; marcar pagado sigue siendo de a uno. Si alguno falla, se informa cuál y por qué, y el resto se aplica igual.
  - `?q=número` abre la lista ya filtrada (lo usa Devoluciones).

### Fase 2: qué se corrió (resultado real)

| App | Compilación | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 60 suites, 438 tests (+5 de posventa) | 0 errores | ✅ |
| frontend | ✅ | ✅ 4 tests | 0 errores | ✅ |
| backoffice | ✅ | sin tests | 0 errores | ✅ |

Probado en el navegador con la base local: arrepentimiento desde la API pública (con y sin pedido que coincida), Devoluciones (lista, cambiar estado y notas, alta manual con validación, vínculo con número en minúsculas), Pedidos (selección, marcar 2 como enviados en lote, historial con la solicitud), hoja de remitos de 3 pedidos e Inicio con la tarea nueva.

- Límite conocido: el pedido no guarda fecha de envío ni de entrega (no existen esas columnas), así que el historial muestra "Hoy: enviado/entregado" sin fecha. Agregarlas es una migración chica; queda para cuando lo decidas.
- En local los mails no salen (no hay clave de Resend): el arrepentimiento responde `avisoEnviado: false`, como corresponde.

### Fase 1: qué se hizo (2026-10-21)

- **Menú** agrupado por tarea: Ventas, Productos, Marketing, Análisis, Tienda online, Páginas y Configuración (antes: 7 grupos mezclados, "Diseño de la tienda" con 12 ítems, estadísticas dentro de "Administración"). `apps/backoffice/src/components/layout/navegacion.ts`.
- **Inicio** (`app/(dashboard)/page.tsx` + `_inicio/`):
  - Accesos rápidos: crear link de pago, nuevo producto, ver tienda.
  - **Puesta en marcha**: 8 pasos (Mercado Pago, mails, Cloudinary, fotos reales, datos de la marca, dominio, textos legales, Meta), cada uno con el lugar donde se resuelve; se pliega y desaparece cuando está todo listo. `GET /api/dashboard/puesta-en-marcha` solo devuelve sí/no, nunca claves.
  - **Para hacer hoy**: pedidos para preparar, por cobrar, carritos para recuperar (7 días, sin contactar), links de pago sin pagar y variantes con stock bajo (≤ 2), con acceso directo a cada lista. `GET /api/dashboard/hoy`.
  - **Últimos 30 días** contra los 30 anteriores: ventas, pedidos y ticket promedio.
  - Se sacaron los KPIs viejos y "pedidos por estado"; la tarjeta de reseñas se oculta con el módulo apagado.
- **Link de pago** (`/link-de-pago`, nuevo): buscar productos, elegir color y cantidad, datos opcionales de la clienta, crear el link y mandarlo por WhatsApp con el número ya cargado; lista de links recientes con su estado (sin pagar, pagando, pagado, vencido). Usa la API existente del punto de venta (`/pos/catalog`, `/pos/links`), así funciona aunque el punto de venta esté oculto. **Antes no había forma de crear un link de pago con el punto de venta oculto.**
- **Clientes (CRM)** visible de nuevo (se sacó `/clientes` de `backoffice.rutasOcultas`).
- Pedidos y productos aceptan `?etapa=…` y `?nuevo=1` para los accesos del Inicio.
- Tienda, página del link (`/venta/[token]`): muestra el color de cada cartera y el botón con el estilo de la marca (antes, texto oscuro sobre bordó).

### Fase 1: qué se corrió (resultado real)

| App | Compilación | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 59 suites, 433 tests (+5 del Inicio) | 0 errores | — |
| frontend | ✅ | ✅ 4 tests | 0 errores | ✅ |
| backoffice | ✅ | sin tests | 0 errores | ✅ |

Probado en el navegador con la base local: login, Inicio (puesta en marcha y "para hacer hoy"), crear un link con dos carteras y datos de la clienta, enlace de WhatsApp con el número normalizado, el link abierto en la tienda, y Clientes.

- Nota: `GET /pos/links` lista solo los links del usuario que los creó (así venía del punto de venta). Con un solo admin no cambia nada; con varios usuarios conviene revisarlo en la fase 5.

## Etapa 5: revisión final

### Qué se revisó y corrigió

- **CI de GitHub**: las cuatro etapas pasan (la última corrida, `40f767b`, en verde).
- **Backoffice probado en el navegador por primera vez** (base local, admin de prueba): login, menú sin los módulos ocultos, `/caja` redirige al inicio, editor de términos con el aviso "a revisar", editar y guardar un producto con sus variantes de color, guardar "Contenido de fichas". Todo OK.
- Corregido en esta revisión:
  - **Google Analytics de HomePadel**: la tienda traía por defecto su ID de medición (`G-LNWKM8X505`); las visitas de Schmidt iban a ir a la cuenta de HomePadel. Ahora sin `NEXT_PUBLIC_GA_MEASUREMENT_ID` no se instala.
  - Un ID de Pixel de Meta que parecía el real de HomePadel en los tests: reemplazado por uno ficticio.
  - El middleware de login del backoffice bloqueaba `/marca/…`: el isotipo no se veía en el login ni como favicon.
  - El inicio del backoffice mostraba gastos con el módulo de gastos oculto.
  - `.env.example`: se documentaron `SWAGGER_ENABLED`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` y `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`.

### Pendientes que dependen de vos

**1. Datos de la marca** (en `packages/marca/marca.json`; después correr `node scripts/sync-marca.mjs`)
- [ ] Dominio: `sitio.url` y `sitio.hosts`.
- [ ] WhatsApp de ventas (`whatsapp`, solo dígitos con 549). En el catálogo de Canva figura 11 6115-0361: confirmar.
- [ ] Instagram y otras redes (`redes`).
- [ ] Mails: contacto, remitente, avisos y admin (`email`).
- [ ] Razón social, CUIT y domicilio (`legal`): hoy los textos legales muestran "[completar …]".
- [ ] Horario de atención (`textos.horario`).

**2. Credenciales y variables** (nada de esto está en el repo)
- [ ] Backend (Railway): `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `FRONTEND_URL`, `BACKEND_URL`, `BACKOFFICE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CLOUDINARY_URL`, `REVALIDATE_SECRET`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (si se usa login con Google), `ENABLE_BANK_TRANSFER` (si se ofrece transferencia).
- [ ] Tienda (Vercel): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` (opcional), `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`.
- [ ] Backoffice (Vercel): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STORE_URL`.
- [ ] Desde el backoffice (Configuración): clave de Resend y remitente (con el dominio verificado en Resend), Pixel de Meta y token de la API de Conversiones, Instagram, datos de la cuenta para transferencias, Correo Argentino (si se usa).
- [ ] Webhook de Mercado Pago apuntando a `https://<backend>/api/payments/webhook`.
- [ ] **Sin Resend configurado no salen mails y el botón de arrepentimiento responde error**: es lo primero a configurar.

**3. Meta**
- [ ] Verificar el dominio en el Administrador comercial (código en `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`).
- [ ] Pixel y API de Conversiones cargados en el backoffice; probar eventos con `?modo_prueba=1`.
- [ ] Catálogo: fuente de datos con el feed `https://<backend>/api/catalog-feed/meta.csv`.

**4. Productos**
- [ ] Fotos reales en alta, una por color como mínimo (formato 4:5); reemplazan las provisorias de placehold.co.
- [ ] Confirmar medidas, bolsillos, forrado y precios de los 5 modelos (están "a confirmar").
- [ ] Ambar: ¿30 o 36 cm de ancho? (el seed usa 30).
- [ ] Categorías (propuesta: De hombro, Bandoleras, Totes, Bolsos) y a cuál va cada modelo.
- [ ] Stock real por color (hoy 10 de prueba).
- [ ] Modelos o colores a pedido: marcar "a pedido" y días de confección en cada producto.
- [ ] Cuotas: configurar en Configuración → Cuotas si se ofrecen.

**5. Textos legales**
- [ ] Revisar con un profesional términos, privacidad, envíos y cambios/devoluciones (borradores marcados "a revisar" en el backoffice).
- [ ] Ojo: el editor del backoffice muestra los títulos de los textos base como texto común; al guardar desde ahí se pierden los subtítulos. Conviene reescribirlos con el editor al revisarlos.

**6. Marca visual**
- [ ] Logo e isotipo definitivos en vector (SVG): hoy son provisorios armados con la tipografía (`public/marca/` de tienda y backoffice).

**7. Envíos** (desestimado por ahora)
- [ ] Definir qué se ofrece: Correo Argentino (tarifa fija configurable), Andreani, OCA, retiro en local (necesita dirección). El checkout hoy muestra las opciones heredadas.
- [ ] Integración con Correo Argentino (Paq.ar) para cotizar y generar envíos: no está hecha (TODO en `shipping.service.ts`); requiere contrato.

**8. Deploy**
- [ ] Backend en Railway (Dockerfile; `start:prod` corre las migraciones). La primera vez, cargar datos con `npx prisma db seed`.
- [ ] Tienda y backoffice en Vercel, cada una con su carpeta como raíz.
- [ ] Dominio de la tienda (y uno para el backoffice), y actualizar `sitio` en `marca.json`.

### Deuda técnica conocida (no bloquea)

- Warnings de lint heredados (0 errores).
- Backend con `strictNullChecks` apagado (de origen).
- Las variantes de producto llegan al backend sin DTO propio (como en el origen).
- Quedan en el código, sin uso visible: filtros de pádel del endpoint de productos (`shape`, `gender`, `level`), filtro "Marca" del catálogo, módulos ocultos.

## Etapa 4: qué se hizo

**Branding del tablero, aplicado completo** (pedido durante esta etapa):
- `packages/marca/marca.json`: paleta `#1A1A1A` / `#B3855C` / `#6B2A37` / `#D9C8C8` / `#F7F5EF`, tipografías, bajada "Carteras · Accesorios · Mujeres reales", eslogan "Carteras que te acompañan todos los días.", valores (Elegancia · Funcionalidad · Diseño atemporal) y frases ("Diseñadas para tu ritmo", "Más que una cartera…").
- Tienda: Playfair Display (logo y títulos) + Montserrat (textos), cargadas como fuentes variables; tokens de color nuevos (incluye `rosado`); rótulos espaciados con la línea corta del branding (`.guion`); sección "Manifiesto" en rosado en la home; menú de escritorio reducido a Colección · Colores · A pedido (con Montserrat el menú largo chocaba con el logo).
- Isotipo "S" con línea (`public/marca/isotipo.svg`) como favicon de tienda y backoffice. Logo SVG provisorio en Playfair.
- Backoffice: el lima de HomePadel pasó a camel y el azul noche al negro de la marca (142 archivos). Se sacaron las iniciales "HP" que quedaban en el favicon y el login, y un `.bak` viejo versionado.

**Textos y páginas legales** (borradores **a revisar por un profesional**; no son asesoramiento legal):
- Términos, privacidad y envíos: `apps/backend/src/site-sections/textos-base.ts`. Son el valor por defecto de cada sección y los carga el seed; se editan en el backoffice.
- Cambios y devoluciones: `marca.json` → `textos.devoluciones`, leído por tienda y backoffice (antes estaba copiado en los dos). Corrige lo heredado: **10 días corridos de arrepentimiento con la devolución a cargo de la tienda** (art. 34, Ley 24.240; HomePadel decía 30 días y cobraba el envío al cliente) y la excepción de carteras hechas a pedido (art. 1116 CCyC).
- Backoffice: aviso amarillo "Texto base, a revisar" en los editores de términos, privacidad, envíos y devoluciones (componente `AvisoRevision`). Desaparece al guardar desde el editor.
- Datos de la empresa: `marca.json` → `legal.razonSocial`, `legal.cuit`, `legal.domicilio` (vacíos; los textos muestran "[completar …]").

**Botón de arrepentimiento** (obligatorio, Res. 424/2020):
- Página `/arrepentimiento` (react-hook-form + zod) y link fijo en el pie de todas las páginas; también en el sitemap.
- `POST /api/contact/arrepentimiento` (DTO validado, máx. 3 por minuto): genera un código `ARR-AAAAMMDD-XXXXXX` y manda mail a la tienda y a la clienta con el código. **Si los mails no están configurados responde 503** y la página muestra el mail de contacto: no da por recibido un pedido que se perdió.
- `POST /api/contact` ahora tiene DTO (antes recibía el body sin validar) y límite de 5 por minuto.

**Mails**:
- Diseño con el branding: encabezado negro con el logo **en texto serif** (ya no depende de una imagen; la anterior no existía), franja y botón bordó, fondo blanco roto, Montserrat.
- Arreglo de seguridad: el aviso de contacto a la tienda insertaba **sin escapar** lo que escribía la persona; ahora se escapa (hay test). Lo mismo la confirmación de pedido de respaldo.

**Restos de pádel**: textos visibles del backoffice (placeholders de banners, marcas, CRM, newsletter), comentarios con datos del repartidor de HomePadel en `docs/backend.md`, sección de tema de `docs/frontend.md` reescrita, nota en `docs/README.md`. Quedan comentarios técnicos con ejemplos de pádel en el backend (explican decisiones del código heredado) y el módulo oculto "Formatos de paleta".

### Etapa 4: qué se corrió (resultado real)

Base nueva (PGlite) → migraciones → seed → backend y tienda en local. Revisado en el navegador: home con el branding, términos, botón de arrepentimiento (validación y error 503 sin mails configurados). Endpoint probado también con datos inválidos (400).

| App | Compilación | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 58 suites, 428 tests (+7 nuevos: arrepentimiento, contacto, escapado) | 0 errores, 167 warnings | — |
| frontend | ✅ | ✅ 4 tests | 0 errores, 54 warnings | ✅ |
| backoffice | ✅ | sin tests | 0 errores, 293 warnings | ✅ |

- Falló y se arregló: el build de la tienda con `next/font` al pedir pesos fijos de Playfair Display; se cargan como fuentes variables.
- **No se probó**: el envío real de mails (no hay Resend), el backoffice en el navegador.

## Etapa 3: qué se hizo

**Investigación** (qué hacen las tiendas de carteras que venden bien, y por qué): muestras de color que cambian la foto, con el nombre del color (el color en pantalla engaña, el nombre no) y los colores sin stock marcados; fotos por color; referencia de tamaño (la duda que más frena comprar una cartera sin tocarla); estética sin logos ni recargo, el material como protagonista (caso Polène).

**Tema** (`apps/frontend/src/app/globals.css` + `tailwind.config.ts`):
- Un solo tema claro: blanco roto, negro, camel y bordó (de `marca.json`). Se sacó el modo oscuro y el lima de HomePadel: ~300 usos en 108 archivos reemplazados por tokens (`bg-accent`, `text-on-accent`, `text-bordo`…).
- Tipografías: Cormorant Garamond (títulos, como el logo) y Jost (texto), con `next/font`. Esquinas casi rectas en toda la tienda (escala de `rounded` reducida en Tailwind).
- Logo provisorio: "SCHMIDT" en la serif de títulos (componente `BrandLogo`), toma el color del texto.

**Estructura nueva**:
- Header: barra de anuncio, menú a la izquierda (colección, categorías, colores), logo centrado, buscador desplegable, cuenta y carrito. Menú de celular a pantalla, con tipografía grande.
- Footer: logo y eslogan, colección, ayuda, contacto (WhatsApp y mail de `marca.json`), medios de pago.
- Home (`app/page.tsx`):
  1. Hero editorial (con foto del backoffice va a sangre; sin foto, se arma con la del modelo destacado).
  2. **La colección numerada** (N°01…N°05) con tarjetas 4:5 y muestras de color que cambian la foto.
  3. **Elegí tu color**: compra por color (link al catálogo filtrado).
  4. **A escala**: los modelos dibujados en proporción real junto a un celular.
  5. **A pedido** (fondo bordó): el texto del catálogo de la marca, "stock inmediato / a pedido", con botón a WhatsApp.
  6. Beneficios, banners (si hay), Instagram y newsletter (nuevo, con react-hook-form + zod).
- Ficha de producto: galería 4:5, título en serif, precio, **color con nombre y estado** (stock inmediato / a pedido), color preseleccionado (el de la URL si viene de una muestra, o el primero con stock), comprar/agregar, **si el color no tiene stock: "Pedilo en este color por WhatsApp"**, detalles (medidas con dibujo y cotas, material, bolsillos), envíos.
- Catálogo: grilla de 2 columnas en celular y 3 en escritorio con la tarjeta nueva; filtrando por color, las tarjetas muestran la foto de ese color. Se sacaron los filtros de género, formato y nivel (frontend).
- Carrito y checkout: toman el tema nuevo (no se rediseñó su estructura).

**Limpieza de HomePadel**:
- Borrados: componentes viejos de la home (marcas, categorías de pádel, testimonios, reseñas, etc.), imágenes de categorías de pádel, redirecciones del sitio viejo de Tiendanube (`middleware.ts`, `lib/legacyUrls.ts` y su test), badges "Garantía oficial / Cambios gratuitos" (no son promesas de Schmidt).
- **Envío Flex y bolsa de regalo: ahora apagados por defecto** en backend, tienda y backoffice. Se activan desde el backoffice (Tarifa de envío / Productos → bolsa de regalo). Antes venían prendidos sin configurar.
- Guía de talles de la tienda apagada con `tienda.rutasOcultas` en `marca.json` (responde 404 y sale del sitemap).

**Migración nueva (importante)**: `20261020130000_sync_schema_drift`. Al correr las migraciones en una base nueva se vio que las heredadas de HomePadel **no creaban 9 columnas de `Product` (`isMadeToOrder`, `estimatedDays`, `requiredDeposit`, `show*`, `shape`) ni la tabla `Shipment`**, aunque el esquema y el código las usan (en HomePadel la base se armó por otra vía). Sin esto, la base de Schmidt quedaba rota y el seed fallaba. La migración solo agrega lo que falta; después de aplicarla, `prisma migrate diff` contra el esquema da **cero diferencias**. No cambia el esquema ni borra nada.

### Etapa 3: qué se corrió (resultado real)

Por primera vez con datos: base Postgres en memoria (PGlite, fuera del repo) → `prisma migrate deploy` (36 migraciones OK) → seed OK (4 categorías, 5 productos, variantes por color) → backend y tienda en local, revisados en el navegador en escritorio (1280 px) y celular (375 px): home, catálogo filtrado por color, ficha, agregar al carrito, carrito y checkout.

| App | Compilación | Tests | Lint | Build |
|---|---|---|---|---|
| backend | ✅ | ✅ 57 suites, 421 tests | 0 errores, 168 warnings (igual que el origen) | — |
| frontend | ✅ | ✅ 4 tests nuevos (colores y medidas) | 0 errores, 54 warnings (origen: 64) | ✅ |
| backoffice | ✅ | sin tests | 0 errores, 292 warnings | ✅ |

- Fallaron y se arreglaron: 3 tests del backend que daban por hecho Flex y bolsa de regalo prendidos por defecto (se reescribieron para el nuevo comportamiento y se sumó uno de cada caso apagado).
- Los 21 tests del frontend del origen eran todos de las redirecciones de Tiendanube, que se borraron: por eso el frontend pasó de 21 a 4 tests.
- **No se probó**: pagar (no hay credenciales de Mercado Pago), mails, login con Google, ni el backoffice en el navegador.

### Pendiente de la etapa 3 / para la 4

- Fotos reales (las actuales son placeholders de placehold.co con el nombre y el color).
- Logo definitivo (hoy es texto) y favicon.
- Checkout: ofrece "Retiro en el local", OCA y Andreani heredados; definir qué envíos quedan (los envíos se desestimaron por ahora).
- El filtro "Marca" del catálogo y los parámetros de pádel del backend (`shape`, `gender`, `level`) siguen en el código; con una sola marca no molestan.
- Etapa 4: textos (FAQ, páginas legales, envíos, medios de pago), mails y su logo.

### Cómo levantarlo en local (lo que se usó)

1. Una base Postgres (cualquiera; acá se usó PGlite con el servidor `@electric-sql/pglite-socket`, `maxConnections` alto y la extensión `unaccent`).
2. `apps/backend/.env` con `DATABASE_URL`, `JWT_SECRET` y `SEED_ADMIN_PASSWORD` (ver `.env.example`).
3. En `apps/backend`: `npx prisma migrate deploy`, `npx prisma db seed` (este sí lee el `.env`; `npm run prisma:seed` no) y `npm run start:dev`.
4. En `apps/frontend`: `.env.local` con `NEXT_PUBLIC_API_URL="http://localhost:4000/api"` y `npm run dev`.

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
