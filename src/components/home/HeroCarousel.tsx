'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DivisionPreference } from '@/lib/preference';
import PreferencePill from './PreferencePill';
import { cl, clBlur } from '@/lib/cloudinary';

// For local /hero/* paths, skip Cloudinary transforms and use the path as-is
const heroSrc = (src: string, _opts?: object) =>
  src.startsWith('/') ? src : cl(src, _opts as any);
const heroBlur = (src: string) =>
  src.startsWith('/') ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : clBlur(src);

export interface Slide {
  id: number;
  group?: 'women' | 'kids';
  image: string;
  mobileImage: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  headline?: string;
  ctaText?: string;
  ctaLink: string;
}

const HERO_SLIDES: Slide[] = [
  // SLIDE 1: Festive Elegance / Courtyard Duo (Women)
  // Desktop: 2172×724 landscape | Mobile: Sunlit Courtyard 1122×1402 portrait
  {
    id: 1,
    group: 'women',
    image: '/hero/hero-new-3.png',
    mobileImage: '/hero/hero-new-8.png',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 2: Diwali Sale Celebration (Family / Festive)
  // Desktop: 2400×960 landscape | Mobile: Diwali Diyas Celebration 819×1024 portrait
  {
    id: 2,
    group: 'women',
    image: '/hero/hero-new-2.webp',
    mobileImage: '/hero/diwali-mobile.jpg',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 3: Courtyard Laughter & Bridal Celebration (Women)
  // Desktop: 2172×724 landscape | Mobile: Golden Courtyard 1122×1402 portrait
  {
    id: 3,
    group: 'women',
    image: '/hero/hero-new-1.png',
    mobileImage: '/hero/hero-new-4.png',
    objectPosition: 'center top',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 4: Haldi Edit & Mother-Daughter Festive (Women & Kids)
  // Desktop: 2400×960 landscape | Mobile: Mother & Child 819×1024 portrait
  {
    id: 4,
    group: 'women',
    image: '/hero/hero-new-5.webp',
    mobileImage: '/hero/mother-daughter-mobile.jpg',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 5: Joyful Sisters / Festive Girls (Kids / Festive)
  // Desktop: 2172×724 landscape | Mobile: Joyful Girls 1122×1402 portrait
  {
    id: 5,
    group: 'kids',
    image: '/hero/hero-new-7.png',
    mobileImage: '/hero/hero-new-6.png',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=kids',
  },
  // SLIDE 6: Kids Traditional Attire (Kids)
  // Desktop: 2736×912 landscape | Mobile: Three Kids Couch 819×1024 portrait
  {
    id: 6,
    group: 'kids',
    image: '/hero/hero-new-9.jpg',
    mobileImage: '/hero/three-kids-mobile.jpg',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=kids',
  },
  // SLIDE 7: Elegant Silk & Contemporary Edit (Women)
  // Desktop: 2736×912 landscape | Mobile: Matching Portrait 1408×1760
  {
    id: 7,
    group: 'women',
    image: '/hero/hero-new-11.jpg',
    mobileImage: '/hero/hero-new-12.jpg',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 8: Regal Heritage Collection (Women)
  // Desktop: 2736×912 landscape | Mobile: Matching Portrait 1408×1760
  {
    id: 8,
    group: 'women',
    image: '/hero/hero-new-13.jpg',
    mobileImage: '/hero/hero-new-14.jpg',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    ctaLink: '/shop?target=women',
  },
];

interface HeroCarouselProps {
  filter: DivisionPreference;
  onFilterChange: (pref: DivisionPreference) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  filter,
  onFilterChange,
}) => {
  // Infer division from group or link, only count visible slides
  const activeSlides = useMemo(() => {
    if (filter === 'all') return HERO_SLIDES;
    return HERO_SLIDES.filter((s) => {
      const division = s.group || (s.ctaLink.includes('target=women') ? 'women' : s.ctaLink.includes('target=kids') ? 'kids' : undefined);
      return !division || division === filter;
    });
  }, [filter]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Reset to first slide on filter change
  useEffect(() => {
    setCurrentSlide(0);
  }, [filter]);

  // Tab visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 5s autoplay, pause on touch, hover, or hidden tab
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const slide = activeSlides[currentSlide] || activeSlides[0];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  if (!slide) return null;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Showcase"
      className="relative w-full bg-[#FAF8F5] select-none p-0 m-0"
      style={{ height: 'var(--hero-h)' }}
    >
      {/* Full-bleed clickable slide */}
      <Link
        href={slide.ctaLink}
        prefetch={true}
        className="absolute inset-0 z-0 block cursor-pointer w-full h-full overflow-hidden"
        aria-label={slide.headline || 'Explore Collection'}
      >
        <div
          key={slide.id}
          style={{ transition: 'opacity 300ms ease' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Mobile View */}
          <div className="block sm:hidden absolute inset-0 w-full h-full">
            <Image
              src={heroSrc(slide.mobileImage || slide.image, { w: 800, q: 'auto:good' })}
              alt={slide.headline || 'Hero banner'}
              fill
              priority={currentSlide === 0}
              loading={currentSlide === 0 ? 'eager' : 'lazy'}
              fetchPriority={currentSlide === 0 ? 'high' : 'low'}
              placeholder="blur"
              blurDataURL={heroBlur(slide.mobileImage || slide.image)}
              className="object-cover"
              style={{ objectPosition: slide.mobileObjectPosition || 'center' }}
              sizes="100vw"
            />
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block absolute inset-0 w-full h-full">
            <Image
              src={heroSrc(slide.image, { w: 1920, q: 'auto:good' })}
              alt={slide.headline || 'Hero banner'}
              fill
              priority={currentSlide === 0}
              loading={currentSlide === 0 ? 'eager' : 'lazy'}
              fetchPriority={currentSlide === 0 ? 'high' : 'low'}
              placeholder="blur"
              blurDataURL={heroBlur(slide.image)}
              className="object-cover"
              style={{ objectPosition: slide.objectPosition || 'center' }}
              sizes="100vw"
            />
          </div>
        </div>

        {/* Optional Overlay Text Block (rendered only if set) */}
        {(slide.headline || slide.ctaText) && (
          <div className="absolute bottom-16 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-12 pb-4 px-6 sm:px-12 pointer-events-none z-10">
            <div className="max-w-[1440px] mx-auto flex flex-col items-start gap-2">
              {slide.headline && (
                <h2 className="text-xl sm:text-3xl font-serif font-semibold text-white tracking-wide">
                  {slide.headline}
                </h2>
              )}
              {slide.ctaText && (
                <span className="pointer-events-auto inline-flex items-center justify-center px-5 py-2 bg-white text-[#1C1417] text-xs font-sans font-bold tracking-widest uppercase hover:bg-white/90 transition-colors shadow-sm">
                  {slide.ctaText}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Prev/Next Navigation Arrows: Available on BOTH Mobile & Desktop */}
      {activeSlides.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-3 sm:px-6">
          {/* Prev Arrow: 36px on mobile (12px from edge), 44px on desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Next Arrow: 36px on mobile (12px from edge), 44px on desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      )}

      {/* 
        Slide Dots: Small dots placed at bottom-9 (safely above the floating pill at bottom-0)
        Never collides with the pill.
      */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-9 inset-x-0 z-20 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center space-x-2 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className="p-1 cursor-pointer focus:outline-none"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-5 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/80'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Switch Pill: Centred and overlapping bottom edge (half on image, half below) */}
      <PreferencePill
        preference={filter}
        onPreferenceChange={onFilterChange}
      />
    </section>
  );
};

export default HeroCarousel;
