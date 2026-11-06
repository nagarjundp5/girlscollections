'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cl, clBlur } from '@/lib/cloudinary';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollLeft;
    const width = target.offsetWidth;
    if (width > 0) {
      const index = Math.round(scrollPosition / width);
      if (index >= 0 && index < images.length) {
        setSelectedIdx(index);
      }
    }
  };

  const hasMultipleImages = images && images.length > 1;

  return (
    <div id="pdp-primary-gallery" className="w-full select-none">
      {/* Desktop Gallery Layout: Clean, Borderless, Full-Bleed Image Gallery */}
      <div className="hidden lg:flex gap-5 items-start">
        {/* Left Thumbnail Rail */}
        {hasMultipleImages && (
          <div className="flex flex-col space-y-3.5 w-20 shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-[#FAF8F5] ${
                  idx === selectedIdx
                    ? 'border-zariGold ring-2 ring-zariGold/40 scale-[1.02] shadow-md'
                    : 'border-zariGold/20 opacity-70 hover:opacity-100 hover:border-zariGold/60'
                }`}
              >
                <Image
                  src={cl(img, { w: 160, q: 'auto:good' })}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Display Image - Borderless, Clean Full-Bleed Rectangle with Object-Contain */}
        <div className="relative flex-1 aspect-[3/4] max-h-[720px] rounded-2xl overflow-hidden shadow-xl bg-[#FAF8F5] border border-zariGold/20 group">
          <Image
            src={cl(images[selectedIdx] || images[0], { w: 1200, q: 'auto:good' })}
            alt={productName}
            fill
            priority
            placeholder="blur"
            blurDataURL={clBlur(images[selectedIdx] || images[0])}
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Mobile Gallery Layout: Borderless Full-Bleed Carousel with Object-Contain */}
      <div className="lg:hidden w-full flex flex-col items-center">
        <div className="relative w-full aspect-[3/4] max-h-[560px] rounded-2xl overflow-hidden shadow-lg bg-[#FAF8F5] border border-zariGold/20">
          <div
            onScroll={handleMobileScroll}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {images.map((img, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0 snap-start bg-[#FAF8F5]">
                <Image
                  src={cl(img, { w: 900, q: 'auto:good' })}
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
        </div>

        {/* Mobile Pagination Dots */}
        {hasMultipleImages && (
          <div className="mt-4 mb-1 flex justify-center items-center gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === selectedIdx
                    ? 'w-6 bg-zariGold shadow-xs'
                    : 'w-2 bg-inkNavy/30 hover:bg-inkNavy/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
