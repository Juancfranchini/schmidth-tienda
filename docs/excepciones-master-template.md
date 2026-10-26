# Excepciones al Master Template y plan de cierre de brechas

Estado: **2026-10-26**, contrastado contra el código de este repositorio. Próxima revisión de todo el documento: **2027-04-26** (o antes, si cambia la arquitectura).

El proyecto parte de la base de HomePadel, que es anterior al `MASTER-TEMPLATE.md`. Por eso no lo cumple entero. El template pide que una excepción sea explícita, acotada, con motivo y fecha de revisión (sección 23): este documento las registra, y separa lo que se acepta de lo que hay que arreglar antes de abrir la tienda.

Dueño de las decisiones: Juan Cruz. Dueño técnico de la ejecución: a definir (la factoría o quien tome el trabajo).

## 1. Excepciones justificadas

Se aceptan porque cambiarlas costaría más que el riesgo que dejan. Cada una tiene una condición que obliga a revisarla antes de la fecha indicada.

| ID | Regla del template | Situación actual | Por qué se acepta | Riesgo y mitigación | Revisar |
|---|---|---|---|---|---|
| E1 | Astro para páginas públicas (§3) | La tienda es Next.js 15 con React 19. | Ya está hecha, con carrito, checkout, catálogo e integración de pagos. Pasarla a Astro es reescribirla, sin ganancia que justifique el costo ahora. El propio template admite Next.js cuando hay un requisito concreto. | Más JavaScript en el cliente que en Astro. Mitigación: contenido principal renderizado en el servidor, presupuesto de JS vigilado en el build y animaciones que se apagan con `prefers-reduced-motion`. | 2027-04-26, o si las Core Web Vitals en producción salen mal |
| E2 | Monorepo con `pnpm workspaces` y paquetes `core`, `contracts`, `db`, `ui`, `shared` (§2, §4) | Tres apps independientes, cada una con su `package.json`. Solo existe `packages/marca` (configuración de marca sincronizada por script). | Hay duplicación real mínima (marca, algunos tipos). Crear paquetes sin consumidores claros va contra YAGNI. | Los tipos de la API se pueden desalinear entre apps. Mitigación: Swagger como contrato y `sync-marca --check` en el CI. | Cuando aparezca una cuarta app o la misma regla se repita en tres lugares |
| E3 | TypeScript estricto (§5) | Frontend y backoffice sí. El backend tiene `strictNullChecks` y `noImplicitAny` en `false`. | Es el valor por defecto de NestJS y activarlo de golpe rompe cientos de líneas. | Un `null` inesperado no lo detecta el compilador. Mitigación: DTOs validados en cada entrada y tests. Activar `strictNullChecks` por módulos, empezando por los nuevos. | 2027-04-26 |
| E4 | Dinero en unidades menores enteras (§5) | Precios y totales en `Float` (base de datos y código). | Los precios se cargan en pesos enteros y el volumen es bajo. Migrar todos los importes toca pagos, caja y reportes. | Errores de redondeo en descuentos y cuotas. Mitigación: **verificar** que los cálculos redondeen a 2 decimales en el borde y cubrirlo con tests (ver P1-7). | Antes de aceptar otra moneda o decimales |
| E5 | Rutas públicas versionadas `/api/v1` (§7) | Rutas `/api/...` sin versión. | Hay un solo consumidor (nuestras propias apps), que se despliega junto con la API. | Un cambio de contrato rompe las apps si se publican por separado. Mitigación: publicarlas juntas. | Cuando exista un consumidor externo (app móvil, integraciones) |

## 2. Brechas a cerrar antes de producción

Prioridades: **P0** bloquea abrir la tienda al público. **P1** debe estar en las primeras semanas después de abrir. **P2** se programa. El esfuerzo es una estimación gruesa: S (hasta 1 día), M (2 a 4 días), L (más de una semana).

### P0 — antes de abrir

| # | Brecha | Regla | Qué hay hoy | Qué hacer | Esfuerzo |
|---|---|---|---|---|---|
| P0-1 | Backups con restauración ensayada | §8 | No hay infraestructura de producción todavía. | Base PostgreSQL administrada con backups diarios. Hacer una restauración de prueba en otro lugar y dejarla documentada en un runbook. | M |
| P0-2 | Datos ficticios presentados como reales | §17, §21 | Productos, medidas, stock y varias fotos son de prueba. Algunas fotos parecen de otra marca. | Cargar productos reales, fotos propias y datos de la marca (ver ETAPAS.md). Sacar las fotos de Unsplash y las de otras marcas. | M (depende de la marca) |
| P0-3 | Almacenamiento de imágenes propio | §16 | En producción las imágenes dependen de Cloudinary. | Guardarlas en almacenamiento propio (Spaces o S3), validar tipo real y tamaño, con arrastrar y soltar en todos los ABMs. | L |
| P0-4 | Sesión del backoffice | §9 | JWT de 7 días guardado en `localStorage` y en una cookie sin `HttpOnly`. No hay revocación en el servidor. | Cookie `HttpOnly` + `Secure` + `SameSite`, expiración corta con renovación, revocación al cerrar sesión, y protección CSRF para las mutaciones. | M |
| P0-5 | Borrado lógico en el backoffice | §8 | No existe `deletedAt` en el esquema. Hay 19 borrados físicos en los servicios. | Baja lógica con actor, fecha y motivo en productos, categorías, clientes y cupones. Sacar los borrados físicos de los botones del panel. Las consultas públicas excluyen lo dado de baja. | M |
| P0-6 | Puertas del CI | §15 | `lint` corre con `continue-on-error`, o sea que no bloquea. El backend no hace `build`. No hay auditoría de dependencias ni de secretos. | Hacer que el lint bloquee (hoy pasa con 0 errores, así que se puede ya; los warnings van en P1-1), sumar `build` del backend, `npm audit` y un escaneo de secretos. | S |
| P0-7 | Runbooks y documentación de despliegue | §20 | `docs/deploy.md` describe Railway y Vercel, que ya no son el destino. | Reescribirlo para el servidor nuevo y agregar `docs/runbooks/` con deploy, rollback, migraciones, restauración y rotación de secretos. | M |
| P0-8 | Idempotencia y firma de los webhooks de pago | §7 | **Sin verificar.** | Revisar el webhook de Mercado Pago: firma verificada, un mismo evento no puede cobrar o confirmar dos veces. Agregar un test. | S |

