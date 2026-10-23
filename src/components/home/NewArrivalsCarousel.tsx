'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/data/shopData';
import { ProductCard } from '../ProductCard';

export const NewArrivalsCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const newProducts = MOCK_PRODUCTS.filter((p) => p.isNew || p.isBestSeller).slice(0, 8);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollPosition = el.scrollLeft;
      const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 260;
      const newIndex = Math.round(scrollPosition / cardWidth);
      if (newIndex >= 0 && newIndex < newProducts.length) {
        setActiveIndex(newIndex);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [newProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="new-arrivals"
      className="py-8 sm:py-12 md:py-16 bg-ivory text-inkNavy border-b border-zariGold/15 relative overflow-hidden select-none"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Left-Aligned Bold Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 pb-4 border-b border-zariGold/20 gap-4">
          <div>
            <span className="eyebrow-text text-zariGold font-semibold text-xs sm:text-sm tracking-[0.25em] block mb-1">
              WEEKLY HIGHLIGHTS
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-inkNavy tracking-tight leading-none">
              Trending This Week
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-inkNavy/80 font-sans font-semibold max-w-md">
            Hand-curated festive drapes and silk ensembles selected by our lead couturier.
          </p>
        </div>

        {/* Carousel Container with Arrow Controls */}
        <div className="relative group/trendingScroll">
          {/* Desktop Slider Arrows */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3 lg:-left-5 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-inkNavy text-ivory border border-zariGold/40 shadow-2xl items-center justify-center hover:bg-zariGold hover:text-inkNavy transition-all duration-300"
            aria-label="Scroll trending left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3 lg:-right-5 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-inkNavy text-ivory border border-zariGold/40 shadow-2xl items-center justify-center hover:bg-zariGold hover:text-inkNavy transition-all duration-300"
            aria-label="Scroll trending right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Product Slider with Scroll-Snap-Center and Active Card Parallax Focus */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 px-1 -mx-1"
          >
            {newProducts.map((product, idx) => {
              const isCentered = idx === activeIndex;
              return (
                <div
                  key={product.id}
                  className={`snap-center shrink-0 w-[78vw] sm:w-[260px] md:w-[calc((100%-36px)/3.2)] lg:w-[calc((100%-48px)/3.25)] min-w-[220px] transition-all duration-300 ease-out ${
                    isCentered
                      ? 'scale-100 opacity-100'
                      : 'scale-[0.96] opacity-85 sm:scale-100 sm:opacity-100'
                  }`}
                >
                  <ProductCard product={product} priorityImage={idx < 2} variant="grid" />
                </div>
              );
            })}
          </div>
        </div>

        {/* View Complete Collection CTA Button */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Link
            href="/shop?sort=newest"
            className="px-10 py-4 bg-inkNavy hover:bg-zariGold text-ivory font-sans font-bold text-xs uppercase tracking-[0.2em] shadow-md transition-all duration-300 active:scale-95 inline-flex items-center space-x-3 group rounded-[2px]"
          >
            <span>View Complete Collection</span>
            <ArrowRight className="w-4 h-4 text-ivory group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsCarousel;
