'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { WOMEN_CATEGORIES, KIDS_CATEGORIES, CategoryItem } from '@/data/categoryTaxonomy';
import { resolveCanonicalCategorySlug } from '@/lib/categoryHref';

import { TabbedCategoryRows } from '@/lib/homepage-snapshot';

interface CategoryProductRowsProps {
  filter?: 'all' | 'women' | 'kids';
  /** Pre-grouped category rows from server snapshot */
  categoryRows?: TabbedCategoryRows;
  /** Pre-fetched products from the server snapshot */
  products?: Product[];
}

interface CategoryRowData {
  category: CategoryItem;
  products: Product[];
}

// Single Category Row Carousel Component
const CategoryCarouselRow: React.FC<{
  row: CategoryRowData;
  bgClass: string;
}> = ({ row, bgClass }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useShop();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, row.products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatPrice = (val: number) => {
    const rupees = val > 10000 ? Math.round(val / 100) : val;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  // Up to 8 products
  const displayProducts = row.products.slice(0, 8);
  const cleanTitle = row.category.name.replace(/–\s*1\s*Pc/i, '').trim();

  return (
    <section className={`w-full py-10 md:py-14 select-none ${bgClass}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left-aligned heading: “{Category} | Top Picks”, bold, in existing heading font */}
        <div className="mb-6 md:mb-8 text-left">
          <h3 className="text-[20px] md:text-[26px] font-sans font-semibold tracking-[0.05em] text-[#1C1417]">
            {cleanTitle} | Top Picks
          </h3>
        </div>

        {/* Carousel Container with Left/Right Scroll Buttons */}
        <div className="relative group/track">
          {/* Left Arrow Button (Mobile + Desktop, round with subtle border & shadow) */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className={`absolute left-0 sm:left-1 md:-left-4 lg:-left-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md border border-[#EAE5DE] flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous products"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-[#1C1417]" />
          </button>

          {/* Right Arrow Button (Mobile + Desktop, round with subtle border & shadow) */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className={`absolute right-0 sm:right-1 md:-right-4 lg:-right-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md border border-[#EAE5DE] flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next products"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-[#1C1417]" />
          </button>

          {/* Carousel Track:
              Desktop: 4 products visible (w-[calc(25%-18px)] with gap-6)
              Mobile: ~2.2 visible with swipe & scroll-snap-type: x mandatory, hidden scrollbar
          */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {displayProducts.map((product) => {
              const isWishlisted = isInWishlist(product.id);
              const isHovered = hoveredId === product.id;
              const hasSecondImage = product.images && product.images.length > 1;
              const primaryImg = product.images[0];
              const secondaryImg = hasSecondImage ? product.images[1] : primaryImg;

              const optimizedPrimary = getOptimizedImageUrl(primaryImg, { width: 700, quality: 85 });
              const optimizedSecondary = getOptimizedImageUrl(secondaryImg, { width: 700, quality: 85 });

              const rawSizes = (Array.isArray(product.sizes) ? product.sizes : [])
                .map((s: any) => typeof s === 'string' ? s : (s?.size || String(s)))
                .filter(Boolean);
              const isActualFreeSize = rawSizes.length === 0 || (rawSizes.length === 1 && /^(free\s*size|fs)$/i.test(rawSizes[0].trim()));
              const productSizes = isActualFreeSize ? ['Free Size'] : rawSizes;
              const stockMap: Record<string, any> = product.stock_quantity || {};

              const price = product.price > 10000 ? Math.round(product.price / 100) : product.price;
              const comparePrice =
                product.compare_price && product.compare_price > 10000
                  ? Math.round(product.compare_price / 100)
                  : product.compare_price;
              const hasDiscount = Boolean(comparePrice && comparePrice > price);
              const discountPercent =
                hasDiscount && comparePrice
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : 0;

              // Tag: Small "New In" tag only on products from the last 14 days
              const isNewIn = product.created_at
                ? Date.now() - new Date(product.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000
                : false;

              const targetPref = row.category.group;
              const productUrl = `/shop/${product.slug}?target=${targetPref}`;

              return (
                <div
                  key={product.id}
                  className="shrink-0 snap-start select-none w-[calc((100%-20px)/2.2)] sm:w-[calc((100%-36px)/3)] md:w-[calc(25%-18px)] min-w-[150px]"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Borderless Product Card */}
                  <div className="group relative flex flex-col w-full">
                    {/* 3:4 Portrait Image Container */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-white/60 rounded-none">
                      <Link
                        href={productUrl}
                        className="block w-full h-full relative"
                        aria-label={product.name}
                      >
                        {/* Fixed aspect-[3/4] object-cover */}
                        <Image
                          src={optimizedPrimary}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px"
                          className={`object-cover transition-opacity duration-500 ease-in-out ${
                            isHovered && hasSecondImage ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                        />

                        {hasSecondImage && (
                          <Image
                            src={optimizedSecondary}
                            alt={`${product.name} alternate view`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px"
                            className={`object-cover transition-opacity duration-500 ease-in-out ${
                              isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading="lazy"
                          />
                        )}
                      </Link>

                      {/* Small "New In" tag only on products from last 14 days */}
                      {isNewIn && (
                        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                          <span className="inline-block bg-black text-white text-[10px] md:text-[11px] font-sans font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-none">
                            New In
                          </span>
                        </div>
                      )}

                      {/* Heart Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#1C1417] hover:bg-white hover:scale-105 transition-all shadow-xs"
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          className={`w-4 h-4 md:w-4.5 md:h-4.5 transition-colors ${
                            isWishlisted
                              ? 'fill-[#7A1F2B] text-[#7A1F2B]'
                              : 'text-[#1C1417]'
                          }`}
                        />
                      </button>

                      {/* Desktop Hover Slide-Up Sizes Drawer */}
                      <div
                        className={`hidden md:flex absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-md px-2.5 py-2 items-center justify-center transition-transform duration-300 ease-out ${
                          isHovered ? 'translate-y-0' : 'translate-y-full'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-sans">
                          {productSizes.map((size, sIdx) => {
                            const isSoldOut = !isActualFreeSize && stockMap[size] !== undefined && Number(stockMap[size]) <= 0;
                            return (
                              <React.Fragment key={size}>
                                {sIdx > 0 && (
                                  <span className="text-black/30 select-none">·</span>
                                )}
                                <Link
                                  href={`/shop/${product.slug}?size=${encodeURIComponent(size)}&target=${targetPref}`}
                                  className={`px-1 py-0.5 rounded-xs transition-colors ${
                                    isSoldOut
                                      ? 'line-through text-black/30 cursor-not-allowed pointer-events-none'
                                      : 'font-medium text-[#1C1417] hover:bg-black hover:text-white'
                                  }`}
                                >
                                  {size}
                                </Link>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Text Under Image: Name and Price, borderless */}
                    <div className="pt-3 pb-1 text-left">
                      <Link href={productUrl} className="block group/title">
                        <h4 className="text-[13px] md:text-[14px] font-sans font-normal uppercase tracking-[0.04em] text-[#1C1417] line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                      </Link>

                      <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] md:text-[16px] font-sans font-bold text-[#1C1417]">
                          {formatPrice(price)}
                        </span>

                        {hasDiscount && comparePrice && (
                          <>
                            <span className="text-[12px] md:text-[13px] font-sans text-[#595959] line-through font-normal">
                              {formatPrice(comparePrice)}
                            </span>
                            <span className="text-[12px] md:text-[13px] font-sans font-semibold text-[#B8283B]">
                              ({discountPercent}% OFF)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Centered “VIEW ALL” button (navy fill, white text) linking to /shop?category={slug}&target={women|kids} */}
        <div className="mt-8 md:mt-10 text-center">
          <Link
            href={`/shop?category=${encodeURIComponent(row.category.slug)}&target=${row.category.group}`}
            className="inline-flex items-center justify-center px-8 py-3 bg-[#1A1E3A] text-white hover:bg-[#121528] text-xs md:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors rounded-none shadow-sm"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
};

export const CategoryProductRows: React.FC<CategoryProductRowsProps> = ({ filter = 'all', products = [], categoryRows }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(products);

  // Keep allProducts in sync if parent passes updated products (e.g. hot-reload)
  useEffect(() => {
    if (products.length > 0) {
      setAllProducts(
        [...products].sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
      );
    }
  }, [products]);

  // Helper to normalize and match category slugs
  const normalizeSlug = (s?: string | null): string =>
    (s || '').toLowerCase().replace(/_/g, '-').trim();

  const isKidsProduct = (p: Product): boolean => {
    const g = (p.gender || '').toLowerCase().trim();
    const c = (p.category || '').toLowerCase().trim();
    const s = (p.subcategory || '').toLowerCase().trim();
    return (
      g === 'kids' ||
      c.includes('kids') ||
      c.includes('children') ||
      c.includes('frock') ||
      c.includes('pattu') ||
      s.includes('kids') ||
      s.includes('children') ||
      s.includes('frock') ||
      s.includes('pattu')
    );
  };

  const isWomenProduct = (p: Product): boolean => {
    const g = (p.gender || '').toLowerCase().trim();
    if (isKidsProduct(p)) return false;
    return g === 'women' || g === 'both' || g === 'unisex' || !g;
  };

  const productBelongsToCategory = (p: Product, cat: CategoryItem): boolean => {
    const cSlug = normalizeSlug(cat.slug);
    const cId = normalizeSlug(cat.id);
    const cCanon = normalizeSlug(resolveCanonicalCategorySlug(cSlug, cat.group));
    const targetSlugs = new Set([cSlug, cId, cCanon]);

    // Match exact product category
    const pCat = normalizeSlug(p.category);
    if (pCat) {
      const pCanon = normalizeSlug(resolveCanonicalCategorySlug(pCat, cat.group));
      if (targetSlugs.has(pCat) || targetSlugs.has(pCanon)) return true;
    }

    // Match exact product subcategory
    const pSub = normalizeSlug(p.subcategory);
    if (pSub) {
      const pSubCanon = normalizeSlug(resolveCanonicalCategorySlug(pSub, cat.group));
      if (targetSlugs.has(pSub) || targetSlugs.has(pSubCanon)) return true;
    }

    // Match categoryIds array
    if (Array.isArray(p.categoryIds)) {
      for (const id of p.categoryIds) {
        const cleanId = normalizeSlug(id);
        const canonId = normalizeSlug(resolveCanonicalCategorySlug(cleanId, cat.group));
        if (targetSlugs.has(cleanId) || targetSlugs.has(canonId)) return true;
      }
    }

    // Match primaryCategoryId
    if (p.primaryCategoryId) {
      const pPrim = normalizeSlug(p.primaryCategoryId);
      if (targetSlugs.has(pPrim)) return true;
    }

    return false;
  };

  // Group products into categories dynamically or use server-provided pre-grouped categoryRows per tab
  const activeRows: CategoryRowData[] = useMemo(() => {
    if (categoryRows && categoryRows[filter || 'all'] && categoryRows[filter || 'all'].length > 0) {
      return categoryRows[filter || 'all'];
    }

    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // Filter active valid products, sorted newest first
    const valid = allProducts
      .filter(
        (p) =>
          p &&
          p.is_active !== false &&
          p.price > 0 &&
          Array.isArray(p.images) &&
          p.images.length > 0
      )
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

    const womenPool = valid.filter(isWomenProduct);
    const kidsPool = valid.filter(isKidsProduct);

    // Track shown product IDs across all rows on this page to prevent any duplicates
    const shownProductIds = new Set<string>();

    const buildRows = (
      categories: CategoryItem[],
      pool: Product[],
      maxRows: number
    ): CategoryRowData[] => {
      // Score categories by total matching products in pool
      const scored = categories
        .map((cat) => ({
          category: cat,
          matches: pool.filter((p) => productBelongsToCategory(p, cat)),
        }))
        .sort((a, b) => b.matches.length - a.matches.length);

      const rows: CategoryRowData[] = [];

      for (const item of scored) {
        if (rows.length >= maxRows) break;

        // De-duplicate: filter out products already shown in an earlier row
        const available = item.matches.filter((p) => !shownProductIds.has(p.id));

        // Skip any row with fewer than 3 unique products after filtering and de-duplication
        if (available.length >= 3) {
          const rowProducts = available.slice(0, 8);
          rowProducts.forEach((p) => shownProductIds.add(p.id));

          rows.push({
            category: item.category,
            products: rowProducts,
          });
        }
      }

      return rows;
    };

    if (filter === 'women') {
      return buildRows(WOMEN_CATEGORIES, womenPool, 5);
    }
    if (filter === 'kids') {
      return buildRows(KIDS_CATEGORIES, kidsPool, 5);
    }
    // 'all': 3 women rows followed by 2 kids rows
    const womenRows = buildRows(WOMEN_CATEGORIES, womenPool, 3);
    const kidsRows = buildRows(KIDS_CATEGORIES, kidsPool, 2);
    return [...womenRows, ...kidsRows];
  }, [allProducts, filter]);

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      {activeRows.map((row, idx) => (
        <CategoryCarouselRow
          key={`${row.category.group}-${row.category.slug}-${idx}`}
          row={row}
          // Alternate row backgrounds between white (#FFF) and the site's ivory (#FAF8F5)
          bgClass={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]'}
        />
      ))}
    </div>
  );
};

export default CategoryProductRows;

