# Frontend (tienda pública)

Next.js 15, App Router. `apps/frontend/src/`:

```
app/            → rutas (carrito, catalogo, checkout, contacto, cuenta, envios, faq,
                  medios-de-pago, politica-de-devolucion, privacidad, producto,
                  rastrear, talles, terminos)
components/     → account/ cart/ contacto/ home/ layout/ pages/ ui/
hooks/          → useBranding, usePaymentMethods
lib/            → api.ts (cliente Axios), metaPixel.ts, tema.ts (claro/oscuro), utils.ts
store/          → authStore.ts, cartStore.ts (Zustand)
types/
```

## Estado

Zustand para estado global de cliente (`authStore`, `cartStore`) — no Redux, no Context API para esto. Estado de servidor (catálogo, pedidos) se pide directo con Axios contra `NEXT_PUBLIC_API_URL`, sin capa de cache tipo React Query.

Excepción: las páginas que tienen que llegar completas a buscadores y vistas previas (`/catalogo`, `/producto/[slug]`) traen sus datos desde el servidor con `getDesdeServidor` (`src/lib/serverApi.ts`, `fetch` con `revalidate`) y se los pasan al componente de cliente. En el catálogo, los filtros cambian la URL y el servidor vuelve a armar el listado; la ficha arranca con el producto del servidor y lo vuelve a pedir sin caché desde el navegador.

## Formularios

`react-hook-form` + `zod` (`@hookform/resolvers`) en todo formulario con input de usuario (checkout, contacto, cuenta). El schema de Zod es la validación del lado del cliente — **no reemplaza la validación del DTO en el backend**, es UX (feedback inmediato), no seguridad.

## Estilos

TailwindCSS 3. Sin librería de componentes (no hay `packages/ui` — cada componente en `components/ui/` es local a esta app y no se comparte con `backoffice`).

### Tema y branding

Un solo tema, claro, con el branding de Schmidt: paleta `#1A1A1A` (negro), `#B3855C` (camel), `#6B2A37` (bordó), `#D9C8C8` (rosado) y `#F7F5EF` (blanco roto); Playfair Display para el logo y los títulos y Montserrat para los textos (`next/font` en `app/layout.tsx`). Los valores de marca salen de `packages/marca/marca.json`.

**Los colores no se escriben en hex: se usan por nombre.** Cada nombre es una variable `--c-*` de `src/app/globals.css`, registrada en `tailwind.config.ts`:

| Nombre | Para qué |
|---|---|
| `page`, `panel`, `card`, `field` | fondos de página, paneles, tarjetas, inputs |
| `chip`, `night`, `line` | fondos de foto, secciones alternadas, bordes |
| `fg` / `fg-soft` / `fg-muted` | texto principal / secundario / apagado |
| `accent` / `accent-hover` / `on-accent` | botón principal (negro → bordó al pasar) y su texto |
| `ink`, `camel`, `bordo`, `rosado`, `brand-fg` | colores de la marca (`brand-fg` = bordó como texto) |

- Se usan con cualquier propiedad y con opacidad: `bg-page`, `text-fg-muted`, `border-line`, `bg-ink/70`.
- `<html>` lleva siempre `data-theme="light"`: las clases `light:` heredadas del proyecto base siguen aplicando.
- Esquinas casi rectas en toda la tienda: la escala `rounded-*` está achicada en `tailwind.config.ts` (`rounded-full` no cambia).
- Utilidades de marca: `.rotulo` (mayúsculas chicas espaciadas), `.guion` (la línea corta del branding) y `font-display` (la serif).
- Al agregar un color que se vaya a repetir: sumarlo en `globals.css` y en `tailwind.config.ts`, y chequear contraste sobre `page`.

## Checkout como invitado y precio por transferencia

- "Finalizar compra" (carrito y panel lateral) va directo a `/checkout`, sin pedir login (`components/auth/useCheckoutNavigation.ts`). En el checkout, ingresar es opcional (`useCheckoutAuthGate.ts`: "¿Ya tenés cuenta? Ingresá" completa nombre y mail).
- El carrito muestra el precio por transferencia de cada producto (`PrecioTransferencia`) y el total pagando así (`carrito/CarritoTotalTransferencia.tsx`), con la misma cuenta que el checkout y el servidor: subtotal a precio de transferencia, y cupón y envío gratis calculados sobre ese subtotal.

## SEO y datos para compartir

Los metadatos de Next se **heredan** del layout raíz a todas las rutas, y el objeto `openGraph` se reemplaza entero (no se combina). Por eso el layout raíz (`app/layout.tsx`) lleva solo lo común:

- **Sin `alternates.canonical`, a propósito.** Un canonical `/` ahí hacía que `/terminos`, `/privacidad`, etc. le dijeran a Google que eran duplicados de la portada. No volver a agregarlo.
- `openGraph` con solo tipo, idioma y nombre del sitio (`OPEN_GRAPH_BASE` en `lib/seoPortada.ts`). Sin título ni URL: así cada página se comparte con su propio `<title>`.
- La imagen para compartir la genera `app/opengraph-image.tsx` (logo sobre el fondo de la marca). La ficha de producto usa la foto del producto.

Reglas al sumar una página:

- **Indexable:** declarar su `alternates.canonical`. Si la página es `'use client'`, en un `layout.tsx` de su carpeta (ver `terminos/layout.tsx`).
- **Privada** (cuenta, carrito, checkout, links de venta): `robots: { index: false, follow: false }` en su layout. `/venta` no está en el `disallow` de `robots.ts` a propósito: si Google no puede leerla, tampoco ve el noindex.
- Si define su propio `openGraph`, empezar por `...OPEN_GRAPH_BASE` (ver la portada y la ficha de producto).

## Reglas

- Todo fetch al backend pasa por `lib/api.ts`, no se instancia Axios suelto en un componente.
- Nada de credenciales ni tokens de terceros (Mercado Pago, Cloudinary) en este código: eso vive en el backend. El frontend solo consume `NEXT_PUBLIC_API_URL`.
- Componentes de servidor por defecto (App Router); `"use client"` solo donde hay estado, efectos o handlers de evento — ver [componentes.md](componentes.md).
