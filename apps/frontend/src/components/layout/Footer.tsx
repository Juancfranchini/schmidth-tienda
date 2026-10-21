'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useMenuCategorias } from '@/hooks/useMenuCategorias';
import BrandLogo from '@/components/ui/BrandLogo';
import FooterPaymentBadges from './FooterPaymentBadges';
import { WHATSAPP_URL } from '@/lib/marcaLinks';
import { MARCA } from '@/config/marca';

const AYUDA = [
  { label: 'Preguntas frecuentes', href: '/faq' },
  { label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },
  { label: 'Envíos', href: '/envios' },
  { label: 'Medios de pago', href: '/medios-de-pago' },
  { label: 'Contacto', href: '/contacto' },
];

// Solo las redes con dirección cargada en la configuración de marca.
const REDES = [
  { icon: Instagram, href: MARCA.redes.instagram, label: 'Instagram' },
  { icon: Facebook, href: MARCA.redes.facebook, label: 'Facebook' },
].filter((red) => red.href);

function Columna({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="rotulo mb-4 text-fg">{title}</h3>
      {children}
    </div>
  );
}

function Lista({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-sm transition-colors hover:text-bordo">{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

/** Solo los datos cargados: un teléfono o una dirección inventados son peores que nada. */
function Contacto() {
  const { contactEmail } = useSiteSettings();
  const email = contactEmail || MARCA.email.contacto;
  return (
    <ul className="space-y-2.5 text-sm">
      <li>
        <a href={WHATSAPP_URL} className="inline-flex items-center gap-2 transition-colors hover:text-bordo">
          <MessageCircle size={15} strokeWidth={1.5} /> ¿Tenés dudas? Escribinos
        </a>
      </li>
      <li>
        <a href={'mailto:' + email} className="inline-flex items-center gap-2 break-all transition-colors hover:text-bordo">
          <Mail size={15} strokeWidth={1.5} /> {email}
        </a>
      </li>
      {REDES.map(({ icon: Icon, href, label }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-bordo">
            <Icon size={15} strokeWidth={1.5} /> {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const { mercadopago, transferencia, ca, oca, andreani } = usePaymentMethods();
  const categorias = useMenuCategorias();
  const coleccion = [
    { label: 'Toda la colección', href: '/catalogo' },
    ...categorias.map((c) => ({ label: c.name, href: '/catalogo?categoria=' + c.slug })),
  ];

  return (
    <footer className="mt-16 border-t border-line bg-night text-fg-soft">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="text-fg" aria-label={MARCA.nombre + ' — Inicio'}><BrandLogo size="lg" /></Link>
          <p className="max-w-md font-display text-xl italic text-fg-soft">{MARCA.eslogan}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <Columna title="Colección"><Lista links={coleccion} /></Columna>
          <Columna title="Ayuda"><Lista links={AYUDA} /></Columna>
          <Columna title="Contacto"><Contacto /></Columna>
          {/* Trae sus propios títulos (medios de pago y de envío). */}
          <div><FooterPaymentBadges mercadopago={mercadopago} transferencia={transferencia} ca={ca} oca={oca} andreani={andreani} /></div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-4 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {MARCA.nombre}. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <Link href="/terminos" className="transition-colors hover:text-bordo">Términos y condiciones</Link>
            <Link href="/privacidad" className="transition-colors hover:text-bordo">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
