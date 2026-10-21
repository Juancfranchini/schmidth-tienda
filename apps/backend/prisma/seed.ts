import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/common/security/password';
import { MARCA } from '../src/config/marca';
import { TEXTOS_BASE } from '../src/site-sections/textos-base';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed...\n');

  //  Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || MARCA.email.admin;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error('Falta SEED_ADMIN_PASSWORD para crear el usuario administrador');
  const hash = await hashPassword(adminPassword);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: hash, name: 'Admin', role: Role.ADMIN },
  });
  console.log(' Admin:', admin.email);

  // Categorías. Separadas por tipo de cartera (a confirmar con la clienta).
  const CATEGORIAS = [
    { name: 'De hombro', slug: 'de-hombro', order: 1 },
    { name: 'Bandoleras', slug: 'bandoleras', order: 2 },
    { name: 'Totes', slug: 'totes', order: 3 },
    { name: 'Bolsos', slug: 'bolsos', order: 4 },
  ];
  const categorias: Record<string, { id: string }> = {};
  for (const c of CATEGORIAS) {
    categorias[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, image: null } });
  }
  console.log(' Categorias:', CATEGORIAS.length);

  // Una sola marca: la propia.
  const marca = await prisma.brand.upsert({
    where: { slug: MARCA.slug },
    update: {},
    create: { name: MARCA.nombre, slug: MARCA.slug },
  });
  console.log(' Marca:', marca.name);

  // Productos. Todo lo de este bloque sale del catálogo de Canva y está
  // A CONFIRMAR CON LA CLIENTA: medidas, bolsillos, forrado, colores y precios.
  // El stock por color es un valor de PRUEBA (STOCK_DE_PRUEBA), no el real.
  // Las fotos son provisorias (placehold.co) hasta tener las reales.
  const STOCK_DE_PRUEBA = 10;
  const COLORES = {
    negro: { nombre: 'Negro', hex: MARCA.colores.negro },
    camel: { nombre: 'Camel', hex: MARCA.colores.camel },
    bordo: { nombre: 'Bordó', hex: MARCA.colores.bordo },
    blanco: { nombre: 'Blanco', hex: '#EFEAE2' },
    grisRosado: { nombre: 'Gris rosado', hex: MARCA.colores.grisRosado },
  };
  type ClaveColor = keyof typeof COLORES;
  const foto = (modelo: string, color: ClaveColor) => {
    const fondo = COLORES[color].hex.replace('#', '');
    const texto = ['negro', 'bordo'].includes(color) ? 'F4F0EA' : '161413';
    return 'https://placehold.co/800x1000/' + fondo + '/' + texto + '.png?text=' + encodeURIComponent(modelo + '\n' + COLORES[color].nombre);
  };

  const MODELOS = [
    {
      nombre: 'Astra', precio: 60000, categoria: 'de-hombro', ancho: 40, alto: 20, colores: ['negro', 'camel', 'bordo'] as ClaveColor[],
      descripcion: 'Cartera de hombro con cinco bolsillos externos y uno interno, correa regulable y forro interno.',
      detalles: [['Package', 'Bolsillos', '5 externos + 1 interno'], ['Maximize', 'Correa', 'Regulable']],
      destacado: true, nueva: true,
    },
    {
      nombre: 'Siena', precio: 63000, categoria: 'bandoleras', ancho: 25, alto: 35, colores: ['camel', 'negro'] as ClaveColor[],
      descripcion: 'Bandolera con correa regulable y un bolsillo interno.',
      detalles: [['Package', 'Bolsillos', '1 interno'], ['Maximize', 'Correa', 'Regulable']],
      destacado: true, nueva: false,
    },
    {
      nombre: 'Ambar', precio: 63000, categoria: 'totes', ancho: 30, alto: 20, colores: ['camel', 'negro', 'grisRosado'] as ClaveColor[],
      descripcion: 'Tote con tres compartimentos y un bolsillo interno, con forro interno.',
      detalles: [['Package', 'Bolsillos', '1 interno'], ['Layers', 'Compartimentos', '3']],
      destacado: true, nueva: false,
    },
    {
      nombre: 'Soho', precio: 67000, categoria: 'totes', ancho: 40, alto: 37, colores: ['blanco', 'negro', 'camel'] as ClaveColor[],
      descripcion: 'Tote amplio con un bolsillo interno.',
      detalles: [['Package', 'Bolsillos', '1 interno']],
      destacado: true, nueva: true,
    },
    {
      nombre: 'Monaco', precio: 58000, categoria: 'bolsos', ancho: 30, alto: 25, colores: ['camel', 'negro'] as ClaveColor[],
      descripcion: 'Bolso de mano con un bolsillo interno.',
      detalles: [['Package', 'Bolsillos', '1 interno']],
      destacado: false, nueva: false,
    },
  ];

  for (const m of MODELOS) {
    const slug = m.nombre.toLowerCase();
    const sku = m.nombre.slice(0, 3).toUpperCase();
    const imagenes = m.colores.map((c) => foto(m.nombre, c));
    const total = STOCK_DE_PRUEBA * m.colores.length;
    const datos = {
      name: m.nombre, slug, description: m.descripcion, material: 'Eco cuero',
      price: m.precio, sku, stock: total, images: imagenes,
      featured: m.destacado, isNew: m.nueva, isOffer: false,
      categoryId: categorias[m.categoria].id, brandId: marca.id,
      hasColor: true, hasSize: false, hasDimensions: false, hasWeight: false,
      dimensionWidth: m.ancho, dimensionHeight: m.alto, dimensionUnit: 'cm',
      features: m.detalles.map(([icon, title, subtitle]) => ({ icon, title, subtitle })),
    };
    const producto = await prisma.product.upsert({ where: { slug }, update: {}, create: datos });
    // La variante base que crea ProductsService.create (`<id>-base`) y una variante por color.
    await prisma.productVariant.upsert({
      where: { id: producto.id + '-base' }, update: {},
      create: { id: producto.id + '-base', productId: producto.id, sku, size: '', color: null, imageUrl: imagenes[0], images: imagenes.slice(1), stock: total, active: true, isDefault: true },
    });
    for (const clave of m.colores) {
      const color = COLORES[clave];
      const skuVariante = sku + '-' + clave.slice(0, 3).toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku: skuVariante }, update: {},
        create: {
          productId: producto.id, sku: skuVariante, size: '', color: color.nombre, colorHex: color.hex,
          imageUrl: foto(m.nombre, clave), images: [], stock: STOCK_DE_PRUEBA, active: true, isDefault: false,
        },
      });
    }
  }
  console.log(' Productos:', MODELOS.length, '(stock de prueba:', STOCK_DE_PRUEBA, 'por color)');

  // Canales de contacto: solo los que tienen dato cargado en packages/marca/marca.json.
  const canales = [
    { title: 'WhatsApp', description: 'La forma más rápida de contactarnos.', url: MARCA.whatsapp ? 'https://wa.me/' + MARCA.whatsapp : '', buttonText: 'Ir a WhatsApp' },
    { title: 'Email', description: 'Respondemos en menos de 24 hs.', url: 'mailto:' + MARCA.email.contacto, buttonText: 'Ir a Email' },
    { title: 'Instagram', description: 'Seguinos y mandanos un DM.', url: MARCA.redes.instagram, buttonText: 'Ir a Instagram' },
  ].filter((c) => c.url);
  if ((await prisma.contactChannel.count()) === 0) {
    await prisma.contactChannel.createMany({ data: canales.map((c, i) => ({ ...c, logo: '', order: i + 1 })) });
  }
  console.log(' Canales de contacto:', canales.length);

  // Hero y beneficios de la portada (textos provisorios; la etapa 3 rediseña la portada).
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.create({
      data: { title: MARCA.eslogan, subtitle: MARCA.bajada, description: MARCA.frases.ritmo + '.', ctaPrimary: 'Ver colección', ctaPrimaryUrl: '/catalogo', order: 1 },
    });
  }
  if ((await prisma.benefit.count()) === 0) {
    await prisma.benefit.createMany({
      data: [
        { icon: 'Truck', title: 'Envíos a todo el país', description: 'Recibí tu pedido donde estés', order: 1 },
        { icon: 'CreditCard', title: 'Pagá con Mercado Pago', description: 'Tarjeta, saldo y más medios', order: 2 },
        { icon: 'RefreshCw', title: 'Cambios y devoluciones', description: 'Consultá las condiciones', order: 3 },
      ],
    });
  }

  // Preguntas frecuentes base (a revisar con la clienta).
  if ((await prisma.fAQ.count()) === 0) {
    await prisma.fAQ.createMany({
      data: [
        { category: 'COMPRAS', question: '¿Cómo hago una compra?', answer: 'Elegí tu cartera y tu color, agregala al carrito y completá tus datos. Vas a recibir un email de confirmación.', order: 1 },
        { category: 'COMPRAS', question: '¿Puedo pedir un color que no figura?', answer: 'Sí. Todos los modelos pueden hacerse a pedido en otros colores: consultanos y vemos las opciones.', order: 2 },
        { category: 'ENVÍOS', question: '¿Hacen envíos a todo el país?', answer: 'Sí, enviamos a todo el país. El costo y los plazos se informan antes de pagar.', order: 3 },
        { category: 'PAGOS', question: '¿Qué medios de pago aceptan?', answer: 'Trabajamos con Mercado Pago. Dentro de Mercado Pago podés elegir tarjeta, saldo u otros medios disponibles.', order: 4 },
        { category: 'PAGOS', question: '¿Es seguro pagar en la web?', answer: 'Sí. El pago se completa dentro de Mercado Pago y ' + MARCA.nombre + ' no almacena datos de tarjetas.', order: 5 },
        { category: 'DEVOLUCIONES', question: '¿Puedo cambiar mi cartera?', answer: 'Sí. Escribinos y te contamos las condiciones del cambio.', order: 6 },
        { category: 'PRODUCTOS', question: '¿De qué material son?', answer: 'Nuestras carteras son de eco cuero.', order: 7 },
      ],
    });
  }
  console.log(' Contenido base listo');

  // Páginas legales e informativas: borradores a revisar (ver src/site-sections/textos-base.ts).
  for (const [key, data] of Object.entries(TEXTOS_BASE)) {
    await prisma.siteSection.upsert({ where: { key }, update: {}, create: { key, data: { ...data } } });
  }
  await prisma.siteSection.upsert({ where: { key: 'politica_devolución' }, update: {}, create: { key: 'politica_devolución', data: { ...MARCA.textos.devoluciones } } });

  // Secciones del sitio.
  await prisma.siteSection.upsert({
    where: { key: 'branding' },
    update: {},
    create: { key: 'branding', data: { logoHeader: null, logoFooter: null, logoMobile: null, favicon: null } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'instagram' },
    update: {},
    create: { key: 'instagram', data: { title: 'Seguinos en Instagram', username: MARCA.redes.instagramUsuario, buttonText: 'Seguinos en Instagram', buttonUrl: MARCA.redes.instagram, appId: '', appSecret: '', manualUrls: [] } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'about' },
    update: {},
    create: { key: 'about', data: { title: 'Sobre ' + MARCA.nombre, content: MARCA.descripcion } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'final-message' },
    update: {},
    create: { key: 'final-message', data: { title: 'Elegí tu próxima favorita', subtitle: 'Todos los modelos, en el color que quieras', ctaText: 'VER CATÁLOGO', ctaUrl: '/catalogo' } },
  });

  console.log('\n Seed completado!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