### P1 — primeras semanas

| # | Brecha | Regla | Qué hacer | Esfuerzo |
|---|---|---|---|---|
| P1-1 | Warnings de lint (293 backoffice, 167 backend, 58 tienda) | §5 | Congelar el número actual en el CI para que no crezca y bajarlo por módulos hasta cero. La mayoría son `any` e `<img>`. | L, en tandas |
| P1-2 | Autenticación de dos pasos para administradores | §9 | MFA por aplicación de autenticación para el rol ADMIN. | M |
| P1-3 | Mails con cola persistente | §10 | Hoy se envían dentro del pedido HTTP. Agregar una tabla de envíos con reintentos, estados (`accepted`, `delivered`, `bounced`, `failed`), webhooks de Resend con firma y lista de supresión. | L |
| P1-4 | Newsletter: baja y consentimiento | §10 | **Sin verificar** `List-Unsubscribe` y la doble confirmación. Revisarlos y completar lo que falte. Configurar SPF, DKIM y DMARC del dominio. | M |
| P1-5 | Tests de integración y migraciones en el CI | §14, §15 | Base efímera en el CI, validar las migraciones desde cero y los tests de integración del flujo de pedidos. | M |
| P1-6 | Prueba end-to-end de la compra | §14 | Un Playwright aislado (base y contenedores propios, con limpieza al final) para: comprar, pagar, recibir el mail, ver el pedido en el panel. | L |
| P1-7 | Cálculos de dinero | E4 | Tests de redondeo de descuentos, cuotas, envío y bolsas, y revisión de que los totales coincidan con lo que cobra Mercado Pago. | S |
| P1-8 | Observabilidad | §17 | Logs con un identificador por solicitud HTTP (request ID), healthcheck y readiness separados, alertas por mail y control de que la tienda responde. | M |
| P1-9 | Auditoría de acciones del panel | §16 | Hoy solo se registra la caja y el punto de venta. Extender a productos, precios, cupones, usuarios y cambios de estado de pedidos. | M |

### P2 — se programa

| # | Brecha | Qué hacer | Esfuerzo |
|---|---|---|---|
| P2-1 | Backend estricto | Activar `strictNullChecks` módulo por módulo (E3). | L |
| P2-2 | Versionado de la API | Prefijo `/api/v1` cuando haya un consumidor externo (E5). | S |
| P2-3 | Documentación faltante | `docs/data-sources.md`, ADRs de las decisiones difíciles de revertir y un registro de cambios orientado al impacto. | S |
| P2-4 | Accesibilidad completa | Auditar el foco en modales y el teclado en el panel y la tienda hasta WCAG 2.2 AA. | M |
| P2-5 | Headers de seguridad | Revisar CSP, HSTS y política de referrer con la tienda ya detrás de HTTPS. | S |

## 3. Qué se verificó y qué no

Verificado en el código el 2026-10-26:
- Los `tsconfig` de las tres apps, el esquema de Prisma (precios `Float`, sin `deletedAt`, tabla `AuditLog`), el CI (`.github/workflows/ci.yml`), la presencia de `robots.ts`, `sitemap.ts` y `helmet`, la falta de MFA y de configuración de Playwright, el almacenamiento del token en `localStorage` y la cantidad de warnings de lint.

No verificado (queda como tarea, no como afirmación):
- La idempotencia y la firma de los webhooks (P0-8).
- La doble confirmación y los headers `List-Unsubscribe` del newsletter (P1-4).
- El redondeo de los cálculos de dinero (P1-7).
- La trampa de foco en los modales y la navegación por teclado.
- Si alguna función o archivo viejo supera hoy los límites de 80 y 400 líneas.

## 4. Cómo se mantiene este documento

- Cuando se cierra una brecha, se pasa a una sección "Cerradas" con la fecha y el enlace al cambio.
- Cuando se llega a la fecha de revisión de una excepción, se decide: mantenerla con una nueva fecha o convertirla en brecha.
- Una excepción nueva se agrega acá antes de aceptarla en el código, con motivo, riesgo y fecha.
