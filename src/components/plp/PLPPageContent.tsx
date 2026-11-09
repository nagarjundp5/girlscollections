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

// Dynamic import for drawer & modal only when opened (Part 4 Speed requirement)
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
  initialOccasion?: string;
  initialData?: PlpCacheValue;
}

export const PLPPageContent: React.FC<PLPPageContentProps> = ({
  initialCategory,
  initialTarget,
  initialOccasion,
  initialData,
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

  // Products state (seeded from server-rendered initialData if available)
  const [products, setProducts] = useState<Product[]>(initialData?.products || []);
  const [page, setPage] = useState(initialData?.page || 1);
  const [totalCount, setTotalCount] = useState(initialData?.total || 0);
  const [hasMore, setHasMore] = useState(initialData?.hasMore || false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [facetCounts, setFacetCounts] = useState<{
    categories?: Record<string, number>;
    sizes?: Record<string, number>;
    colours?: Record<string, number>;
    fabrics?: Record<string, number>;
    occasions?: Record<string, number>;
  }>(initialData?.facets || {});

  const hasMountedRef = useRef(false);

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

  // Fetch products from server API
  const fetchProducts = useCallback(
    async (pageToFetch: number, append: boolean = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentFilters.target.length > 0) params.set('target', currentFilters.target.join(','));
        if (currentFilters.categories.length > 0) params.set('categories', currentFilters.categories.join(','));
        if (currentFilters.sizes.length > 0) params.set('sizes', currentFilters.sizes.join(','));
        if (currentFilters.colours.length > 0) params.set('colours', currentFilters.colours.join(','));
        if (currentFilters.fabrics.length > 0) params.set('fabrics', currentFilters.fabrics.join(','));
        if (currentFilters.occasions.length > 0) params.set('occasions', currentFilters.occasions.join(','));
        if (currentFilters.minPrice > 500) params.set('minPrice', String(currentFilters.minPrice));
        if (currentFilters.maxPrice < 35000) params.set('maxPrice', String(currentFilters.maxPrice));
        if (currentFilters.discount > 0) params.set('discount', String(currentFilters.discount));
        if (currentFilters.inStockOnly) params.set('inStock', 'true');
        if (currentSort) params.set('sort', currentSort);

        const limit = typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 20;
        params.set('page', String(pageToFetch));
        params.set('limit', String(limit));

        const res = await fetch(`/api/products/list?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch catalogue');

        const data = await res.json();
        const incomingProducts: Product[] = data.products || [];

        setProducts((prev) => (append ? [...prev, ...incomingProducts] : incomingProducts));
        setTotalCount(data.total || incomingProducts.length);
        setHasMore(data.hasMore || false);
        setPage(pageToFetch);

        if (data.facetCounts) {
          setFacetCounts(data.facetCounts);
        }
      } catch (err) {
        console.error('[PLP] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters, currentSort]
  );

  // Restore scroll position or use server-rendered data
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('tgc_plp_scroll');
    const savedPage = sessionStorage.getItem('tgc_plp_page');

    if (savedScroll && savedPage) {
      const targetPage = Number(savedPage);
      fetchProducts(targetPage, false).then(() => {
        setTimeout(() => {
          window.scrollTo({ top: Number(savedScroll), behavior: 'smooth' });
          sessionStorage.removeItem('tgc_plp_scroll');
          sessionStorage.removeItem('tgc_plp_page');
        }, 150);
      });
      hasMountedRef.current = true;
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      // If server already rendered initialData, do not duplicate the fetch
      if (initialData) {
        return;
      }
    }

    // Subsequent filter or sort URL changes
    fetchProducts(1, false);
  }, [fetchProducts, initialData]);

  // Save scroll before navigating to PDP
  useEffect(() => {
    const handleSaveScroll = () => {
      sessionStorage.setItem('tgc_plp_scroll', String(window.scrollY));
      sessionStorage.setItem('tgc_plp_page', String(page));
    };
    window.addEventListener('beforeunload', handleSaveScroll);
    return () => window.removeEventListener('beforeunload', handleSaveScroll);
  }, [page]);

  // Apply filters by writing to URL once (inside startTransition)
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

  // Select Sort
  const handleSelectSort = (sortVal: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sortVal);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Load more / Infinite scroll trigger
  const handleLoadMore = () => {
    if (isLoading || !hasMore) return;
    fetchProducts(page + 1, true);
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

      {/* Selected Category Small 18px Title Above Toolbar (normal weight, one line) */}
      {selectedCategoryName && (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
          <h1 className="text-[18px] font-normal tracking-[0.04em] uppercase text-[#1C1417] leading-tight truncate">
            {selectedCategoryName}
          </h1>
        </div>
      )}

      {/* ONE Sticky Toolbar (Height 52px, 1px bottom border, z-index below header) */}
      <ShopToolbar
        productCount={totalCount}
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
          isLoading={isLoading || isPending}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          mobileColumns={mobileColumns}
          desktopColumns={desktopColumns}
        />
      </main>

      {/* Lazy Filter Drawer Portal */}
      {filterDrawerOpen && (
        <FilterDrawerPortal
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          appliedFilters={currentFilters}
          onApply={handleApplyFilters}
          facetCounts={facetCounts}
          totalCount={totalCount}
        />
      )}

      {/* Lazy Sort Modal Portal */}
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
