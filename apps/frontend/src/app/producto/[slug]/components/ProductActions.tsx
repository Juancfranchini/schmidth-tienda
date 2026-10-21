'use client';

import { trackMetaEvent } from '@/lib/metaPixel';
import { useSiteSettings, buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { ShoppingCart, Heart, Minus, Plus, MessageCircle } from 'lucide-react';

interface Props {
  stock: number;
  /** Con reserva activada se puede comprar siempre: el stock no interviene. */
  isMadeToOrder?: boolean;
  productName: string;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  added: boolean;
  wished: boolean;
  onWish: () => void;
}

export default function ProductActions({ stock, isMadeToOrder, productName, quantity, onQuantityChange, onBuyNow, onAddToCart, added, wished, onWish }: Props) {
  // Con la reserva activada el stock no se mira, valga lo que valga: si el
  // producto está publicado con esa opción es porque la tienda puede tomar la
  // seña y traerlo. El stock que se lleva es el del local, y no tiene nada que
  // ver con lo que se encarga afuera. Antes la ficha miraba solo el stock y
  // daba por agotado justo lo que está pensado para venderse sin tenerlo.
  const sinStock = !isMadeToOrder && stock === 0;
  const tope = isMadeToOrder ? 99 : stock || 99;

  const { whatsapp } = useSiteSettings();
  // El número estaba escrito a mano en el código, y era otro distinto del
  // configurado en el backoffice: las consultas iban a un teléfono ajeno.
  const consulta = buildWhatsappUrl(whatsapp, 'Hola! Me interesa "' + productName + '".');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base sm:text-sm font-semibold text-fg">Cantidad:</span>
        <div className="flex items-center bg-chip border border-line overflow-hidden flex-1 max-w-[180px]">
          <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-fg/[0.04] transition-colors disabled:opacity-30">
            <Minus size={15} />
          </button>
          <span className="flex-1 text-center font-bold text-lg sm:text-base text-fg">{quantity}</span>
          <button onClick={() => onQuantityChange(Math.min(tope, quantity + 1))} disabled={quantity >= tope}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-fg/[0.04] transition-colors disabled:opacity-30">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onBuyNow} disabled={sinStock}
          className="w-full py-3.5 sm:py-4 bg-accent text-on-accent font-semibold text-sm sm:text-base uppercase tracking-wider btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isMadeToOrder ? 'Reservar' : 'Comprar ahora'}
        </button>

        <div className="flex gap-2">
          <button onClick={onAddToCart} disabled={sinStock}
            className={'flex-1 flex items-center justify-center gap-2 py-3.5 border font-semibold text-sm uppercase tracking-wider transition-all duration-200 ' +
              (sinStock ? 'border-line text-fg-muted cursor-not-allowed' :
                added ? 'border-accent bg-accent/10 text-brand-fg' :
                'border-fg-muted text-fg hover:border-accent hover:text-brand-fg')}>
            <ShoppingCart size={16} />
            {sinStock ? 'Sin stock en este color' : added ? '¡Agregada!' : 'Agregar al carrito'}
          </button>
          <button onClick={onWish}
            className={'w-12 h-12 border flex items-center justify-center transition-all ' +
              (wished ? 'border-accent bg-accent/10 text-brand-fg' : 'border-fg-muted text-fg-soft hover:border-accent hover:text-brand-fg')}
            aria-label="Favoritos">
            <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Sin número cargado no se dibuja el botón: llevaba a un teléfono
            que no es el de la tienda. */}
        {consulta && (
          <a href={consulta} target="_blank" rel="noopener noreferrer" onClick={() => trackMetaEvent("Contact", { content_type: "whatsapp" })}
            className={'w-full py-3 border text-sm flex items-center justify-center gap-2 transition-colors ' + (sinStock ? 'border-bordo bg-bordo text-on-accent hover:border-ink hover:bg-ink' : 'border-line text-fg hover:border-fg')}>
            <MessageCircle size={16} strokeWidth={1.5} />{sinStock ? 'Pedilo en este color por WhatsApp' : 'Consultar por WhatsApp'}
          </a>
        )}
      </div>
    </div>
  );
}