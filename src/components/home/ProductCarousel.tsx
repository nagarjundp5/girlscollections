'use client';

import React, { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LuxuryHeartButton from '@/components/LuxuryHeartButton';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { clCard34 } from '@/lib/cloudinary';

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

  // Products are pre-filtered in SQL per gender tab — strictly zero client-side gender filtering
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter(
      (p) => p && p.is_active !== false && p.price > 0 && Array.isArray(p.images) && p.images.length > 0
    );
  }, [products]);

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
            className="flex items-start gap-[14px] md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredProducts.map((product, cardIdx) => {
              const isWishlisted = isInWishlist(product.id);
              const isHovered = hoveredId === product.id;
              const hasSecondImage = product.images && product.images.length > 1;
              const primaryImg = product.images[0];
              const secondaryImg = hasSecondImage ? product.images[1] : primaryImg;

              const optimizedPrimary = clCard34(primaryImg);
              const optimizedSecondary = clCard34(secondaryImg);

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

              const targetPref = filter !== 'all' ? filter : (product.gender === 'kids' || product.gender === 'unisex' ? 'kids' : 'women');
              const productUrl = `/shop/${product.slug}?target=${targetPref}`;

              return (
                <div
                  key={product.id}
                  className="shrink-0 snap-start select-none w-[min(74vw,300px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] md:min-w-[260px] max-w-[340px]"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* CARD CONTAINER */}
                  <div className="group relative flex flex-col w-full rounded-2xl overflow-hidden bg-white border border-[#EADFD6] shadow-[0_2px_10px_rgba(28,20,23,0.04)]">
                    
                    {/* 3:4 UNIFORM CARD IMAGE (Cloudinary c_pad,ar_3:4,w_600,b_auto) */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-2xl bg-[#FAF8F5]">
                      <Link
                        href={productUrl}
                        className="block w-full h-full relative"
                        aria-label={product.name}
                      >
                        <Image
                          src={optimizedPrimary}
                          alt={product.name}
                          width={600}
                          height={800}
                          priority={cardIdx === 0 && variant === 'trending'}
                          sizes="(max-width: 640px) 74vw, (max-width: 1024px) 33vw, 340px"
                          className="w-full h-full object-cover block rounded-t-2xl transition-opacity duration-300"
                          loading={cardIdx === 0 && variant === 'trending' ? 'eager' : 'lazy'}
                        />
                        {hasSecondImage && isHovered && (
                          <Image
                            src={optimizedSecondary}
                            alt={`${product.name} alternate view`}
                            width={600}
                            height={800}
                            sizes="(max-width: 640px) 74vw, (max-width: 1024px) 33vw, 340px"
                            className="hidden md:block w-full h-full object-cover absolute inset-0 rounded-t-2xl"
                            loading="lazy"
                          />
                        )}
                      </Link>

                      {/* Small rose-pink pill tag top-left */}
                      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                        <span className="inline-block bg-[#D94F7E] text-white text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                          {badgeText}
                        </span>
                      </div>

                      {/* Wishlist heart top-right */}
                      <div className="absolute top-1.5 right-1.5 z-20">
                        <LuxuryHeartButton
                          isLiked={isWishlisted}
                          onToggle={() => toggleWishlist(product.id)}
                          size="md"
                        />
                      </div>

                      {/* Desktop Hover Slide-Up Translucent Sizes Bar */}
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

                    {/* TEXT UNDER IMAGE: 12px compact padding */}
                    <div className="p-3 text-left">
                      <Link href={productUrl} className="block group/title">
                        <h3 className="text-[15px] font-sans font-semibold text-[#1A1E3A] line-clamp-2 min-h-[42px] leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price in bold, MRP struck through, Save ₹X in green */}
                      <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                        <span className="text-[17px] md:text-[16px] font-sans font-bold text-[#1A1E3A] tabular-nums">
                          {formatPrice(price)}
                        </span>

                        {hasDiscount && comparePrice && (
                          <>
                            <span className="text-[13px] font-sans text-[#6B6F85] line-through font-normal tabular-nums">
                              {formatPrice(comparePrice)}
                            </span>
                            <span className="text-[12px] font-sans font-semibold text-[#2E8B6A]">
                              Save ₹{(comparePrice - price).toLocaleString('en-IN')}
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

        {/* Full-width rose-pink View all button */}
        {targetViewAllHref && (
          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={targetViewAllHref}
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[48px] px-8 py-3 bg-[#D94F7E] hover:bg-[#C23F6D] text-white text-sm font-sans font-semibold rounded-xl transition-colors shadow-sm"
            >
              {viewAllLabel === 'VIEW ALL WOMEN'
                ? 'View all women'
                : viewAllLabel === 'VIEW ALL KIDS'
                ? 'View all kids'
                : 'View all'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;
