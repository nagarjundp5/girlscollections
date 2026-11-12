'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
  eyebrow?: string;
  headline?: string;
  subline?: string;
  ctaLink: string;
}

const HERO_SLIDES: Slide[] = [
  // SLIDE 1: The Twinning Edit (Mother & Daughter / Women)
  // Desktop: 2172×724 landscape | Mobile: Sunlit Courtyard 1122×1402 portrait
  {
    id: 1,
    group: 'women',
    image: '/hero/hero-new-3-d.webp',
    mobileImage: '/hero/hero-new-8-m.webp',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    eyebrow: 'THE TWINNING EDIT',
    headline: 'Moments, Beautifully *Matched*',
    subline: 'Festive ethnic sets for mothers and little ones.',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 2: New Arrivals / Kurta Sets (Women)
  // Desktop: 2172×724 landscape | Mobile: Golden Courtyard 1122×1402 portrait
  {
    id: 2,
    group: 'women',
    image: '/hero/hero-new-1-d.webp',
    mobileImage: '/hero/hero-new-4-m.webp',
    objectPosition: 'center top',
    mobileObjectPosition: 'center top',
    eyebrow: 'NEW ARRIVALS',
    headline: 'Tradition, Worn *Effortlessly*',
    subline: 'Handcrafted kurta sets in pure silk and zari weaves.',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 3: Little Celebrations (Kids)
  // Desktop: 2172×724 landscape | Mobile: Joyful Girls 1122×1402 portrait
  {
    id: 3,
    group: 'kids',
    image: '/hero/hero-new-7-d.webp',
    mobileImage: '/hero/hero-new-6-m.webp',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    eyebrow: 'LITTLE CELEBRATIONS',
    headline: 'Festive Joy, Made for *Twirling*',
    subline: 'Pure silk handcrafted frocks and dhotis for joyful celebrations.',
    ctaLink: '/shop?target=kids',
  },
  // SLIDE 4: Pattu Collection (Kids)
  // Desktop: 2736×912 landscape | Mobile: Three Kids Couch 819×1024 portrait
  {
    id: 4,
    group: 'kids',
    image: '/hero/hero-new-9.webp',
    mobileImage: '/hero/hero-new-9.webp',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    eyebrow: 'PATTU COLLECTION',
    headline: 'Traditions Woven in *Pure Silk*',
    subline: 'Handcrafted festive ensembles designed for vibrant childhood memories.',
    ctaLink: '/shop?target=kids',
  },
  // SLIDE 5: Festive Collection (Women)
  // Desktop: 2736×912 landscape | Mobile: Matching Portrait 1408×1760
  {
    id: 5,
    group: 'women',
    image: '/hero/hero-new-11.webp',
    mobileImage: '/hero/hero-new-12.webp',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    eyebrow: 'FESTIVE COLLECTION',
    headline: 'Draped in *Celebration*',
    subline: 'Zari, sequins and silk made for every festive evening.',
    ctaLink: '/shop?target=women',
  },
  // SLIDE 6: Royal Heritage (Women)
  // Desktop: 2736×912 landscape | Mobile: Matching Portrait 1408×1760
  {
    id: 6,
    group: 'women',
    image: '/hero/hero-new-13.webp',
    mobileImage: '/hero/hero-new-14.webp',
    objectPosition: 'center',
    mobileObjectPosition: 'center top',
    eyebrow: 'ROYAL HERITAGE',
    headline: 'Grace in Every *Weave*',
    subline: 'Exquisite handloom silks and timeless embroidery for special occasions.',
    ctaLink: '/shop?target=women',
  },
];

function renderHeadline(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic font-normal">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

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
  const [autoplayReady, setAutoplayReady] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Defer hero autoplay until after idle to protect initial LCP / main thread
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = () => setAutoplayReady(true);
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(start, { timeout: 4000 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(start, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  // 5s autoplay after idle, pause on touch, hover, or hidden tab
  useEffect(() => {
    if (!autoplayReady || isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplayReady, isPaused, activeSlides.length]);

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

  const currentCtaLink = filter === 'kids' ? '/shop?target=kids' : (filter === 'women' ? '/shop?target=women' : slide.ctaLink);

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
      <style jsx>{`
        @keyframes heroTextFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-hero-eyebrow {
          animation: heroTextFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 0ms both;
        }
        .animate-hero-headline {
          animation: heroTextFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 80ms both;
        }
        .animate-hero-subline {
          animation: heroTextFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 160ms both;
        }
        .animate-hero-cta {
          animation: heroTextFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 240ms both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-eyebrow,
          .animate-hero-headline,
          .animate-hero-subline,
          .animate-hero-cta {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Full-bleed clickable slide */}
      <Link
        href={currentCtaLink}
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

        {/* Luxury Text Overlay */}
        <div
          key={`overlay-${slide.id}-${currentSlide}`}
          className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end sm:justify-center"
        >
          {/* Soft ivory-to-transparent scrim: keeps photos bright, ensures WCAG AA contrast */}
          <div
            className="sm:hidden absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(249, 246, 241, 0.94) 0%, rgba(249, 246, 241, 0.75) 28%, rgba(249, 246, 241, 0.25) 55%, transparent 75%)',
            }}
          />
          <div
            className="hidden sm:block absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(249, 246, 241, 0.88) 0%, rgba(249, 246, 241, 0.72) 25%, rgba(249, 246, 241, 0.30) 45%, transparent 65%)',
            }}
          />

          {/* Text Content Container: aligned with header logo padding */}
          <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 pb-20 sm:pb-0">
            <div className="max-w-[480px] flex flex-col items-start text-left">
              {/* Eyebrow */}
              {slide.eyebrow && (
                <div className="animate-hero-eyebrow flex items-center mb-2.5 sm:mb-3.5">
                  <span className="w-10 h-[1.5px] bg-[#B8903A] mr-3 shrink-0" aria-hidden="true" />
                  <span className="font-sans uppercase text-[12px] sm:text-[13px] tracking-[0.3em] text-[#B8903A] font-semibold">
                    {slide.eyebrow}
                  </span>
                </div>
              )}

              {/* Headline */}
              {slide.headline && (
                <h2 className="animate-hero-headline font-serif font-medium text-[#3A1530] text-[34px] sm:text-[clamp(44px,4.6vw,76px)] leading-[1.05] tracking-tight mb-2.5 sm:mb-4">
                  {renderHeadline(slide.headline)}
                </h2>
              )}

              {/* Subline */}
              {slide.subline && (
                <p className="animate-hero-subline font-sans text-[15px] sm:text-[16px] text-[#5A4552] tracking-[0.02em] leading-relaxed max-w-[440px] line-clamp-2 mb-5 sm:mb-7">
                  {slide.subline}
                </p>
              )}

              {/* CTA Button: Solid deep plum #3A1530 with ivory text & sliding gold arrow */}
              <div className="animate-hero-cta">
                <span className="pointer-events-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-8 sm:py-4 sm:px-9 bg-[#3A1530] text-[#FDFBF7] font-sans text-[12px] sm:text-[13px] font-semibold tracking-[0.22em] uppercase rounded-full shadow-[0_4px_16px_rgba(58,21,48,0.22)] hover:bg-[#4E1C41] hover:shadow-[0_6px_22px_rgba(58,21,48,0.32)] transition-all duration-300 min-h-[48px] group">
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4 text-[#B8903A] transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Prev/Next Navigation Arrows: Available on BOTH Mobile & Desktop (44px min touch target) */}
      {activeSlides.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="pointer-events-auto w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/80 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="pointer-events-auto w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/80 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      )}

      {/* 
        Slide Dots: ≥44px touch area (with p-3.5 padding) to pass WCAG / Lighthouse mobile accessibility
      */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-9 inset-x-0 z-20 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className="p-3 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer focus:outline-none"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-5 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
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
