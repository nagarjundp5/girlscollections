'use client';

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryCircleItem {
  id: string;
  name: string;
  slug: string;
  group: 'women' | 'kids';
  image: string;
  line1: string;
  line2?: string;
  topOffset?: string;
}

// ─── Curated Category Circles with Cutout Images (Head pops out of circle) ───
export const WOMEN_CIRCLE_CATEGORIES: CategoryCircleItem[] = [
  {
    id: 'a-line-kurta',
    name: 'A-Line Kurta',
    slug: 'a-line-kurta',
    group: 'women',
    image: '/categories/circles/alinekurtawomen.png',
    line1: 'A-LINE',
    line2: 'KURTA',
    topOffset: '8%',
  },
  {
    id: 'two-peice-kurta-set',
    name: '2-Piece Kurta Set',
    slug: 'two-peice-kurta-set',
    group: 'women',
    image: '/categories/circles/twopiecekurtasetwomen.png',
    line1: '2-PIECE',
    line2: 'KURTA SET',
    topOffset: '8%',
  },
  {
    id: 'straight-cut-kurta-suit-sets',
    name: 'Straight Cut Kurta',
    slug: 'straight-cut-kurta-suit-sets',
    group: 'women',
    image: '/categories/circles/straightkurtasetwomen.png',
    line1: 'STRAIGHT',
    line2: 'KURTA SET',
    topOffset: '8%',
  },
  {
    id: 'western-short-kurti-top',
    name: 'Western Short Kurti',
    slug: 'western-short-kurti-top',
    group: 'women',
    image: '/categories/circles/westernshortkurtiwomen.png',
    line1: 'WESTERN',
    line2: 'SHORT KURTI',
    topOffset: '8%',
  },
  {
    id: 'western-short-tops-or-short-kurtis',
    name: 'Short Kurti Sets',
    slug: 'western-short-tops-or-short-kurtis',
    group: 'women',
    image: '/categories/circles/shortkurtisetswomen.png',
    line1: 'SHORT KURTI',
    line2: 'SETS',
    topOffset: '8%',
  },
  {
    id: 'lehenga-blouse-pattu-pavadai-women',
    name: 'Langa Blouse',
    slug: 'lehenga-blouse-pattu-pavadai',
    group: 'women',
    image: '/categories/circles/landablousewomen.png',
    line1: 'LANGA',
    line2: 'BLOUSE',
    topOffset: '8%',
  },
  {
    id: 'all-kurta-sets',
    name: 'All Kurta Sets',
    slug: 'all-kurta-sets',
    group: 'women',
    image: '/categories/cutouts/all-kurta-sets.webp',
    line1: 'KURTA',
    line2: 'SETS',
    topOffset: '7.7%',
  },
  {
    id: 'anarkali-kurta-suit-sets',
    name: 'Anarkali Suit Sets',
    slug: 'anarkali-kurta-suit-sets',
    group: 'women',
    image: '/categories/cutouts/anarkali-kurta-suit-sets.webp',
    line1: 'ANARKALI',
    line2: 'SUIT SETS',
    topOffset: '7.7%',
  },
  {
    id: 'co-ord-set',
    name: 'Co-ord Set',
    slug: 'co-ord-set',
    group: 'women',
    image: '/categories/cutouts/co-ord-set.webp',
    line1: 'CO-ORD',
    line2: 'SETS',
    topOffset: '7.7%',
  },
  {
    id: 'skirt-and-top',
    name: 'Skirt and Top',
    slug: 'skirt-and-top',
    group: 'women',
    image: '/categories/cutouts/skirt-and-top.webp',
    line1: 'SKIRT &',
    line2: 'TOP',
    topOffset: '7.7%',
  },
];

