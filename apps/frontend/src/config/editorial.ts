/**
 * Fotos de ambiente de la portada.
 *
 * PROVISORIAS: son de Unsplash (licencia libre) y no muestran carteras de la
 * marca. Están para que la portada se vea como va a quedar; reemplazarlas por
 * la producción de fotos de Schmidt (o cargar el hero desde el backoffice,
 * que tiene prioridad sobre estas).
 */
const unsplash = (id: string, ancho: number, alto: number) =>
  'https://images.unsplash.com/photo-' + id + '?w=' + ancho + '&h=' + alto + '&fit=crop&crop=entropy&q=80&auto=format';

export interface FotoEditorial {
  src: string;
  alt: string;
}

export const FOTO_PORTADA: FotoEditorial = {
  src: unsplash('1676716107070-1f9ef2a1ac3e', 1100, 1450),
  alt: 'Mujer en la calle con una cartera camel de mano',
};

/** "Una cartera para cada momento": tres escenas, con el texto que las acompaña. */
export const MOMENTOS: (FotoEditorial & { titulo: string; texto: string; href: string })[] = [
  {
    src: unsplash('1559127452-4ab7dc5366bc', 800, 1100),
    alt: 'Mujer de traje blanco con una cartera chica clara',
    titulo: 'De la oficina',
    texto: 'Estructura, bolsillos para todo y un color que combina con cualquier look.',
    href: '/catalogo',
  },
  {
    src: unsplash('1613482184832-32251a646663', 800, 1100),
    alt: 'Mujer de espaldas con una cartera camel al hombro',
    titulo: 'A la escapada',
    texto: 'Livianas, amplias y con correa regulable para llevarla como quieras.',
    href: '/catalogo',
  },
  {
    src: unsplash('1713425886673-fb8b7abb36a4', 800, 1100),
    alt: 'Mujer vestida de bordó con una cartera de mano',
    titulo: 'Para salir',
    texto: 'Tonos profundos y terminaciones prolijas para cuando la noche lo pide.',
    href: '/catalogo',
  },
];

export const FOTO_A_PEDIDO: FotoEditorial = {
  src: unsplash('1713425886495-8243c9933b00', 900, 1100),
  alt: 'Cartera bordó apoyada sobre una mesa',
};

export const FOTO_NEWSLETTER: FotoEditorial = {
  src: unsplash('1605204631224-6107b31a5efa', 900, 1100),
  alt: 'Mujer caminando con una cartera al hombro',
};
