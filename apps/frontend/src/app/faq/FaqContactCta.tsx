import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { trackMetaEvent } from '@/lib/metaPixel';
import { WHATSAPP_URL } from '@/lib/marcaLinks';

export default function FaqContactCta() {
  return (
    <section className="border-t border-line py-5 sm:py-12 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h3 className="text-fg font-semibold text-xl mb-2">No encontraste lo que buscabas?</h3>
        <p className="text-fg-soft text-sm mb-6">Nuestro equipo esta disponible de Lunes a Viernes de 9 a 18 hs.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={WHATSAPP_URL} onClick={() => trackMetaEvent("Contact", { content_type: "whatsapp" })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-accent text-on-accent font-semibold text-sm rounded-xl hover:bg-accent-hover transition-colors"
          >
            <MessageCircle size={16} />
            Escribinos por WhatsApp
          </a>
          <Link
            href="/contacto"
            className="flex items-center gap-2 px-6 py-3 bg-ocean text-fg font-semibold text-sm rounded-xl hover:bg-ocean-2 transition-colors"
          >
            Ir al formulario de contacto
          </Link>
        </div>
      </div>
    </section>
  );
}
