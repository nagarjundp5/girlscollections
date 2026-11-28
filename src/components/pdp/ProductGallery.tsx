'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ZoomIn, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cl } from '@/lib/cloudinary';
import { LuxuryHeartButton } from '@/components/LuxuryHeartButton';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  productId?: string;
  inWishlist?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
  onShare?: () => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
  productId,
  inWishlist = false,
  onToggleWishlist,
  onShare,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [desktopHoverPos, setDesktopHoverPos] = useState({ x: 50, y: 50 });
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const safeImages = images && images.length > 0 ? images : ['/logo.png'];
  const hasMultiple = safeImages.length > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const openZoom = useCallback(() => {
    if (typeof document !== 'undefined') {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
    setIsZoomOpen(true);
  }, []);

  const closeZoom = useCallback(() => {
    setIsZoomOpen(false);
    setZoomScale(1);
    if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
      setTimeout(() => lastFocusedRef.current?.focus(), 0);
    }
  }, []);

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

  // Desktop mouse follow hover zoom (scale 1.6)
  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setDesktopHoverPos({ x, y });
  };

  // Fullscreen modal zoom double-tap / click toggle
  const handleModalImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
    setZoomScale((s) => (s > 1 ? 1 : 2.2));
  };

  // Close zoom modal on ESC, navigate with ArrowLeft/ArrowRight, and lock body scroll
  useEffect(() => {
    if (!isZoomOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeZoom();
      } else if (e.key === 'ArrowRight' && safeImages.length > 1) {
        setZoomScale(1);
        setSelectedIdx((prev) => (prev + 1) % safeImages.length);
      } else if (e.key === 'ArrowLeft' && safeImages.length > 1) {
        setZoomScale(1);
        setSelectedIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isZoomOpen, closeZoom, safeImages.length]);

  return (
    <div id="pdp-primary-gallery" className="w-full select-none">
      {/* ── MOBILE GALLERY (Scroll-snap, full image contain, rounded bottom 24px) ── */}
      <div className="lg:hidden w-full">
        <div className="relative w-full aspect-[2/3] max-h-[82vh] rounded-b-[24px] overflow-hidden bg-[#FBF8F4]">
          {/* "1/4" Counter Top-Left */}
          {hasMultiple && (
            <span className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-sans font-medium tracking-wide">
              {selectedIdx + 1}/{safeImages.length}
            </span>
          )}

          {/* Overlaid Top-Right: 44px Heart & Share buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {onToggleWishlist && (
              <LuxuryHeartButton
                isLiked={inWishlist}
                onToggle={onToggleWishlist}
                size="md"
              />
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="w-11 h-11 rounded-full bg-white border border-[#EADFD6]/80 shadow-[0_3px_12px_rgba(26,30,58,0.08)] flex items-center justify-center text-[var(--ink)] hover:text-[var(--cta)] active:scale-95 transition-all select-none cursor-pointer focus:outline-none"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CSS Scroll-Snap Horizontal Reel */}
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {safeImages.map((img, idx) => {
              const url = cl(img, { w: 900, q: 'auto:good' });
              return (
                <div
                  key={idx}
                  onClick={openZoom}
                  className="w-full h-full shrink-0 snap-center relative cursor-zoom-in"
                >
                  <Image
                    src={url}
                    alt={`${productName} view ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    sizes="100vw"
                    className="object-contain object-center"
                  />
                </div>
              );
            })}
          </div>

          {/* Small Pill Dots at Bottom */}
          {hasMultiple && (
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === selectedIdx
                      ? 'w-5 bg-white shadow-xs'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Thumbnails Row Below: 64x80 rounded 12px */}
        {hasMultiple && (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-3 px-4 pb-1">
            {safeImages.map((img, idx) => {
              const isActive = idx === selectedIdx;
              const thumbUrl = cl(img, { w: 160, h: 200, c: 'fill', q: 'auto:low' });
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`relative w-[64px] h-[80px] rounded-[12px] overflow-hidden shrink-0 border transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-[var(--cta)] ring-offset-1 border-transparent shadow-xs'
                      : 'border-[#EADFD6] opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP GALLERY (Two Columns, Sticky, Vertical 72px Thumbs, Cursor Zoom) ── */}
      <div className="hidden lg:flex gap-4 items-start w-full">
        {/* Vertical Thumbnails (72px wide, beside main image) */}
        {hasMultiple && (
          <div className="flex flex-col space-y-2.5 w-[72px] shrink-0 max-h-[640px] overflow-y-auto no-scrollbar">
            {safeImages.map((img, idx) => {
              const isActive = idx === selectedIdx;
              const thumbUrl = cl(img, { w: 160, h: 200, c: 'fill', q: 'auto:low' });
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative w-[72px] h-[90px] rounded-[12px] overflow-hidden shrink-0 border transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-[var(--cta)] ring-offset-1 border-transparent shadow-xs'
                      : 'border-[#EADFD6] opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${productName} thumb ${idx + 1}`}
                    fill
                    sizes="72px"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image with Hover Cursor Zoom scale 1.6 (full image contain, max-h 85vh) */}
        <div
          onClick={openZoom}
          onMouseEnter={() => setIsDesktopHovered(true)}
          onMouseLeave={() => setIsDesktopHovered(false)}
          onMouseMove={handleDesktopMouseMove}
          className="relative flex-1 aspect-[2/3] max-h-[85vh] rounded-[20px] overflow-hidden bg-[#FBF8F4] border border-[#EADFD6]/60 cursor-zoom-in"
        >
          {/* Overlaid Top-Right: 44px Heart & Share buttons on desktop image */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {onToggleWishlist && (
              <LuxuryHeartButton
                isLiked={inWishlist}
                onToggle={onToggleWishlist}
                size="md"
              />
            )}
            {onShare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="w-11 h-11 rounded-full bg-white border border-[#EADFD6]/80 shadow-[0_3px_12px_rgba(26,30,58,0.08)] flex items-center justify-center text-[var(--ink)] hover:text-[var(--cta)] active:scale-95 transition-all select-none cursor-pointer focus:outline-none"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div
            className="w-full h-full relative will-change-transform"
            style={{
              transform: isDesktopHovered ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: `${desktopHoverPos.x}% ${desktopHoverPos.y}%`,
              transition: isDesktopHovered
                ? 'transform 100ms ease-out'
                : 'transform 240ms ease-out',
            }}
          >
            <Image
              src={cl(safeImages[selectedIdx], { w: 1200, q: 'auto:good' })}
              alt={`${productName} main view`}
              fill
              priority={selectedIdx === 0}
              loading={selectedIdx === 0 ? 'eager' : 'lazy'}
              sizes="(min-width: 1024px) 580px, 100vw"
              className="object-contain object-center pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN ZOOM VIEWER (Portaled to body above header/nav/sticky bar) ── */}
      {mounted && isZoomOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} fullscreen image viewer`}
          onClick={closeZoom}
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-2 sm:p-6 select-none"
        >
          {/* Close button (44px) */}
          <button
            type="button"
            autoFocus
            onClick={(e) => {
              e.stopPropagation();
              closeZoom();
            }}
            className="fixed top-4 right-4 z-[100001] w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close fullscreen zoom"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Counter */}
          {hasMultiple && (
            <span className="fixed top-5 left-5 z-[100001] px-3 py-1 rounded-full bg-white/15 text-white text-xs font-sans font-medium">
              {selectedIdx + 1} / {safeImages.length}
            </span>
          )}

          {/* Prev / Next arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setSelectedIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
                }}
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[100001] w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setSelectedIdx((prev) => (prev + 1) % safeImages.length);
                }}
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[100001] w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Hint */}
          <span className="fixed bottom-4 inset-x-0 text-center text-xs text-white/70 font-sans pointer-events-none z-[100001]">
            Tap or double-tap to zoom in/out
          </span>

          {/* Large image with transform scale toggle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleModalImageClick(e);
            }}
            className="relative w-full max-w-4xl h-[85vh] flex items-center justify-center overflow-hidden cursor-zoom-in"
          >
            <div
              className="relative w-full h-full will-change-transform"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Image
                src={cl(safeImages[selectedIdx], { w: 1600, q: 'auto:best' })}
                alt={`${productName} zoomed view`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProductGallery;
