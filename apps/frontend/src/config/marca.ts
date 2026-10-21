// Generado por scripts/sync-marca.mjs desde packages/marca/marca.json.
// No editar a mano: cambiar el JSON y volver a correr el script.

export const MARCA = {
  "nombre": "Schmidt",
  "nombreLogo": "SCHMIDT",
  "slug": "schmidt",
  "rubro": "Carteras de eco cuero",
  "descripcion": "Carteras de eco cuero hechas en Argentina. Modelos en stock y a pedido, en el color que elijas.",
  "eslogan": "Tu estilo, en cada detalle.",
  "keywords": [
    "carteras",
    "carteras de eco cuero",
    "bolsos de mujer",
    "carteras de mujer",
    "tote",
    "bandolera"
  ],
  "sitio": {
    "url": "https://www.schmidt.example",
    "hosts": [
      "www.schmidt.example"
    ],
    "pendiente": "Dominio real a definir: reemplazar url y hosts."
  },
  "email": {
    "contacto": "hola@schmidt.example",
    "remitente": "Schmidt <noreply@schmidt.example>",
    "avisos": "hola@schmidt.example",
    "admin": "admin@schmidt.example",
    "pendiente": "Mails reales a definir. El remitente necesita el dominio verificado en Resend."
  },
  "whatsapp": "",
  "redes": {
    "instagram": "",
    "instagramUsuario": "",
    "facebook": "",
    "tiktok": ""
  },
  "colores": {
    "negro": "#161413",
    "camel": "#A87449",
    "bordo": "#6E1E2B",
    "blancoRoto": "#F4F0EA",
    "piedra": "#E6DFD4",
    "grisRosado": "#BFAFAE"
  },
  "logo": {
    "archivo": "/marca/logo.svg",
    "mail": "/email/logo.png"
  },
  "backoffice": {
    "rutasOcultas": [
      "/punto-de-venta",
      "/caja",
      "/equipo-pdv",
      "/configuracion-pdv",
      "/gastos",
      "/configuracion/talles",
      "/clientes",
      "/reviews",
      "/configuracion/reviews-info",
      "/testimonios",
      "/configuracion/formatos-paleta",
      "/marcas"
    ],
    "nota": "Rutas del backoffice ocultas del menú y bloqueadas. El código no se borra: para reactivar un módulo, sacar su ruta de esta lista y correr node scripts/sync-marca.mjs."
  },
  "prefijoPedido": "SCH",
  "prefijoStorage": "schmidt",
  "carpetaImagenes": "schmidt",
  "pendientes": [
    "Dominio del sitio",
    "WhatsApp de ventas (en el catálogo de Canva figura 11 6115-0361: confirmar)",
    "Instagram y otras redes",
    "Mails de contacto y remitente",
    "Razón social y CUIT para las páginas legales"
  ]
} as const;
