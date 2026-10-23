'use client';

/**
 * SHAPE RULE GUIDELINE:
 * - CIRCLES = Category / discovery navigation (e.g. CircularCategoryScroller)
 * - ARCHES = Heritage / editorial storytelling sections (e.g. Arch Collection Showcase)
 * - RECTANGLES = Product / shopping grids (e.g. ProductRail, ProductGrid)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

export interface CategoryArchItem {
  id: string;
  group: 'women' | 'kids';
  name: string;
  eyebrow: string;
  description: string;
  slug: string;
  image: string;
}

const ALL_ARCH_ITEMS: CategoryArchItem[] = [
  {
    id: 'w-1',
    group: 'women',
    name: 'Anarkali Suit Sets',
    eyebrow: 'ROYAL HERITAGE',
    description: 'Flared royal silk Anarkalis featuring hand-embroidered zari dupattas.',
    slug: 'anarkali-kurta-suit-sets',
    image: '/categories/anarkali-kurta-suit-sets.webp',
  },
  {
    id: 'k-1',
    group: 'kids',
    name: 'Silk Pattu Pavadai',
    eyebrow: 'LITTLE ROYALTY',
    description: 'Traditional Kanjeevaram pure silk drapes for young girls.',
    slug: 'kids-lehenga-blouse-or-pattu-pavadai',
    image: '/categories/kids-lehenga-blouse-or-pattu-pavadai.webp',
  },
  {
    id: 'w-2',
    group: 'women',
    name: 'Kurta Ensembles',
    eyebrow: 'WOMEN EDIT',
    description: 'Contemporary & classic straight-cut suit sets for celebrations.',
    slug: 'all-kurta-sets',
    image: '/categories/all-kurta-sets.webp',
  },
  {
    id: 'k-2',
    group: 'kids',
    name: 'Party Wear Frocks',
    eyebrow: 'CELEBRATION FROCKS',
    description: 'Layered tulle & organza birthday frocks tailored for young girls.',
    slug: 'party-wear-frocks',
    image: '/categories/party-wear-frocks.webp',
  },
  {
    id: 'w-3',
    group: 'women',
    name: 'Co-ord Sets & Tunics',
    eyebrow: 'CONTEMPORARY FESTIVE',
    description: 'Matching silk & chanderi tunic and trouser duos.',
    slug: 'co-ord-set',
    image: '/categories/co-ord-set.webp',
  },
  {
    id: 'k-3',
    group: 'kids',
    name: 'Traditional Gowns',
    eyebrow: 'FESTIVE GOWNS',
    description: 'Single-piece traditional ethnic gowns tailored for young royalty.',
    slug: 'kids-traditional-gown-1-pc',
    image: '/categories/kids-traditional-gown-1-pc.webp',
  },
  {
    id: 'w-4',
    group: 'women',
    name: 'Skirt & Crop Top Sets',
    eyebrow: 'TWIRL EDIT',
    description: 'Twirl-worthy skirts paired with rich zardosi embroidered tops.',
    slug: 'skirt-and-top',
    image: '/categories/skirt-and-top.webp',
  },
  {
    id: 'k-4',
    group: 'kids',
    name: 'Children Co-ord Sets',
    eyebrow: 'PLAYFUL WEAR',
    description: 'Matching printed & solid kids co-ord tunic sets.',
    slug: 'children-co-ord-set',
    image: '/categories/children-co-ord-set.webp',
  },
];

interface ShopByCategoryBentoProps {
  filter?: 'all' | 'women' | 'kids';
}

export const ShopByCategoryBento: React.FC<ShopByCategoryBentoProps> = ({ filter = 'all' }) => {
  const categoryItems = useMemo(() => {
    if (filter === 'all') return ALL_ARCH_ITEMS;
    return ALL_ARCH_ITEMS.filter((item) => item.group === filter);
  }, [filter]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  const sectionRef = useRef<HTMLElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const totalCards = categoryItems.length;

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  // Autoplay for Desktop coverflow
  useEffect(() => {
    if (!isAutoplayActive || prefersReducedMotion || totalCards <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoplayActive, prefersReducedMotion, totalCards]);

  const animateDesktopCoverflow = useCallback((customDuration?: number) => {
    const duration = customDuration ?? 0.55;

    desktopCardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;

      let relativeIndex = idx - activeIndex;
      if (relativeIndex > totalCards / 2) relativeIndex -= totalCards;
      if (relativeIndex < -totalCards / 2) relativeIndex += totalCards;

      gsap.killTweensOf(cardEl);

      if (relativeIndex === 0) {
        gsap.to(cardEl, {
          scale: 1.05,
          opacity: 1,
          x: 0,
          y: 0,
          zIndex: 40,
          duration,
          ease: 'power3.out',
          force3D: true,
        });
      } else if (Math.abs(relativeIndex) === 1) {
        const sign = relativeIndex > 0 ? 1 : -1;
        gsap.to(cardEl, {
          scale: 0.92,
          opacity: 0.75,
          x: sign * 260,
          y: 0,
          zIndex: 25,
          duration,
          ease: 'power3.out',
          force3D: true,
        });
      } else if (Math.abs(relativeIndex) === 2) {
        const sign = relativeIndex > 0 ? 1 : -1;
        gsap.to(cardEl, {
          scale: 0.82,
          opacity: 0.4,
          x: sign * 460,
          y: 0,
          zIndex: 10,
          duration,
          ease: 'power3.out',
          force3D: true,
        });
      } else {
        const sign = relativeIndex > 0 ? 1 : -1;
        gsap.to(cardEl, {
          scale: 0.72,
          opacity: 0,
          x: sign * 600,
          y: 0,
          zIndex: 0,
          duration,
          ease: 'power3.out',
          force3D: true,
        });
      }
    });
  }, [activeIndex, totalCards]);

  useEffect(() => {
    animateDesktopCoverflow();
  }, [activeIndex, animateDesktopCoverflow]);

  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, clientWidth } = mobileScrollRef.current;
    const newIdx = Math.round(scrollLeft / (clientWidth * 0.82));
    if (newIdx >= 0 && newIdx < totalCards && newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  const formattedCounter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
  const currentActiveItem = categoryItems[activeIndex] || categoryItems[0];

  return (
    <section
      ref={sectionRef}
      id="arch-collection-section"
      className="w-full py-8 sm:py-14 pb-20 sm:pb-16 bg-ivory border-b border-zariGold/15 overflow-hidden relative select-none"
      onMouseEnter={() => setIsAutoplayActive(false)}
      onMouseLeave={() => setIsAutoplayActive(true)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-10 border-b border-zariGold/15 pb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-zariGold" />
              <span className="text-[11px] sm:text-xs font-sans font-bold tracking-[0.22em] uppercase text-zariGold">
                {filter === 'women'
                  ? "WOMEN'S HERITAGE SHOWCASE"
                  : filter === 'kids'
                  ? 'LITTLE ROYALTY SHOWCASE'
                  : 'HERITAGE ARCH SHOWCASE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-inkNavy font-bold tracking-tight leading-[1.1]">
              The Arch Collection
            </h2>
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="w-10 h-10 rounded-full border border-zariGold/40 hover:border-zariGold hover:bg-zariGold hover:text-white flex items-center justify-center text-inkNavy transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zariGold"
              aria-label="Previous Arch Collection item"
            >
              <ChevronLeft className="w-5 h-5 text-zariGold hover:text-white" />
            </button>
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full border border-zariGold/40 hover:border-zariGold hover:bg-zariGold hover:text-white flex items-center justify-center text-inkNavy transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zariGold"
              aria-label="Next Arch Collection item"
            >
              <ChevronRight className="w-5 h-5 text-zariGold hover:text-white" />
            </button>
          </div>
        </div>

        {/* Arch Showcase Track */}
        <div>
          
          {/* MOBILE CAROUSEL WITH 14-20% PEEK + CARD-ANCHORED COUNTER + TEMPLE ARCH SILHOUETTE MASK */}
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="flex md:hidden items-stretch gap-3.5 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
          >
            {categoryItems.map((item, idx) => {
              const href = `/shop?category=${item.slug}&target=${item.group}`;
              const cardCounter = `${String(idx + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;

              return (
                <div
                  key={item.id}
                  className="shrink-0 snap-start w-[74vw] max-w-[285px] cursor-pointer flex flex-col"
                >
                  <Link href={href} className="block w-full h-full relative group/archMobile flex flex-col">
                    {/* Arch Photo Frame — True Temple Arch Masking with border directly hugging photo silhouette */}
                    <div className="relative w-full aspect-[4/5] rounded-t-full border-2 border-zariGold/40 bg-inkNavy overflow-hidden shadow-md">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="285px"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover/archMobile:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-inkNavy/70 via-transparent to-transparent" />

                      {/* Card-Anchored Counter Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-inkNavy/85 backdrop-blur-md border border-zariGold/50 font-serif font-bold text-[10px] text-zariGold tracking-widest font-tnum shadow-sm">
                          {cardCounter}
                        </span>
                      </div>
                    </div>

                    {/* Card Text Box — Anchored directly to card */}
                    <div className="p-3.5 bg-ivory border-2 border-t-0 border-zariGold/40 rounded-b-2xl flex flex-col justify-between flex-1 min-h-[92px]">
                      <div>
                        <span className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-zariGold block">
                          {item.eyebrow}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-inkNavy truncate mt-0.5">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] font-sans font-extrabold text-zariGold uppercase tracking-widest pt-2 border-t border-zariGold/15 mt-2">
                        <span>EXPLORE CATEGORY</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/archMobile:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* DESKTOP 3D COVERFLOW SHOWCASE */}
          <div className="hidden md:flex relative h-[500px] lg:h-[540px] w-full items-center justify-center overflow-hidden">
            {categoryItems.map((item, idx) => {
              const isActive = idx === activeIndex;
              const href = `/shop?category=${item.slug}&target=${item.group}`;
              const cardCounter = `${String(idx + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;

              return (
                <div
                  key={item.id}
                  ref={(el) => { desktopCardRefs.current[idx] = el; }}
                  onClick={() => {
                    if (!isActive) setActiveIndex(idx);
                  }}
                  className="absolute w-[300px] lg:w-[340px] h-[460px] lg:h-[500px] cursor-pointer transition-all duration-300 flex flex-col"
                >
                  <Link href={href} className="block w-full h-full relative group/archDesktop flex flex-col">
                    {/* Arch Photo Frame */}
                    <div className="relative w-full h-[360px] lg:h-[390px] rounded-t-full border-2 border-zariGold/40 bg-inkNavy overflow-hidden shadow-2xl">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 1024px) 300px, 340px"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover/archDesktop:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-inkNavy/70 via-transparent to-transparent" />

                      {/* Card-Anchored Counter Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 rounded-full bg-inkNavy/85 backdrop-blur-md border border-zariGold/50 font-serif font-bold text-xs text-zariGold tracking-widest font-tnum shadow-sm">
                          {cardCounter}
                        </span>
                      </div>
                    </div>

                    {/* Card Text Box */}
                    <div className="p-4 bg-ivory border-2 border-t-0 border-zariGold/40 rounded-b-3xl flex flex-col justify-between h-[100px] lg:h-[110px]">
                      <div>
                        <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-zariGold block">
                          {item.eyebrow}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-inkNavy truncate mt-0.5">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs font-sans font-bold text-zariGold uppercase tracking-widest pt-1">
                        <span>EXPLORE CATEGORY</span>
                        <ArrowRight className="w-4 h-4 group-hover/archDesktop:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Active Category Description Panel */}
          {currentActiveItem && (
            <div className="mt-6 sm:mt-8 max-w-xl mx-auto text-center px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentActiveItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-2"
                >
                  <p className="text-xs sm:text-sm font-sans font-medium text-inkNavy/80 leading-relaxed">
                    {currentActiveItem.description}
                  </p>
                  <Link
                    href={`/shop?category=${currentActiveItem.slug}&target=${currentActiveItem.group}`}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-extrabold tracking-widest text-zariGold hover:text-inkNavy uppercase transition-colors pt-1 min-h-[44px]"
                  >
                    <span>SHOP ALL {currentActiveItem.name.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ShopByCategoryBento;
