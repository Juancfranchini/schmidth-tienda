'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { getInstallmentTerms } from '@/lib/productPricing';
import { useConfigCuotas } from '@/lib/cuotas';
import { coloresDe, type ColorDeProducto } from '@/lib/colores';
import { useFavorito } from '@/store/favoritosStore';
import ColorSwatches from './ColorSwatches';
import Inclinar from '../home/Inclinar';

interface ProductCardProps {
  product: Product;
  /** Número de modelo en la colección (N°01…); sin número no se muestra. */
  numero?: number;
  /** Colores a mostrar primero (por ejemplo, el filtro del catálogo): arranca con la foto del primero que tenga. */
  coloresPreferidos?: string[];
  /** Se acepta por compatibilidad: la tarjeta lleva a la ficha, donde se elige el color. */
  onAddToCart?: (product: Product) => void;
}

/**
 * Tarjeta de la colección. No tiene botón de comprar: una cartera se elige
 * por color, y el color se elige en la ficha. Pasar por una muestra cambia la
 * foto a ese color; sin muestras, al pasar se ve la segunda foto.
 */
export default function ProductCard({ product, numero, coloresPreferidos = [] }: ProductCardProps) {
  const favorito = useFavorito(product.id);
  const cuotas = useConfigCuotas();
  const colores = coloresDe(product);
  const [color, setColor] = useState<ColorDeProducto | null>(() => colores.find((c) => coloresPreferidos.includes(c.nombre)) ?? null);

  const precio = product.effectivePrice ?? product.price;
  const conDescuento = !product.isMadeToOrder && precio < product.price;
  const terminos = getInstallmentTerms(product, cuotas);
  const foto = color?.imagen ?? product.images?.[0];
  const segunda = !color && product.images?.[1];
  const href = '/producto/' + product.slug + (color ? '?color=' + encodeURIComponent(color.nombre) : '');

  return (
    <article className="group flex flex-col">
      <Inclinar max={5} brillo className="relative">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-chip">
        {foto ? (
          <>
            <img src={getImageUrl(foto, 800)} alt={product.name + (color ? ' ' + color.nombre : '')} loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-[1.04]" />
            {segunda && (
              <img src={getImageUrl(segunda, 800)} alt="" aria-hidden loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:opacity-100" />
            )}
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-fg/10">{product.name}</span>
        )}
        <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew && <span className="rotulo bg-page/90 px-2 py-1 !text-[10px] text-fg">Nuevo</span>}
          {product.isMadeToOrder && <span className="rotulo bg-page/90 px-2 py-1 !text-[10px] text-fg">A pedido</span>}
        </span>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); favorito.alternar(); }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-page/80 text-fg transition-colors hover:text-bordo"
          aria-label={favorito.marcado ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorito.marcado}
        >
          <Heart size={15} strokeWidth={1.5} className={favorito.marcado ? 'fill-bordo text-bordo' : ''} />
        </button>
      </Link>
      </Inclinar>

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <Link href={href} className="min-w-0">
            {numero !== undefined && <span className="rotulo mr-2 !text-[10px] text-fg-muted">N°{String(numero).padStart(2, '0')}</span>}
            <h3 className="inline font-display text-xl leading-tight sm:text-2xl text-fg transition-colors hover:text-bordo">{product.name}</h3>
          </Link>
          <p className="shrink-0 text-sm text-fg sm:text-base">
            {conDescuento && <span className="mr-1.5 text-xs text-fg-muted line-through">{formatPrice(product.price)}</span>}
            {formatPrice(precio)}
          </p>
        </div>
        {terminos && !product.isMadeToOrder && (
          <p className="text-xs text-fg-muted">{terminos.count} cuotas de {formatPrice(terminos.amount)} {terminos.interestText}</p>
        )}
        <div className="mt-1"><ColorSwatches colores={colores} activo={color?.nombre} onElegir={setColor} /></div>
      </div>
    </article>
  );
}
