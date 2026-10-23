'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Slide {
  id: number;
  group: 'women' | 'kids';
  image: string;
  mobileImage: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  eyebrow: string;
  titlePrefix: string;
  titleAmp?: string;
  titleSuffix: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  watermarkText: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    group: 'women',
    image: '/bgimageladies1desktop.webp',
    mobileImage: '/bgimage1ladies.webp',
    objectPosition: 'center 28%',
    mobileObjectPosition: 'center 20%',
    eyebrow: "ROYAL FESTIVE COUTURE '26",
    titlePrefix: 'Handcrafted Silk Anarkalis',
    titleAmp: '&',
    titleSuffix: 'Royal Suits',
    subtitle: 'Woven by master artisans in pure silk with rich hand-embroidered gold zari borders.',
    ctaText: 'EXPLORE WOMEN ETHNIC',
    ctaLink: '/shop?target=women',
    watermarkText: 'THE GIRLS',
  },
  {
    id: 2,
    group: 'women',
    image: '/bgimageladies1desktop.webp',
    mobileImage: '/bgimage2ladies.webp',
    objectPosition: 'center 32%',
    mobileObjectPosition: 'center 22%',
    eyebrow: 'HERITAGE COUTURE EDIT',
    titlePrefix: 'Royal Silk Lehengas',
    titleAmp: '&',
    titleSuffix: 'Bridal Weaves',
    subtitle: 'Statement royal zari motifs woven with pure gold threads for timeless elegance.',
    ctaText: 'DISCOVER COUTURE',
    ctaLink: '/shop?target=women',
    watermarkText: 'COUTURE',
  },
  {
    id: 3,
    group: 'kids',
    image: '/bgimageladies1desktop.webp',
    mobileImage: '/bgimage1kids.webp',
    objectPosition: 'center 35%',
    mobileObjectPosition: 'center 25%',
    eyebrow: 'LITTLE ROYALTY COLLECTION',
    titlePrefix: 'Kids Pattu Langa',
    titleAmp: '&',
    titleSuffix: 'Royal Frocks',
    subtitle: 'Soft cotton-lined pure silk lehengas tailored for itch-free celebratory comfort.',
    ctaText: 'SHOP KIDS ETHNIC',
    ctaLink: '/shop?target=kids',
    watermarkText: 'THE LITTLES',
  },
  {
    id: 4,
    group: 'kids',
    image: '/bgimageladies1desktop.webp',
    mobileImage: '/bgimage1kids.webp',
    objectPosition: 'center 30%',
    mobileObjectPosition: 'center 20%',
    eyebrow: 'PARTY WEAR FROCKS',
    titlePrefix: 'Layered Tulle',
    titleAmp: '&',
    titleSuffix: 'Organza Frocks',
    subtitle: 'Dreamy celebratory frocks designed for birthdays, weddings, and special events.',
    ctaText: 'EXPLORE FROCKS',
    ctaLink: '/shop?category=party-wear-frocks&target=kids',
    watermarkText: 'FROCKS',
  },
];

