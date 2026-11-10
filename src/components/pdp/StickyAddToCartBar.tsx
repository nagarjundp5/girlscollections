'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/data/shopData';

interface StickyAddToCartBarProps {
  product: Product;
  selectedSize: string;
  onAddToCart: () => void;
}

export const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  selectedSize,
  onAddToCart,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const galleryEl = document.getElementById('pdp-primary-gallery');

    if (!galleryEl) {
      const handleScroll = () => {
        setIsVisible(window.scrollY > 450);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sticky bar slides in ONLY after the primary product gallery scrolls out of view
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(galleryEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed z-[85] inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EFE7E2] px-4 py-2.5 shadow-xl transition-all duration-300 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      } bottom-[56px] sm:bottom-0`}
      style={{
        paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Product Details Left */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1C1417] truncate leading-tight">
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="font-extrabold text-[#1C1417]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#B8903A] font-semibold">
              {selectedSize ? `• Size: ${selectedSize}` : '• Select size'}
            </span>
          </div>
        </div>

        {/* Solid Wine Add To Bag Right */}
        <button
          onClick={onAddToCart}
          className="h-[44px] px-5 sm:px-8 rounded-[6px] bg-[#3B1230] hover:bg-[#2A0D22] active:scale-[0.98] text-white font-sans text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 shrink-0 shadow-md transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{selectedSize ? 'ADD TO BAG' : 'CHOOSE SIZE'}</span>
        </button>
      </div>
    </div>
  );
};

export default StickyAddToCartBar;
