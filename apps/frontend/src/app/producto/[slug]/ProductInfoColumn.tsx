'use client';

import { Product } from '@/types';
import { coloresDe } from '@/lib/colores';
import ColorSwatches from '@/components/ui/ColorSwatches';
import ProductPrice from './components/ProductPrice';
import ProductActions from './components/ProductActions';
import ProductDetalles from './components/ProductDetalles';
import ShippingCalc from './components/ShippingCalc';
import { deriveProductDisplay } from './deriveProductDisplay';
import { useProductVariants } from './useProductVariants';
import { useProductoActions } from './useProductoActions';

interface Props {
  product: Product;
  display: ReturnType<typeof deriveProductDisplay>;
  variants: ReturnType<typeof useProductVariants>;
  actions: ReturnType<typeof useProductoActions>;
}

/** Cómo se entrega el color elegido: ya, o confeccionado a pedido. */
function EstadoColor({ stock, isMadeToOrder }: { stock: number; isMadeToOrder: boolean }) {
  if (isMadeToOrder || stock <= 0) {
    return <p className="text-sm text-fg-soft"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-camel align-middle" />A pedido · lo confeccionamos para vos</p>;
  }
  return (
    <p className="text-sm text-fg-soft">
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#3F7D4E] align-middle" />
      Stock inmediato{stock <= 3 ? ' · quedan ' + stock : ''}
    </p>
  );
}

export default function ProductInfoColumn({ product, display, variants, actions }: Props) {
  const colores = coloresDe(product);
  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
      <div>
        <p className="rotulo mb-3 text-bordo">{[product.category?.name, product.material].filter(Boolean).join(' · ')}</p>
        <h1 className="font-display text-5xl leading-none text-fg sm:text-6xl">{product.name}</h1>
      </div>

      <ProductPrice
        productName={product.name}
        displayPrice={display.displayPrice} hasDiscount={display.hasDiscount} discountPct={display.discountPct}
        originalPrice={product.price} cuota={display.cuota} installments={display.installments}
        hasInstallmentsInterest={display.hasInstallmentsInterest} installmentsInterest={display.installmentsInterest}
        onShowPaymentModal={() => actions.setShowPaymentModal(true)}
        isMadeToOrder={product.isMadeToOrder} estimatedDays={product.estimatedDays} requiredDeposit={product.requiredDeposit}
        transferPrice={product.transferPrice}
      />

      {colores.length > 0 && (
        <div className="space-y-3 border-t border-line pt-6">
          <p className="text-sm text-fg">
            <span className="text-fg-muted">Color: </span>{variants.selectedColor ?? 'elegí uno'}
          </p>
          <ColorSwatches colores={colores} activo={variants.selectedColor} onElegir={(c) => variants.setSelectedColor(c.nombre)} tamanio="md" />
          {variants.selectedColor && <EstadoColor stock={display.effectiveStock} isMadeToOrder={!!product.isMadeToOrder} />}
        </div>
      )}

      <ProductActions
        stock={display.effectiveStock} isMadeToOrder={!!product.isMadeToOrder} productName={product.name + (variants.selectedColor ? ' (' + variants.selectedColor + ')' : '')}
        quantity={actions.quantity} onQuantityChange={actions.setQuantity}
        onBuyNow={actions.handleBuyNow} onAddToCart={actions.handleAddToCart} added={actions.added}
        wished={actions.wished} onWish={actions.toggleWish}
      />

      <ProductDetalles product={product} />
      <ShippingCalc />
    </div>
  );
}