export const KIDS_CIRCLE_CATEGORIES: CategoryCircleItem[] = [
  {
    id: 'kids-lehenga-blouse-pattu-pavadai',
    name: 'Langa Blouse / Pattu Pavadai',
    slug: 'lehenga-blouse-pattu-pavadai',
    group: 'kids',
    image: '/categories/circles/langablousekids.png',
    line1: 'LEHENGA &',
    line2: 'PATTU',
    topOffset: '8%',
  },
  {
    id: 'kids-cotton-daily-frock',
    name: 'Cotton Daily Frock',
    slug: 'kids-cotton-daily-frock',
    group: 'kids',
    image: '/categories/circles/cottonfrockkids.png',
    line1: 'COTTON',
    line2: 'FROCKS',
    topOffset: '8%',
  },
  {
    id: 'children-saree',
    name: 'Children Saree',
    slug: 'children-saree',
    group: 'kids',
    image: '/categories/circles/sareechildrenskids.png',
    line1: 'CHILDREN',
    line2: 'SAREE',
    topOffset: '8%',
  },
  {
    id: 'kids-sharara-set',
    name: 'Sharara Set',
    slug: 'kids-sharara-set',
    group: 'kids',
    image: '/categories/circles/shararasetkids.png',
    line1: 'SHARARA',
    line2: 'SET',
    topOffset: '8%',
  },
  {
    id: 'western-bodycon',
    name: 'Western Bodycon',
    slug: 'western-bodycon',
    group: 'kids',
    image: '/categories/circles/westernbodyconekids.png',
    line1: 'WESTERN',
    line2: 'BODYCON',
    topOffset: '8%',
  },
  {
    id: 'kids-traditional-gown-1-pc',
    name: 'Traditional Gowns',
    slug: 'kids-traditional-gown-1-pc',
    group: 'kids',
    image: '/categories/cutouts/kids-traditional-gown-1-pc.webp',
    line1: 'TRADITIONAL',
    line2: 'GOWNS',
    topOffset: '7.7%',
  },
  {
    id: 'party-wear-frocks',
    name: 'Party Wear Frocks',
    slug: 'kids-party-wear-frock',
    group: 'kids',
    image: '/categories/cutouts/party-wear-frocks.webp',
    line1: 'PARTY WEAR',
    line2: 'FROCKS',
    topOffset: '7.7%',
  },
  {
    id: 'children-co-ord-set',
    name: 'Children Co-ord Set',
    slug: 'children-co-ord-set',
    group: 'kids',
    image: '/categories/cutouts/children-co-ord-set.webp',
    line1: 'KIDS CO-ORD',
    line2: 'SETS',
    topOffset: '7.7%',
  },
];

