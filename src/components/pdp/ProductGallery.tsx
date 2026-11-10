'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cl, clBlur } from '@/lib/cloudinary';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images = [], productName }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const safeImages = images && images.length > 0 ? images : ['/logo.png'];
  const hasMultipleImages = safeImages.length > 1;

  // Jump to specific slide
  const goToSlide = useCallback((idx: number) => {
    const targetIdx = Math.max(0, Math.min(idx, safeImages.length - 1));
    setSelectedIdx(targetIdx);

    if (mobileScrollRef.current) {
      const el = mobileScrollRef.current;
      const slideWidth = el.offsetWidth;
      el.scrollTo({ left: targetIdx * slideWidth, behavior: 'smooth' });
    }
  }, [safeImages.length]);

  const handlePrev = useCallback(() => {
    goToSlide(selectedIdx === 0 ? safeImages.length - 1 : selectedIdx - 1);
  }, [goToSlide, selectedIdx, safeImages.length]);

  const handleNext = useCallback(() => {
    goToSlide(selectedIdx === safeImages.length - 1 ? 0 : selectedIdx + 1);
  }, [goToSlide, selectedIdx, safeImages.length]);

  // Arrow key navigation on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isZoomOpen) {
        if (e.key === 'Escape') setIsZoomOpen(false);
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext, isZoomOpen]);

  // Mobile scroll-snap listener
  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const width = el.offsetWidth;
    if (width > 0) {
      const newIdx = Math.round(el.scrollLeft / width);
      if (newIdx >= 0 && newIdx < safeImages.length && newIdx !== selectedIdx) {
        setSelectedIdx(newIdx);
      }
    }
  };

  // Preload next image link element dynamically
  useEffect(() => {
    if (safeImages.length > 1) {
      const nextIdx = (selectedIdx + 1) % safeImages.length;
      const nextUrl = cl(safeImages[nextIdx], { w: 960, q: 'auto:good' });
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = nextUrl;
      document.head.appendChild(link);
      return () => {
        try {
          document.head.removeChild(link);
        } catch {}
      };
    }
  }, [selectedIdx, safeImages]);

  return (
    <div id="pdp-primary-gallery" className="w-full select-none">
      {/* ── DESKTOP GALLERY (Vertical Thumbnails on Left + Big Image Right) ── */}
      <div className="hidden lg:flex gap-4 items-start">
        {/* Left Vertical Thumbnails */}
        {hasMultipleImages && (
          <div className="flex flex-col space-y-3 w-20 shrink-0 max-h-[640px] overflow-y-auto no-scrollbar">
            {safeImages.map((img, idx) => {
              const isActive = idx === selectedIdx;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer bg-[#FAF8F5] ${
                    isActive
                      ? 'border-[#3B1230] ring-2 ring-[#3B1230]/20 shadow-md scale-[1.02]'
                      : 'border-[#EFE7E2] opacity-75 hover:opacity-100 hover:border-[#B8903A]'
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <Image
                    src={cl(img, { w: 160, q: 'auto:good' })}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Display Image */}
        <div className="relative flex-1 aspect-[3/4] max-h-[680px] rounded-3xl overflow-hidden shadow-sm bg-[#FAF8F5] border border-[#EFE7E2] group">
          <div
            onClick={() => setIsZoomOpen(true)}
            className="w-full h-full cursor-zoom-in relative"
          >
            <Image
              src={cl(safeImages[selectedIdx], { w: 1280, q: 'auto:good' })}
              alt={productName}
              fill
              priority
              placeholder="blur"
              blurDataURL={clBlur(safeImages[selectedIdx])}
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>

          {/* Desktop Arrow Buttons */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-900 border border-white/60 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer focus:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-900 border border-white/60 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer focus:opacity-100"
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
            </>
          )}

          {/* Click to Zoom Pill */}
          <button
            onClick={() => setIsZoomOpen(true)}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-sans flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Click to zoom</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE GALLERY (Scroll-Snap Carousel + Arrows + Dots + Counter + Thumbnail Strip) ── */}
      <div className="lg:hidden w-full flex flex-col items-center space-y-3">
        <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-3xl overflow-hidden shadow-xs bg-[#FAF8F5] border border-[#EFE7E2]">
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
            }}
          >
            {safeImages.map((img, idx) => (
              <div
                key={idx}
                className="relative w-full h-full shrink-0 snap-start bg-[#FAF8F5] flex items-center justify-center cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
              >
                <Image
                  src={cl(img, { w: 960, q: 'auto:good' })}
                  alt={`${productName} slide ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  placeholder="blur"
                  blurDataURL={clBlur(img)}
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>

          {/* Round prev/next arrow buttons (36px, white translucent) visible on mobile */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-zinc-900 border border-white/60 shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-zinc-900 border border-white/60 shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
            </>
          )}

          {/* Dots + "2 / 5" Counter Badge */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-4 z-10 pointer-events-none">
              <div className="flex items-center gap-1.5 pointer-events-auto bg-black/30 backdrop-blur-xs px-2 py-1 rounded-full">
                {safeImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Jump to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                      idx === selectedIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[11px] font-semibold backdrop-blur-xs">
                {selectedIdx + 1} / {safeImages.length}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Horizontal Thumbnail Strip (Tap to jump, active has dark border) */}
        {hasMultipleImages && (
          <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {safeImages.map((img, idx) => {
              const isActive = idx === selectedIdx;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`relative aspect-[3/4] w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#FAF8F5] ${
                    isActive
                      ? 'border-[#3B1230] ring-1 ring-[#3B1230] scale-105 shadow-sm'
                      : 'border-[#EFE7E2] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <Image
                    src={cl(img, { w: 120, q: 'auto:good' })}
                    alt={`${productName} mini thumb ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FULL-SCREEN ZOOM MODAL (Desktop & Mobile Pinch/Zoom) ── */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-fade-in"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10 px-2 pt-2">
            <span className="text-xs uppercase tracking-wider font-sans text-gray-300">
              {productName} ({selectedIdx + 1} of {safeImages.length})
            </span>
            <button
              onClick={() => setIsZoomOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close zoom viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Zoom Image Viewport */}
          <div className="relative flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
            <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
              <Image
                src={cl(safeImages[selectedIdx], { w: 1600, q: 'auto:best' })}
                alt={`${productName} zoomed`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {hasMultipleImages && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2 z-10">
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative aspect-[3/4] w-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === selectedIdx ? 'border-white scale-110 shadow-md' : 'border-white/30 opacity-60'
                  }`}
                >
                  <Image
                    src={cl(img, { w: 100, q: 'auto:good' })}
                    alt={`Zoom thumb ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
