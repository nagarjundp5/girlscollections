'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from 'lucide-react';
import { Product } from '@/types';
import { LuxuryHeartButton } from '@/components/LuxuryHeartButton';
import { useShop } from '@/context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCarouselProps {
  title: string;
  accentWord?: string;
  eyebrow?: string;
  products: Product[];
  variant?: 'trending' | 'category' | 'new';
  viewAllHref?: string;
  viewAllLabel?: string;
  filter?: 'all' | 'women' | 'kids';
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title: initialTitle,
  accentWord,
  eyebrow: initialEyebrow,
  products,
  variant = 'category',
  viewAllHref,
  viewAllLabel = 'VIEW ALL',
  filter = 'all',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useShop();

  const dynamicTitle = useMemo(() => {
    if (variant === 'trending') {
      if (filter === 'women') return 'Trending in Women';
      if (filter === 'kids') return 'Trending in Kids';
      return 'Trending This Week';
    }
    return initialTitle;
  }, [variant, filter, initialTitle]);

  const dynamicEyebrow = useMemo(() => {
    if (variant === 'trending') {
      if (filter === 'women') return "WOMEN'S MOST LOVED";
      if (filter === 'kids') return "LITTLE ROYALTY MOST LOVED";
      return 'MOST LOVED RIGHT NOW';
    }
    return initialEyebrow;
  }, [variant, filter, initialEyebrow]);

  const filteredProducts = useMemo(() => {
    if (!filter || filter === 'all') return products;
    if (filter === 'women') {
      return products.filter((p) => {
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
    }
    if (filter === 'kids') {
      return products.filter((p) => {
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
    return products;
  }, [products, filter]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const formatPrice = (val: number) => {
    const rupees = val > 10000 ? Math.round(val / 100) : val;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  if (!filteredProducts || filteredProducts.length === 0) return null;

  return (
    <section className="w-full py-8 sm:py-14 pb-16 sm:pb-14 bg-ivory border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* HEADER ROW */}
        <div className="flex items-end justify-between mb-6 border-b border-zariGold/15 pb-3">
          <div>
            {dynamicEyebrow && (
              <span className="block mb-1 text-[11px] sm:text-xs font-sans font-bold tracking-[0.2em] uppercase text-zariGold">
                {dynamicEyebrow}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-inkNavy font-bold tracking-tight leading-[1.15]">
              {dynamicTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="group inline-flex items-center gap-1.5 text-xs font-sans font-bold tracking-widest uppercase text-zariGold hover:text-inkNavy transition-colors min-h-[44px]"
              >
                <span>{viewAllLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full border border-zariGold/30 hover:border-zariGold hover:bg-zariGold/10 flex items-center justify-center text-inkNavy transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zariGold"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-4 h-4 text-zariGold" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-zariGold/30 hover:border-zariGold hover:bg-zariGold/10 flex items-center justify-center text-inkNavy transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zariGold"
                aria-label="Next products"
              >
                <ChevronRight className="w-4 h-4 text-zariGold" />
              </button>
            </div>
          </div>
        </div>

        {/* CAROUSEL TRACK */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => {
              const isTop3Trending = variant === 'trending' && idx < 3;
              const isNewItem = variant === 'new';
              const isWishlisted = isInWishlist(product.id);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col shrink-0 snap-start select-none w-[72vw] xs:w-[220px] sm:w-[250px] lg:w-[280px] bg-ivory rounded-xl overflow-hidden border border-zariGold/20 hover:border-zariGold/50 transition-all duration-300 hover:shadow-luxury"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-ivory-muted">
                    <Link href={`/shop/${product.slug}`} className="block w-full h-full">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 250px, 280px"
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-sand/30 flex items-center justify-center text-zariGold font-serif text-2xl font-bold">
                          TGC
                        </div>
                      )}
                    </Link>

                    {/* Wishlist Button */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <LuxuryHeartButton
                        isLiked={isWishlisted}
                        onToggle={() => toggleWishlist(product.id)}
                        size="sm"
                      />
                    </div>

                    {/* Badges — Strictly On-Brand Palette (Deep Navy / Zari Gold / Rose Gold) */}
                    {isTop3Trending && (
                      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#14172E] text-[#F5E4B8] border border-[#C9A24B]/40 text-[9.5px] font-sans font-extrabold uppercase tracking-wider shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-[#C9A24B] fill-[#C9A24B]/30 stroke-[1.6]" />
                        <span>#{idx + 1} TRENDING</span>
                      </div>
                    )}

                    {isNewItem && (
                      <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-md bg-[#B4863C] text-ivory border border-[#D8BC82]/40 text-[9.5px] font-sans font-extrabold uppercase tracking-widest shadow-xs">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Product Metadata */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-ivory">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.16em] text-zariGold line-clamp-1">
                        {product.category}
                      </span>
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="text-xs sm:text-sm font-sans font-medium text-inkNavy group-hover:text-zariGold transition-colors mt-0.5">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-sm font-sans font-bold text-inkNavy font-tnum">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-xs font-sans text-inkNavy/40 line-through font-normal font-tnum">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