// ─── Category Circle with 3D Head Pop-Out Effect ─────────────────────────────
const CategoryCircle: React.FC<{ category: CategoryCircleItem }> = ({ category }) => {
  const href = `/shop?category=${encodeURIComponent(category.slug)}&target=${category.group}`;
  const topOffset = category.topOffset || '8%';

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center flex-[0_0_auto] snap-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[#B8924A] transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02] pt-4 w-[100px] sm:w-[116px] md:w-[124px]"
      aria-label={`Shop ${category.name}`}
    >
      {/* ── Outer ring ── */}
      <div className="relative p-[2.5px] rounded-full border border-[#B8924A]/30 group-hover:border-[#B8924A] transition-colors bg-[#FAF6EE] shadow-xs shrink-0 w-[100px] h-[100px] sm:w-[116px] sm:h-[116px] md:w-[124px] md:h-[124px]">

        {/* ── Inner circle: warm ivory background ── */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[#B8924A]/20"
          style={{
            background: 'radial-gradient(circle at 45% 35%, #FFFFFF 0%, #FAF6EE 65%, #F0E8D8 100%)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* Subtle concentric gold accent ring */}
          <div className="absolute inset-0 rounded-full border border-[#B8924A]/10 scale-[0.84] pointer-events-none" />

          {!category.image && (
            <span className="font-serif text-lg sm:text-xl font-normal text-[#B8924A]">
              {category.name.charAt(0)}
            </span>
          )}
        </div>

        {/* ── Pop-out Cutout: Head sticks out of top, bottom clipped by circle rim ── */}
        {category.image && (
          <div
            className="absolute -top-3.5 sm:-top-4.5 left-[2.5px] right-[2.5px] bottom-[2.5px] overflow-hidden pointer-events-none z-10 rounded-b-full"
            style={{
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              isolation: 'isolate',
              transform: 'translateZ(0)',
            }}
            aria-hidden="true"
          >
            <div
              className="absolute left-0 w-full h-[122%]"
              style={{ top: `calc(8px - ${topOffset})` }}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 110px, (max-width: 1024px) 124px, 130px"
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-105"
                priority={false}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Label below circle: 13px, max 2 lines, centered, fixed 36px height ── */}
      <div className="mt-2 flex flex-col items-center justify-center text-center w-[100px] sm:w-[116px] md:w-[124px] h-[36px] overflow-hidden">
        <span className="font-sans text-[13px] font-semibold tracking-[0.04em] uppercase text-[#1A1A2E] group-hover:text-[#B8924A] transition-colors line-clamp-2 text-center leading-[1.2] px-0.5">
          {category.line1}{category.line2 ? ` ${category.line2}` : ''}
        </span>
      </div>
    </Link>
  );
};

// ─── "Explore All" circle ────────────────────────────────────────────────────
const ShopMoreCircle: React.FC<{ target: 'women' | 'kids' }> = ({ target }) => {
  const handleOpenGroupMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-category-menu'));
    }
  };

  return (
    <button
      onClick={handleOpenGroupMenu}
      className="group relative flex flex-col items-center flex-[0_0_auto] snap-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[#B8924A] transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02] cursor-pointer pt-4 w-[100px] sm:w-[116px] md:w-[124px]"
      aria-label={`Explore all ${target} categories`}
    >
      <div className="relative p-[2.5px] rounded-full border border-[#B8924A]/40 group-hover:border-[#B8924A] transition-colors bg-[#FAF6EE] shadow-xs shrink-0 w-[100px] h-[100px] sm:w-[116px] sm:h-[116px] md:w-[124px] md:h-[124px]">
        <div
          className="relative w-full h-full rounded-full overflow-hidden bg-[#1A1E3A] flex flex-col items-center justify-center text-white shrink-0 border border-[#B8924A]/30 transition-colors"
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

      <div className="mt-2 flex flex-col items-center justify-center text-center w-[100px] sm:w-[116px] md:w-[124px] h-[36px] overflow-hidden">
        <span className="font-sans text-[13px] font-semibold tracking-[0.04em] uppercase text-[#B8924A] group-hover:text-[#1A1E3A] transition-colors line-clamp-2 text-center leading-[1.2]">
          SEE ALL
        </span>
      </div>
    </button>
  );
};

// ─── Main Scroller with Separate Women & Kids Tabs ───────────────────────────
interface CircularCategoryScrollerProps {
  filter?: 'all' | 'women' | 'kids';
}

export const CircularCategoryScroller: React.FC<CircularCategoryScrollerProps> = ({ filter = 'all' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Active division directly driven by filter (or preference)
  const activeDivision = filter === 'kids' ? 'kids' : 'women';

  const displayedCategories = useMemo(() => {
    return activeDivision === 'kids' ? KIDS_CIRCLE_CATEGORIES : WOMEN_CIRCLE_CATEGORIES;
  }, [activeDivision]);

  // Check scroll bounds
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

  // Reset scroll on division change
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeDivision]);

  const scrollPage = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.85) : el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="Categories"
      className="relative w-full bg-[#FAF6EE] border-b border-[#1A1E3A]/8 select-none"
      style={{
        paddingTop: 'clamp(28px, 4vw, 42px)',
        paddingBottom: '20px',
        overflow: 'visible',
      }}
    >
      <div className="max-w-[1440px] mx-auto relative px-0">
        {/* ── Prev Arrow Button (32px, vertically centred on circles, hidden at start) ── */}
        <div
          className={`absolute left-1 sm:left-2 lg:left-3 z-20 transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ top: '66px', transform: 'translateY(-50%)' }}
        >
          <button
            type="button"
            onClick={() => scrollPage('left')}
            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-white border border-[#E2D8CC] shadow-md hover:shadow-lg flex items-center justify-center text-[#1C1417] transition-all cursor-pointer focus:outline-none"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* ── Next Arrow Button (32px, vertically centred on circles, hidden at end) ── */}
        <div
          className={`absolute right-1 sm:right-2 lg:right-3 z-20 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ top: '66px', transform: 'translateY(-50%)' }}
        >
          <button
            type="button"
            onClick={() => scrollPage('right')}
            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-white border border-[#E2D8CC] shadow-md hover:shadow-lg flex items-center justify-center text-[#1C1417] transition-all cursor-pointer focus:outline-none"
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* ── Scroll Track: 40px mobile padding, 56px desktop padding, 16px gap, snap-center ── */}
        <div
          ref={scrollRef}
          className="flex items-start gap-4 snap-x snap-mandatory no-scrollbar scroll-smooth overflow-x-auto overflow-y-visible px-10 lg:px-14"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
        >
          {displayedCategories.map((cat: CategoryCircleItem) => (
            <CategoryCircle key={cat.id} category={cat} />
          ))}
          <ShopMoreCircle target={activeDivision} />
        </div>
      </div>
    </section>
  );
};

export default CircularCategoryScroller;