interface HeroCarouselProps {
  filter?: 'all' | 'women' | 'kids';
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ filter = 'all' }) => {
  const activeSlides = useMemo(() => {
    if (filter === 'all') return HERO_SLIDES;
    return HERO_SLIDES.filter((s) => s.group === filter);
  }, [filter]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentSlide(0);
  }, [filter]);

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
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
    if (Math.abs(diff) > 40) {
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
      className="relative w-full h-[90vh] sm:h-screen sm:h-[100dvh] bg-[#0F0C14] overflow-hidden flex flex-col justify-end select-none p-0 m-0 rounded-none border-none shadow-none contain-paint"
    >
      {/* Background Image Layer (Absolute Full Bleed) */}
      <Link
        href={slide.ctaLink}
        prefetch={true}
        className="absolute inset-0 z-0 block cursor-pointer bg-[#0F0C14]"
        aria-label={slide.titlePrefix}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 z-0 bg-[#0F0C14]"
          >
            {/* Mobile View */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={slide.mobileImage}
                alt={slide.titlePrefix}
                fill
                priority={currentSlide === 0}
                className="object-cover filter brightness-[0.88]"
                style={{ objectPosition: slide.mobileObjectPosition || 'center 20%' }}
                sizes="100vw"
                quality={85}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.titlePrefix}
                fill
                priority={currentSlide === 0}
                className="object-cover filter brightness-[0.90]"
                style={{ objectPosition: slide.objectPosition || 'center 28%' }}
                sizes="100vw"
                quality={90}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* TOP SCRIM: Subtle dark gradient for header text legibility */}
        <div className="absolute top-0 inset-x-0 h-40 sm:h-52 bg-gradient-to-b from-[#0F0C14]/80 via-[#0F0C14]/25 to-transparent pointer-events-none z-10" />

        {/* BOTTOM SCRIM: Smooth gradient for editorial headline contrast */}
        <div className="absolute bottom-0 inset-x-0 h-80 sm:h-96 bg-gradient-to-t from-[rgba(28,20,23,0.95)] via-[rgba(28,20,23,0.6)] to-transparent pointer-events-none z-10" />
      </Link>

      {/* OVERSIZED SLIDE WATERMARK: Confined to desktop only to avoid mobile clutter */}
      <div className="hidden md:block absolute bottom-32 inset-x-0 z-10 pointer-events-none overflow-hidden max-h-[30vh] px-14">
        <AnimatePresence mode="wait">
          <motion.span
            key={`watermark-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45 }}
            className="text-[120px] lg:text-[160px] font-serif font-normal text-white/[0.03] leading-none uppercase tracking-widest block select-none whitespace-nowrap"
            aria-hidden="true"
          >
            {slide.watermarkText}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Main Editorial Text Content Block */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-5 xs:px-6 sm:px-14 lg:px-20 pb-4 sm:pb-6 text-white pointer-events-none max-h-[55vh] overflow-hidden flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl lg:max-w-2xl text-left space-y-2.5 sm:space-y-3.5 pointer-events-auto"
          >
            {/* Eyebrow Label */}
            <span className="text-[#FAF6EE]/80 text-[10px] sm:text-xs tracking-[0.24em] font-sans font-medium uppercase block">
              {slide.eyebrow}
            </span>

            {/* Editorial Headline with Light/Regular Serif */}
            <div>
              <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white leading-[1.1] tracking-tight m-0">
                {slide.titlePrefix}{' '}
                {slide.titleAmp && (
                  <span className="font-serif italic font-light text-white/90 px-0.5">
                    {slide.titleAmp}
                  </span>
                )}{' '}
                {slide.titleSuffix}
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-[#FAF6EE]/90 font-sans font-normal leading-relaxed max-w-md sm:max-w-lg line-clamp-2">
              {slide.subtitle}
            </p>

            {/* Restrained Luxury Ghost CTA Button */}
            <div className="pt-1.5 sm:pt-2">
              <Link
                href={slide.ctaLink}
                prefetch={true}
                className="px-6 py-2.5 sm:px-8 sm:py-3.5 border border-white text-white hover:bg-white hover:text-[#1A1E3A] transition-colors duration-200 text-[10px] sm:text-xs font-sans tracking-[0.2em] font-medium uppercase inline-flex items-center space-x-2.5 group min-h-[44px]"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-current group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* UNDERSTATED CAROUSEL DOTS */}
      <div className="relative z-30 max-w-[1440px] mx-auto w-full px-5 xs:px-6 sm:px-14 pb-16 sm:pb-8 flex items-center justify-start pointer-events-auto">
        <div className="flex items-center space-x-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className="p-1 cursor-pointer focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`h-1 block rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* OUTLINED SIDE ARROWS: HIDDEN ON MOBILE to avoid screen overlap, shown on desktop */}
      <div className="hidden sm:flex absolute inset-y-0 left-0 right-0 z-30 pointer-events-none items-center justify-between px-4 sm:px-8">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrev();
          }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#1A1E3A]/40 backdrop-blur-xs text-white/85 hover:text-white border border-white/25 hover:border-white/60 hover:bg-[#1A1E3A]/70 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#1A1E3A]/40 backdrop-blur-xs text-white/85 hover:text-white border border-white/25 hover:border-white/60 hover:bg-[#1A1E3A]/70 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Next banner"
        >
          <ChevronRight className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
