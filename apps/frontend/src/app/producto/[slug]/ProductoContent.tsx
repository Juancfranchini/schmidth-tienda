'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/types';
import { useProductoData } from './useProductoData';
import { ProductoSkeleton, ProductoLoadError, ProductoNotFound } from './ProductoLoadingStates';
import { useProductVariants } from './useProductVariants';
import { useProductoActions } from './useProductoActions';
import { deriveProductDisplay } from './deriveProductDisplay';
import { useConfigCuotas } from '@/lib/cuotas';
import ProductGallery from './components/ProductGallery';
import ProductDescription from './components/ProductDescription';
import ProductInfoColumn from './ProductInfoColumn';
import PaymentModal from './components/PaymentModal';
import ProductVideoHighlightsSection from './ProductVideoHighlightsSection';
import RelatedProducts from './components/RelatedProducts';
import TrustBottom from './components/TrustBottom';

interface Props {
  /** El producto que ya trajo el servidor; null si la API no respondió allá. */
  initialProduct: Product | null;
}

export default function ProductoContent({ initialProduct }: Props) {
  const params = useParams<{ slug: string }>();
  const { product, related, loading, error, retry } = useProductoData(params.slug, initialProduct);
  const variants = useProductVariants(product);
  const actions = useProductoActions(product, variants.selectedVariant, variants.activeProductVariants);
  const cuotas = useConfigCuotas();

  if (loading) return <ProductoSkeleton />;
  if (error) return <ProductoLoadError onRetry={retry} />;
  if (!product) return <ProductoNotFound />;

  const display = deriveProductDisplay(product, variants.selectedVariant, variants.activeProductVariants, cuotas);

  return (
    <div className="min-h-screen bg-page text-fg">
      {actions.showPaymentModal && (
        <PaymentModal
          onClose={() => actions.setShowPaymentModal(false)}
          displayPrice={display.displayPrice}
          installments={display.installments}
          hasInstallmentsInterest={display.hasInstallmentsInterest}
          installmentsInterest={display.installmentsInterest}
        />
      )}

      <nav aria-label="Ubicación" className="mx-auto flex max-w-7xl items-center gap-2 px-5 pt-6 text-xs text-fg-muted sm:px-8">
        <Link href="/" className="transition-colors hover:text-fg">Inicio</Link><span>/</span>
        <Link href="/catalogo" className="transition-colors hover:text-fg">Colección</Link><span>/</span>
        {product.category && (<><Link href={'/catalogo?categoria=' + product.category.slug} className="transition-colors hover:text-fg">{product.category.name}</Link><span>/</span></>)}
        <span className="truncate text-fg">{product.name}</span>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] xl:gap-16">
          <ProductGallery images={display.images} productName={product.name} hasDiscount={display.hasDiscount} discountPct={display.discountPct} isNew={product.isNew || false} />
          <ProductInfoColumn
            product={product}
            display={display}
            variants={variants}
            actions={actions}
          />
        </div>
      </div>

      <ProductDescription description={product.description} />

      <ProductVideoHighlightsSection
        showVideo={display.showVideo}
        showHighlights={display.showHighlights}
        embedUrl={display.embedUrl}
        embedVertical={display.embedVertical}
        relatedVideos={display.relatedVideos}
        highlights={display.highlights}
        highlightsTitle={display.highlightsTitle}
        highlightsDescription={display.highlightsDescription}
      />

      {display.showRelated && <RelatedProducts products={related} />}

      <TrustBottom />
    </div>
  );
}
