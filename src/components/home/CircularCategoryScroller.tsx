'use client';

import React, { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CategoryItem,
  WOMEN_CATEGORIES,
  KIDS_CATEGORIES,
  getFeaturedCategories,
  getCategoryHref,
} from '@/data/categoryTaxonomy';

const MOBILE_CATEGORY_CONFIG: Record<
  string,
  { line1: string; line2?: string; objectPos?: string; topOffset?: string }
> = {
  'all-kurta-sets': { line1: 'KURTA', line2: 'SETS', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'anarkali-kurta-suit-sets': { line1: 'ANARKALI', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'co-ord-set': { line1: 'CO-ORD', line2: 'SETS', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'skirt-and-top': { line1: 'SKIRT &', line2: 'TOP', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'kids-lehenga-blouse-or-pattu-pavadai': { line1: 'LEHENGA', line2: '& PATTU', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'kids-traditional-gown-1-pc': { line1: 'TRADITIONAL', line2: 'GOWNS', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'party-wear-frocks': { line1: 'PARTY WEAR', line2: 'FROCKS', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
  'children-co-ord-set': { line1: 'KIDS CO-ORD', line2: 'SETS', objectPos: 'object-[center_-2%]', topOffset: '7.7%' },
};

interface CategoryCircleProps {
  category: CategoryItem;
}

const CategoryCircle: React.FC<CategoryCircleProps> = ({ category }) => {
  const href = getCategoryHref(category);
  const config = MOBILE_CATEGORY_CONFIG[category.id] || {
    line1: category.name.toUpperCase(),
    topOffset: '7.7%',
  };
  const cutoutPath = `/categories/cutouts/${category.slug}.webp`;
  const topOffset = config.topOffset || '7.7%';

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center shrink-0 snap-start select-none outline-none focus-visible:ring-2 focus-visible:ring-[#B8924A] rounded-full transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02] pt-3"
      aria-label={`Shop ${category.name}`}
    >
      {/* BASE CIRCLE WRAPPER WITH REFINED GOLD ACCENT */}
      <div className="relative p-[2.5px] rounded-full border border-[#B8924A]/30 group-hover:border-[#B8924A] transition-colors bg-[#FAF6EE] shadow-xs shrink-0">
        
        {/* INNER WARM IVORY CIRCLE (REPLACED PINK GRADIENT) WITH WEBKIT CLIP FIX */}
        <div
          className="relative w-[100px] h-[100px] xs:w-[110px] xs:h-[110px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[#B8924A]/20"
          style={{
            background: 'radial-gradient(circle at 45% 35%, #FFFFFF 0%, #FAF6EE 65%, #F0E8D8 100%)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* Subtle Concentric Gold Accent Ring */}
          <div className="absolute inset-0 rounded-full border border-[#B8924A]/10 scale-[0.84] pointer-events-none" />

          {!category.image && (
            <span className="font-serif text-lg sm:text-xl font-normal text-[#B8924A]">
              {category.name.charAt(0)}
            </span>
          )}
        </div>

        {/* SINGLE POPPING MODEL IMAGE OVERLAY WITH SAFARI WEBKIT CLIPPING FIX */}
        {category.image && (
          <div
            className="absolute -top-3 sm:-top-4 left-[2.5px] right-[2.5px] bottom-[2.5px] overflow-hidden pointer-events-none z-10 rounded-b-full"
            style={{
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              isolation: 'isolate',
              transform: 'translateZ(0)',
            }}
            aria-hidden="true"
          >
            <div
              className="absolute left-0 w-full aspect-[339/484]"
              style={{ top: `calc(12px - ${topOffset})` }}
            >
              <Image
                src={cutoutPath}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 110px, (max-width: 1024px) 120px, 130px"
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* TYPOGRAPHY LABEL */}
      <div className="mt-2 flex flex-col items-center justify-start text-center w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] min-h-[2.4em] overflow-hidden leading-[1.2]">
        <span className="font-sans text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase text-[#1A1A2E] group-hover:text-[#B8924A] transition-colors truncate w-full">
          {config.line1}
        </span>
        {config.line2 && (
          <span className="font-sans text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase text-[#1A1A2E] group-hover:text-[#B8924A] transition-colors truncate w-full">
            {config.line2}
          </span>
        )}
      </div>
    </Link>
  );
};

interface ShopMoreCircleProps {
  total: number;
}

const ShopMoreCircle: React.FC<ShopMoreCircleProps> = ({ total }) => {
  const handleOpenGroupMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-category-menu'));
    }
  };

  return (
    <button
      onClick={handleOpenGroupMenu}
      className="group relative flex flex-col items-center shrink-0 snap-start select-none outline-none focus-visible:ring-2 focus-visible:ring-[#B8924A] rounded-full transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02] cursor-pointer pt-3 min-h-[44px]"
      aria-label={`Shop more categories (${total} total)`}
    >
      <div className="relative p-[2.5px] rounded-full border border-[#B8924A]/40 group-hover:border-[#B8924A] transition-colors bg-[#FAF6EE] shadow-xs shrink-0">
        <div
          className="relative w-[100px] h-[100px] xs:w-[110px] xs:h-[110px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-[#1A1E3A] flex flex-col items-center justify-center text-white shrink-0 border border-[#B8924A]/30 transition-colors"
          style={{
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-[#B8924A]/40 flex items-center justify-center mb-1 group-hover:bg-[#B8924A] transition-colors duration-200">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF6EE] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <span className="font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[#FAF6EE] leading-tight">
            EXPLORE
          </span>
          <span className="font-serif text-xs sm:text-sm font-normal tracking-[0.12em] uppercase text-[#B8924A] leading-tight">
            ALL
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center justify-start text-center w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] min-h-[2.4em] overflow-hidden leading-[1.2]">
        <span className="font-sans text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase text-[#B8924A] group-hover:text-[#1A1E3A] transition-colors truncate w-full">
          SEE ALL ({total})
        </span>
      </div>
    </button>
  );
};

interface CircularCategoryScrollerProps {
  filter?: 'all' | 'women' | 'kids';
}

export const CircularCategoryScroller: React.FC<CircularCategoryScrollerProps> = ({ filter = 'all' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const womenFeatured = getFeaturedCategories('women');
  const kidsFeatured = getFeaturedCategories('kids');

  const displayedCategories = useMemo(() => {
    if (filter === 'women') return womenFeatured;
    if (filter === 'kids') return kidsFeatured;
    return [...womenFeatured, ...kidsFeatured];
  }, [filter, womenFeatured, kidsFeatured]);

  const totalCount = useMemo(() => {
    if (filter === 'women') return WOMEN_CATEGORIES.length;
    if (filter === 'kids') return KIDS_CATEGORIES.length;
    return WOMEN_CATEGORIES.length + KIDS_CATEGORIES.length;
  }, [filter]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll > 0) {
      setScrollProgress(scrollLeft / totalScroll);
    }
  };

  const scrollRail = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full bg-[#FAF6EE] pt-5 pb-7 sm:pt-8 sm:pb-10 border-b border-[#1A1E3A]/8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* EDITORIAL HEADER ROW */}
        <div className="flex items-end justify-between mb-5 border-b border-[#1A1E3A]/8 pb-3">
          <div>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-[#B8924A] block mb-1">
              CURATED EDITS
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A1E3A] font-normal tracking-tight leading-tight m-0">
              {filter === 'women'
                ? "Women's Collection"
                : filter === 'kids'
                ? "Girls & Kids Collection"
                : 'Explore by Category'}
            </h2>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollRail('left')}
              className="w-8 h-8 rounded-full border border-[#1A1E3A]/15 hover:border-[#B8924A] hover:bg-[#B8924A]/10 flex items-center justify-center text-[#1A1E3A] transition-colors cursor-pointer focus:outline-none"
              aria-label="Scroll left categories"
            >
              <ChevronLeft className="w-4 h-4 text-[#1A1E3A]" />
            </button>
            <button
              onClick={() => scrollRail('right')}
              className="w-8 h-8 rounded-full border border-[#1A1E3A]/15 hover:border-[#B8924A] hover:bg-[#B8924A]/10 flex items-center justify-center text-[#1A1E3A] transition-colors cursor-pointer focus:outline-none"
              aria-label="Scroll right categories"
            >
              <ChevronRight className="w-4 h-4 text-[#1A1E3A]" />
            </button>
          </div>
        </div>

        {/* PROMINENT CIRCULAR CATEGORY ROW */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-start gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
        >
          {displayedCategories.map((cat) => (
            <CategoryCircle key={cat.id} category={cat} />
          ))}

          {/* SHOP MORE CIRCLE AT THE END */}
          <ShopMoreCircle total={totalCount} />
        </div>

        {/* DASH SCROLL PROGRESS INDICATOR */}
        <div className="w-full max-w-[120px] mx-auto mt-2 h-0.5 bg-[#1A1E3A]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B8924A] rounded-full transition-all duration-150"
            style={{ width: `${Math.max(20, Math.min(100, (scrollProgress + 0.2) * 100))}%` }}
          />
        </div>

      </div>
    </section>
  );
};

export default CircularCategoryScroller;
