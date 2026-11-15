'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  WOMEN_CIRCLE_CATEGORIES,
  KIDS_CIRCLE_CATEGORIES,
  CategoryCircleItem,
} from '@/components/home/CircularCategoryScroller';

interface ShopByCategoryCarouselProps {
  filter?: 'all' | 'women' | 'kids';
}

export const ShopByCategoryCarousel: React.FC<ShopByCategoryCarouselProps> = ({
  filter = 'all',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine or filter categories based on the global All / Women / Kids preference
  const categories: CategoryCircleItem[] = React.useMemo(() => {
    if (filter === 'women') {
      return WOMEN_CIRCLE_CATEGORIES;
    }
    if (filter === 'kids') {
      return KIDS_CIRCLE_CATEGORIES;
    }
    // 'all' shows both combined
    return [...WOMEN_CIRCLE_CATEGORIES, ...KIDS_CIRCLE_CATEGORIES];
  }, [filter]);

  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

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
  }, [checkScroll, categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const viewAllHref =
    filter === 'women'
      ? '/shop?target=women'
      : filter === 'kids'
      ? '/shop?target=kids'
      : '/shop';

  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full bg-[#FFFFFF] py-8 md:py-10 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading in existing font (reduced gap by ~30%) */}
        <div className="text-center mb-5 md:mb-8">
          <h2 className="text-[22px] md:text-[28px] font-sans font-semibold tracking-[0.06em] text-[#1C1417]">
            Shop by Category
          </h2>
        </div>

        {/* Carousel Container with Scroll Buttons */}
        <div className="relative group/track">
          {/* Prev Arrow Button (Mobile + Desktop, round with subtle border & shadow) */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className={`absolute left-0 sm:left-1 md:-left-4 lg:-left-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md border border-[#EAE5DE] flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-[#1C1417]" />
          </button>

          {/* Next Arrow Button (Mobile + Desktop, round with subtle border & shadow) */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className={`absolute right-0 sm:right-1 md:-right-4 lg:-right-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-[#1C1417] shadow-md border border-[#EAE5DE] flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-[#1C1417]" />
          </button>

          {/* Carousel Track:
              Desktop: 4 tiles visible at once (w-[calc(25%-18px)] with gap-6)
              Mobile: ~2.3 tiles visible with swipe & scroll-snap-type: x mandatory, hidden scrollbar
          */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-3 md:pt-4 no-scrollbar scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((cat, index) => {
              const href = `/shop?category=${encodeURIComponent(cat.slug)}&target=${cat.group}`;

              return (
                <div
                  key={`${cat.id}-${index}`}
                  className="shrink-0 snap-start select-none w-[calc((100%-20px)/2.3)] sm:w-[calc((100%-36px)/3)] md:w-[calc(25%-18px)] min-w-[130px]"
                >
                  <Link
                    href={href}
                    className="group flex flex-col items-center bg-[#FFFFFF] w-full"
                    aria-label={`Shop ${cat.name}`}
                  >
                    {/* Fixed height image container with models standing on same baseline (object-position: bottom), overflow-visible so head is not clipped on hover */}
                    <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px] flex items-end justify-center bg-[#FFFFFF] overflow-visible">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain object-bottom pt-2 pb-0 px-1 transition-transform duration-200 ease group-hover:-translate-y-1"
                        loading="lazy"
                      />
                    </div>

                    {/* Label below image: bold, uppercase, centered, small letter-spacing, gold underline on hover with 200ms ease */}
                    <div className="mt-3.5 text-center px-1">
                      <span className="inline-block text-xs sm:text-[13px] md:text-sm font-bold uppercase tracking-[0.06em] text-[#1C1417] transition-all duration-200 ease border-b-2 border-transparent group-hover:border-[#C5A059] pb-0.5">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* View All Categories Button: Centered, navy fill, white text (reduced gap by ~30%) */}
        <div className="mt-7 md:mt-8 text-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1E3A] text-white hover:bg-[#121528] text-xs md:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors rounded-none shadow-sm"
          >
            VIEW ALL CATEGORIES
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategoryCarousel;

