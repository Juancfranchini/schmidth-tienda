'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useCatalogPage } from './useCatalogPage';
import { useVistaDeCategoria } from './useVistaDeCategoria';
import type { CatalogResult } from './getCatalogData';
import CatalogHeader from './components/CatalogHeader';
import CatalogChips from './components/CatalogChips';
import CatalogSidebar from './components/CatalogSidebar';
import CatalogGrid from './components/CatalogGrid';
import CatalogList from './components/CatalogList';
import CatalogPagination from './components/CatalogPagination';
import CatalogEmpty from './components/CatalogEmpty';
import CatalogError from './components/CatalogError';
import CatalogSkeleton from './components/CatalogSkeleton';
import CatalogMobileSidebar from './components/CatalogMobileSidebar';

interface Props {
  result: CatalogResult;
}

/** La parte interactiva del catálogo: filtros, orden, paginación y carrito. */
export default function CatalogoContent({ result }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const addCatalogItem = useCallback((product: Product) => {
    if (product.variants?.some((variant) => variant.active && !variant.isDefault) ||
        product.hasSize || product.hasColor || product.hasDimensions || product.hasWeight) {
      router.push('/producto/' + product.slug);
      return;
    }
    addItem(product);
  }, [addItem, router]);

  const {
    products, loading, error, retry, totalPages, totalCount, currentPage, sidebarOpen, setSidebarOpen,
    searchInput, setSearchInput, viewMode,
    hasFilters, activeChips, pageTitle, clearFilters, handleSearch, setParam,
    sidebarProps,
  } = useCatalogPage(result);
  useVistaDeCategoria(sidebarProps.selectedCategory, sidebarProps.categories, products);

  return (
    <div className="min-h-screen bg-waves">
      <CatalogHeader
        pageTitle={pageTitle}
        loading={loading}
        totalCount={totalCount}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearch}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="flex gap-12 xl:gap-16">
          <aside className="hidden lg:block">
            <CatalogSidebar {...sidebarProps} />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <button type="button" onClick={() => setSidebarOpen(true)}
                className="rotulo flex items-center gap-3 border border-fg/30 px-5 py-3 text-fg transition-colors hover:border-fg">
                <SlidersHorizontal size={14} strokeWidth={1.25} />Filtrar
                {hasFilters && <span className="font-display text-sm normal-case italic tracking-normal text-bordo">({activeChips.length})</span>}
              </button>
              <p className="font-display text-sm italic text-fg-soft">{totalCount === 1 ? '1 modelo' : totalCount + ' modelos'}</p>
            </div>

            <CatalogChips chips={activeChips} onClearAll={clearFilters} />

            {loading ? <CatalogSkeleton /> :
              error ? <CatalogError onRetry={retry} /> :
              products.length === 0 ? <CatalogEmpty hasFilters={hasFilters} onClear={clearFilters} /> :
                (viewMode === 'grid' ?
                  <CatalogGrid products={products} onAddToCart={addCatalogItem} colorFiltrado={sidebarProps.selectedColor} />
                :
                  <CatalogList products={products} onAddToCart={addCatalogItem} />
                )
            }

            <CatalogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setParam('page', String(p))} />
          </div>
        </div>
      </div>

      <CatalogMobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} sidebarProps={sidebarProps} />
    </div>
  );
}
