'use client';

import React, { useState, useEffect, useTransition, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/data/shopData';
import { ShopToolbar } from './ShopToolbar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ProductGrid } from './ProductGrid';
import { DraftFilters, EMPTY_DRAFT_FILTERS } from './FilterDrawerPortal';
import { SORT_OPTIONS } from './SortSheetModal';
import { PlpCacheValue } from '@/lib/plp-cache';
import { toShopProduct, SlimCatalogueProduct } from '@/lib/catalogue';

// Dynamic import for drawer & modal only when opened
const FilterDrawerPortal = dynamic(
  () => import('./FilterDrawerPortal').then((m) => m.FilterDrawerPortal),
  { ssr: false }
);

const SortSheetModal = dynamic(
  () => import('./SortSheetModal').then((m) => m.SortSheetModal),
  { ssr: false }
);

interface PLPPageContentProps {
  initialCategory?: string;
  initialTarget?: string;
  initialSort?: string;
  initialOccasion?: string;
  initialQuery?: string;
  initialProducts?: Product[];
  initialNextCursor?: string | null;
  initialHasMore?: boolean;
  initialData?: PlpCacheValue;
  allProducts?: Product[];
}

export const PLPPageContent: React.FC<PLPPageContentProps> = ({
  initialCategory,
  initialTarget,
  initialSort,
  initialOccasion,
  initialQuery,
  initialProducts,
  initialNextCursor,
  initialHasMore,
  initialData,
  allProducts,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Grid view column toggles
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);
  const [desktopColumns, setDesktopColumns] = useState<3 | 4>(4);

  // Modal / Drawer open states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  // Products and cursor-based pagination state
  const [products, setProducts] = useState<Product[]>(
    initialProducts || allProducts || initialData?.products || []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor || null);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore ?? false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state on server re-render (e.g. filter or sort navigation)
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setNextCursor(initialNextCursor || null);
      setHasMore(initialHasMore ?? false);
    }
  }, [initialProducts, initialNextCursor, initialHasMore]);

  // Parse filters from URL
  const currentFilters: DraftFilters = useMemo(() => {
    const targetParam = searchParams.get('target');
    const catParam = searchParams.get('category');
    const catsParam = searchParams.get('categories');
    const sizesParam = searchParams.get('sizes');
    const coloursParam = searchParams.get('colours');
    const fabricsParam = searchParams.get('fabrics');
    const occasionsParam = searchParams.get('occasions');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const discParam = searchParams.get('discount');
    const inStockParam = searchParams.get('inStock');

    const categories: string[] = [];
    if (catParam) categories.push(catParam.toLowerCase());
    if (catsParam) {
      catsParam.split(',').forEach((c) => {
        const clean = c.trim().toLowerCase();
        if (clean && !categories.includes(clean)) categories.push(clean);
      });
    }

    const targets: string[] = [];
    if (targetParam && targetParam !== 'all') {
      targets.push(targetParam.toLowerCase());
    }

    const occasions: string[] = [];
    if (initialOccasion) occasions.push(initialOccasion);
    if (occasionsParam) {
      occasionsParam.split(',').forEach((o) => {
        const clean = o.trim();
        if (clean && !occasions.includes(clean)) occasions.push(clean);
      });
    }

    return {
      target: targets,
      categories,
      minPrice: minPriceParam ? Number(minPriceParam) : 500,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : 35000,
      sizes: sizesParam ? sizesParam.split(',').filter(Boolean) : [],
      colours: coloursParam ? coloursParam.split(',').filter(Boolean) : [],
      fabrics: fabricsParam ? fabricsParam.split(',').filter(Boolean) : [],
      occasions,
      discount: discParam ? Number(discParam) : 0,
      inStockOnly: inStockParam === 'true',
    };
  }, [searchParams, initialOccasion]);

  const currentSort = searchParams.get('sort') || 'featured';

  // Selected Category Name for Title (if any)
  const selectedCategoryName = useMemo(() => {
    if (currentFilters.categories.length > 0) {
      return currentFilters.categories[0].replace(/-/g, ' ');
    }
    if (initialCategory) {
      return initialCategory.replace(/-/g, ' ');
    }
    return '';
  }, [currentFilters.categories, initialCategory]);

  const totalCount = products.length;
  const computedFacets = initialData?.facets || {};

  // Restore scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('tgc_plp_scroll');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: 'smooth' });
        sessionStorage.removeItem('tgc_plp_scroll');
      }, 150);
    }
  }, []);

  // Save scroll before navigating to PDP
  useEffect(() => {
    const handleSaveScroll = () => {
      sessionStorage.setItem('tgc_plp_scroll', String(window.scrollY));
    };
    window.addEventListener('beforeunload', handleSaveScroll);
    return () => window.removeEventListener('beforeunload', handleSaveScroll);
  }, []);

  // Apply filters by writing to URL once (SQL filters server-side)
  const handleApplyFilters = (newFilters: DraftFilters) => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (newFilters.target.length > 0) params.set('target', newFilters.target.join(','));
      if (newFilters.categories.length > 0) {
        if (newFilters.categories.length === 1) {
          params.set('category', newFilters.categories[0]);
        } else {
          params.set('categories', newFilters.categories.join(','));
        }
      }
      if (newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','));
      if (newFilters.colours.length > 0) params.set('colours', newFilters.colours.join(','));
      if (newFilters.fabrics.length > 0) params.set('fabrics', newFilters.fabrics.join(','));
      if (newFilters.occasions.length > 0) params.set('occasions', newFilters.occasions.join(','));
      if (newFilters.minPrice > 500) params.set('minPrice', String(newFilters.minPrice));
      if (newFilters.maxPrice < 35000) params.set('maxPrice', String(newFilters.maxPrice));
      if (newFilters.discount > 0) params.set('discount', String(newFilters.discount));
      if (newFilters.inStockOnly) params.set('inStock', 'true');
      if (currentSort) params.set('sort', currentSort);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Remove individual filter chip
  const handleRemoveFilter = (key: keyof DraftFilters, value?: string) => {
    const updated = { ...currentFilters };
    if (key === 'discount') {
      updated.discount = 0;
    } else if (key === 'inStockOnly') {
      updated.inStockOnly = false;
    } else if (key === 'minPrice' || key === 'maxPrice') {
      updated.minPrice = 500;
      updated.maxPrice = 35000;
    } else if (value && Array.isArray(updated[key])) {
      (updated[key] as string[]) = (updated[key] as string[]).filter((x) => x !== value);
    }
    handleApplyFilters(updated);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    handleApplyFilters(EMPTY_DRAFT_FILTERS);
  };

  // Select Sort (SQL sorts server-side)
  const handleSelectSort = (sortVal: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sortVal);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Load more trigger: fetches the next 12 products from /api/products using keyset cursor
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set('cursor', nextCursor);
      params.set('limit', '12');

      const catParam = initialCategory || currentFilters.categories[0] || searchParams.get('category') || '';
      if (catParam) params.set('category', catParam);

      const targetParam = initialTarget || currentFilters.target[0] || searchParams.get('target') || '';
      if (targetParam) params.set('target', targetParam);

      if (currentSort && currentSort !== 'featured') {
        params.set('sort', currentSort);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          setProducts((prev) => [...prev, ...data.products]);
          setNextCursor(data.nextCursor || null);
          setHasMore(Boolean(data.hasMore));
        }
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Active filter count for toolbar badge
  const activeFilterCount = useMemo(() => {
    return (
      currentFilters.target.length +
      currentFilters.categories.length +
      currentFilters.sizes.length +
      currentFilters.colours.length +
      currentFilters.fabrics.length +
      currentFilters.occasions.length +
      (currentFilters.discount > 0 ? 1 : 0) +
      (currentFilters.inStockOnly ? 1 : 0) +
      (currentFilters.minPrice > 500 || currentFilters.maxPrice < 35000 ? 1 : 0)
    );
  }, [currentFilters]);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === currentSort)?.label;

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1417] min-h-screen select-none font-sans">
      {/* Small Breadcrumb (Desktop Only) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 hidden md:flex items-center space-x-1.5 text-xs text-neutral-500 font-sans">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/shop" className="hover:text-black transition-colors">
          Shop
        </Link>
        {selectedCategoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[#1C1417] font-medium uppercase">
              {selectedCategoryName}
            </span>
          </>
        )}
      </div>

      {/* Selected Category or Search Query Title Above Toolbar */}
      {(selectedCategoryName || searchParams?.get('q') || initialQuery) && (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
          <h1 className="text-[18px] font-normal tracking-[0.04em] uppercase text-[#1C1417] leading-tight truncate">
            {searchParams?.get('q') || initialQuery
              ? `Results for '${searchParams?.get('q') || initialQuery}'`
              : selectedCategoryName}
          </h1>
        </div>
      )}

      {/* ONE Sticky Toolbar */}
      <ShopToolbar
        productCount={products.length}
        activeFilterCount={activeFilterCount}
        onOpenFilter={() => setFilterDrawerOpen(true)}
        onOpenSort={() => setSortModalOpen(true)}
        mobileColumns={mobileColumns}
        setMobileColumns={setMobileColumns}
        desktopColumns={desktopColumns}
        setDesktopColumns={setDesktopColumns}
        currentSortLabel={currentSortLabel}
      />

      {/* Active Filter Removable Chips Row */}
      <ActiveFilterChips
        filters={currentFilters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Product Grid Stage */}
      <main className="w-full">
        <ProductGrid
          products={products}
          isLoading={isLoadingMore || isPending}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          mobileColumns={mobileColumns}
          desktopColumns={desktopColumns}
          target={searchParams?.get('target') || initialTarget || 'women'}
        />
      </main>

      {/* Filter Drawer Portal */}
      {filterDrawerOpen && (
        <FilterDrawerPortal
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          appliedFilters={currentFilters}
          onApply={handleApplyFilters}
          facetCounts={computedFacets}
          totalCount={totalCount}
        />
      )}

      {/* Sort Modal Portal */}
      {sortModalOpen && (
        <SortSheetModal
          isOpen={sortModalOpen}
          onClose={() => setSortModalOpen(false)}
          currentSort={currentSort}
          onSelectSort={handleSelectSort}
        />
      )}
    </div>
  );
};
