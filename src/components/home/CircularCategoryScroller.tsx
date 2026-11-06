'use client';

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
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

// ─── Label / image config (original design, unchanged) ───────────────────────
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

// ─── Category Circle — ORIGINAL DESIGN (clipped, semi-pop-out) ───────────────
// Identical to the previous implementation: outer ring p-[2.5px], inner
// rounded-full overflow-hidden with radial-gradient background, image that
// pops above the top edge with -top-3/-top-4 and rounded-b-full clip.
const CategoryCircle: React.FC<{ category: CategoryItem }> = ({ category }) => {
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
      {/* ── Outer ring ──────────────────────────────────────────────────── */}
      <div className="relative p-[2.5px] rounded-full border border-[#B8924A]/30 group-hover:border-[#B8924A] transition-colors bg-[#FAF6EE] shadow-xs shrink-0">

        {/* ── Inner circle: warm ivory bg, clips the image ──────────────── */}
        <div
          className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[#B8924A]/20"
          style={{
            background: 'radial-gradient(circle at 45% 35%, #FFFFFF 0%, #FAF6EE 65%, #F0E8D8 100%)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* Subtle concentric accent ring */}
          <div className="absolute inset-0 rounded-full border border-[#B8924A]/10 scale-[0.84] pointer-events-none" />

          {!category.image && (
            <span className="font-serif text-lg sm:text-xl font-normal text-[#B8924A]">
              {category.name.charAt(0)}
            </span>
          )}
        </div>

        {/* ── Pop-out image: head pokes above the circle ────────────────── */}
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
                sizes="(max-width: 640px) 110px, (max-width: 1024px) 130px, 140px"
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105"
                priority={false}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Label ─────────────────────────────────────────────────────────── */}
      <div className="mt-2 flex flex-col items-center justify-start text-center w-[100px] sm:w-[120px] md:w-[130px] min-h-[2.4em] leading-[1.2]">
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

// ─── "Explore All" last circle — ORIGINAL DESIGN ─────────────────────────────
const ShopMoreCircle: React.FC<{ total: number }> = ({ total }) => {
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
          className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-[#1A1E3A] flex flex-col items-center justify-center text-white shrink-0 border border-[#B8924A]/30 transition-colors"
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

      <div className="mt-2 flex flex-col items-center justify-start text-center w-[100px] sm:w-[120px] md:w-[130px] min-h-[2.4em] leading-[1.2]">
        <span className="font-sans text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase text-[#B8924A] group-hover:text-[#1A1E3A] transition-colors truncate w-full">
          SEE ALL ({total})
        </span>
      </div>
    </button>
  );
};

// ─── Main scroller ────────────────────────────────────────────────────────────
interface CircularCategoryScrollerProps {
  filter?: 'all' | 'women' | 'kids';
}

export const CircularCategoryScroller: React.FC<CircularCategoryScrollerProps> = ({ filter = 'all' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const womenFeatured = useMemo(() => getFeaturedCategories('women'), []);
  const kidsFeatured = useMemo(() => getFeaturedCategories('kids'), []);

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

  // rAF-throttled scroll check for showing/hiding prev-next buttons
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { checkScroll(); ticking = false; });
        ticking = true;
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [checkScroll, displayedCategories]);

  // Reset scroll position on filter change
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [filter]);

  const scrollPage = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.85) : el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!displayedCategories || displayedCategories.length === 0) return null;

  return (
    /*
      LAYOUT (changed):
      - No heading / eyebrow / divider / progress bar above the circles.
      - padding-top reserves room for the pill's lower half (22px) + head overhang (~16px) = 38px min.
      - overflow: visible on the section so heads protrude upward without clipping.
      - 1px hairline border-b below; next section (Trending py-10/py-16) handles its own gap.
    */
    <section
      aria-label="Categories"
      className="relative w-full bg-[#FAF6EE] border-b border-[#1A1E3A]/8 select-none"
      style={{
        paddingTop: 'clamp(38px, 5vw, 52px)',
        paddingBottom: '20px',
        overflow: 'visible',         /* heads protrude above */
      }}
    >
      {/* Max-width wrapper — position:relative for floating buttons */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative">

        {/*
          PREV BUTTON (Taruni style):
          White, 1px border, shadow, 32px mobile / 40px desktop.
          44px min touch target. Vertically centred on the circle bodies.
          Hidden when already at start.
        */}
        <div
          className={`absolute left-0 z-20 transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ top: 'clamp(50px, 60px, 75px)', transform: 'translateY(-50%)' }}
        >
          <button
            type="button"
            onClick={() => scrollPage('left')}
            className="w-8 h-8 lg:w-10 lg:h-10 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#E2D8CC] shadow-md hover:shadow-lg flex items-center justify-center text-[#1C1417] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
          </button>
        </div>

        {/*
          NEXT BUTTON (Taruni style):
          Same spec as prev, hidden when at the end.
        */}
        <div
          className={`absolute right-0 z-20 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ top: 'clamp(50px, 60px, 75px)', transform: 'translateY(-50%)' }}
        >
          <button
            type="button"
            onClick={() => scrollPage('right')}
            className="w-8 h-8 lg:w-10 lg:h-10 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#E2D8CC] shadow-md hover:shadow-lg flex items-center justify-center text-[#1C1417] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
          </button>
        </div>

        {/*
          SCROLL TRACK:
          - overflow-x: auto (horizontal scroll), overflow-y: visible (heads protrude upward).
          - snap-x mandatory, no scrollbar.
          - Desktop: justify-center so circles are centred when they fit.
          - Mobile: left-aligned, 3.5 circles visible with snap.
          - Horizontal padding matches button width so circles don't hide behind buttons.
        */}
        <div
          ref={scrollRef}
          className="flex items-start gap-4 sm:gap-6 lg:gap-8 snap-x snap-mandatory no-scrollbar scroll-smooth md:justify-center"
          style={{
            overflowX: 'auto',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            paddingLeft: '44px',
            paddingRight: '44px',
          }}
        >
          {displayedCategories.map((cat: CategoryItem) => (
            <CategoryCircle key={cat.id} category={cat} />
          ))}
          <ShopMoreCircle total={totalCount} />
        </div>
      </div>
    </section>
  );
};

export default CircularCategoryScroller;
