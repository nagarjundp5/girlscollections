'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/data/shopData';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';

interface ProductRailProps {
  kicker: string;
  title: string;
  subtitle?: string;
  products: Product[];
  actionLabel?: string;
  actionHref?: string;
  showProgressLine?: boolean;
}

export const ProductRail: React.FC<ProductRailProps> = ({
  kicker,
  title,
  subtitle,
  products,
  actionLabel = 'VIEW ALL',
  actionHref = '/shop',
  showProgressLine = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 240;
    const index = Math.round(container.scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.max(0, Math.min(index, products.length - 1)));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formattedCounter = `0${activeIndex + 1} / 0${products.length}`;
  const progressPercent = ((activeIndex + 1) / products.length) * 100;

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 bg-ivory text-inkNavy border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Editorial Section Header */}
        <SectionHeader
          kicker={kicker}
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />

        {/* Counter Above Mobile Rail */}
        <div className="flex md:hidden items-center justify-between mb-3 px-1">
          <span className="font-serif font-semibold text-xs text-zariGold tracking-widest uppercase">
            ATELIER EDIT
          </span>
          <span className="font-serif font-bold text-xs text-inkNavy/70 tracking-widest font-tnum">
            {formattedCounter}
          </span>
        </div>

        {/* Rail Container with Controls */}
        <div className="relative group/railScroll">
          
          {/* Desktop Left/Right Scroll Arrows */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-inkNavy/90 text-ivory border border-zariGold/40 shadow-lg items-center justify-center hover:bg-zariGold hover:text-white transition-all duration-300"
            aria-label="Scroll rail left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-inkNavy/90 text-ivory border border-zariGold/40 shadow-lg items-center justify-center hover:bg-zariGold hover:text-white transition-all duration-300"
            aria-label="Scroll rail right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Scroll Rail (1.15 cards peek on mobile, 4-5 on desktop) */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 px-4 -mx-4 sm:px-0 sm:mx-0"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[82vw] sm:w-[260px] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-72px)/4.25)] h-[400px] sm:h-[440px]"
              >
                <ProductCard product={product} variant="rail" />
              </div>
            ))}
          </div>

          {/* Optional Thin Progress Line (Only for primary 1-2 rails to prevent UI clutter) */}
          {showProgressLine && (
            <div className="w-full md:hidden h-[2px] bg-zariGold/20 mt-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-zariGold transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ProductRail;
