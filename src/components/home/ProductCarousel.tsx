'use client';

import React, { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  variant?: 'trending' | 'new' | 'category';
  viewAllHref?: string;
  viewAllLabel?: string;
  filter?: 'all' | 'women' | 'kids';
  // Optional backwards-compatibility props (ignored in clean taruni layout)
  accentWord?: string;
  eyebrow?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  products,
  variant = 'trending',
  viewAllHref = '/shop',
  viewAllLabel = 'VIEW ALL',
  filter = 'all',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useShop();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter products by homepage active category tab (Women / Kids / All)
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let list = products.filter(
      (p) => p && p.is_active !== false && p.price > 0 && p.images && p.images.length > 0
    );

    if (filter === 'women') {
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const isKids =
          cat.includes('kids') ||
          sub.includes('kids') ||
          cat.includes('frock') ||
          cat.includes('pattu') ||
          p.gender === 'unisex';
        return !isKids;
      });
    } else if (filter === 'kids') {
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        return (
          cat.includes('kids') ||
          sub.includes('kids') ||
          cat.includes('frock') ||
          cat.includes('pattu') ||
          p.gender === 'unisex'
        );
      });
    }

    return list;
  }, [products, filter]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatPrice = (val: number) => {
    const rupees = val > 10000 ? Math.round(val / 100) : val;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  // If no products exist for this section, hide completely (no placeholders)
  if (!filteredProducts || filteredProducts.length === 0) {
    return null;
  }

  const badgeText = variant === 'new' ? 'New In' : 'Trending';

  const targetViewAllHref = viewAllHref
    ? filter !== 'all'
      ? viewAllHref.includes('?')
        ? `${viewAllHref}&target=${filter}`
        : `${viewAllHref}?target=${filter}`
      : viewAllHref
    : '';

  return (
    <section className="w-full py-10 md:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION TITLE: Centered, Bold 22-28px, tracking 0.06em, #1C1417 (No eyebrow, no underline) */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[22px] md:text-[28px] font-sans font-semibold tracking-[0.06em] text-[#1C1417]">
            {title}
          </h2>
        </div>

        {/* CAROUSEL WRAPPER WITH SIDE ARROWS ON DESKTOP */}
        <div className="relative group/track">
          
          {/* Left Arrow (Desktop Only, White Circle) */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/track:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-5 h-5 text-[#1C1417]" />
          </button>

          {/* Right Arrow (Desktop Only, White Circle) */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/track:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Next products"
          >
            <ChevronRight className="w-5 h-5 text-[#1C1417]" />
          </button>

          {/* CAROUSEL TRACK */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredProducts.map((product) => {
              const isWishlisted = isInWishlist(product.id);
              const isHovered = hoveredId === product.id;
              const hasSecondImage = product.images && product.images.length > 1;
              const primaryImg = product.images[0];
              const secondaryImg = hasSecondImage ? product.images[1] : primaryImg;

              const optimizedPrimary = getOptimizedImageUrl(primaryImg, { width: 700, quality: 85 });
              const optimizedSecondary = getOptimizedImageUrl(secondaryImg, { width: 700, quality: 85 });

              const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['FREE SIZE'];
              const stockMap = product.stock_quantity || {};

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

              const targetPref = filter !== 'all' ? filter : (product.gender === 'kids' || product.gender === 'unisex' ? 'kids' : 'women');
              const productUrl = `/shop/${product.slug}?target=${targetPref}`;

              return (
                <div
                  key={product.id}
                  className="shrink-0 snap-start select-none w-[calc(50%-8px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] min-w-[160px] md:min-w-[280px] max-w-[340px]"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* CARD CONTAINER (No border, no shadow, no inner padding) */}
                  <div className="group relative flex flex-col w-full">
                    
                    {/* 3:4 PORTRAIT IMAGE CONTAINER */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#FAF8F5] rounded-none">
                      <Link
                        href={productUrl}
                        className="block w-full h-full relative"
                        aria-label={product.name}
                      >
                        {/* Primary Image - uncropped object-contain */}
                        <Image
                          src={optimizedPrimary}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px"
                          className={`object-contain transition-opacity duration-500 ease-in-out ${
                            isHovered && hasSecondImage ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                        />

                        {/* Secondary Image (Hover Swap on Desktop) - uncropped object-contain */}
                        {hasSecondImage && (
                          <Image
                            src={optimizedSecondary}
                            alt={`${product.name} alternate view`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px"
                            className={`object-contain transition-opacity duration-500 ease-in-out ${
                              isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading="lazy"
                          />
                        )}
                      </Link>

                      {/* Black small tag top-left (11px, white text, square corners) */}
                      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                        <span className="inline-block bg-black text-white text-[10px] md:text-[11px] font-sans font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-none">
                          {badgeText}
                        </span>
                      </div>

                      {/* White circular heart top-right */}
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

                      {/* Desktop Hover Slide-Up Translucent Sizes Bar */}
                      <div
                        className={`hidden md:flex absolute inset-x-0 bottom-0 z-20 bg-white/90 backdrop-blur-md px-2 py-2.5 items-center justify-center gap-1.5 transition-transform duration-300 ease-out ${
                          isHovered ? 'translate-y-0' : 'translate-y-full'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-[#1C1417]/60 tracking-wider mr-1">
                          Sizes:
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {productSizes.map((size) => {
                            const isSoldOut = stockMap[size] !== undefined && stockMap[size] <= 0;
                            return (
                              <Link
                                key={size}
                                href={`/shop/${product.slug}?size=${encodeURIComponent(size)}&target=${targetPref}`}
                                className={`text-[11px] font-sans px-1.5 py-0.5 rounded-xs transition-colors ${
                                  isSoldOut
                                    ? 'line-through text-black/30 cursor-not-allowed pointer-events-none'
                                    : 'font-medium text-[#1C1417] hover:bg-black hover:text-white'
                                }`}
                              >
                                {size}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* TEXT UNDER IMAGE: Left-aligned, high contrast */}
                    <div className="pt-3 pb-1 text-left">
                      <Link href={productUrl} className="block group/title">
                        {/* Product Name in uppercase 14px, weight 400, dark, max 2 lines */}
                        <h3 className="text-[13px] md:text-[14px] font-sans font-normal uppercase tracking-[0.04em] text-[#1C1417] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price in bold 15-16px, MRP struck through, discount % in sale colour */}
                      <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] md:text-[16px] font-sans font-bold text-[#1C1417]">
                          {formatPrice(price)}
                        </span>

                        {hasDiscount && comparePrice && (
                          <>
                            <span className="text-[12px] md:text-[13px] font-sans text-[#767676] line-through font-normal">
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

        {/* SOLID "VIEW ALL" BUTTON (Dark colour, white text, 44px high, 180px wide, tracking 0.12em) Centred Below */}
        {targetViewAllHref && (
          <div className="mt-8 md:mt-12 text-center">
            <Link
              href={targetViewAllHref}
              className="inline-flex items-center justify-center w-[180px] h-[44px] bg-[#1C1417] hover:bg-black text-white text-[12px] md:text-[13px] font-sans font-medium tracking-[0.12em] uppercase transition-colors"
            >
              {viewAllLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;
