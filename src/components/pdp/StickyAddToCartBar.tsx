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
    
    // Fallback: observe gallery element; if absent, reveal after 400px scroll
    if (!galleryEl) {
      const handleScroll = () => {
        setIsVisible(window.scrollY > 400);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sticky bar slides in ONLY after the primary product gallery image scrolls out of view
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(galleryEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-[80] bg-ivory/95 backdrop-blur-md border-t border-zariGold/30 px-4 py-3 shadow-2xl transition-all duration-200 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        
        {/* Product Title & Price Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-serif font-semibold text-inkNavy truncate">
              {product.name}
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-xs sm:text-sm font-sans font-bold text-zariGold font-tnum">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-sans text-inkNavy/60 uppercase">
                • Size {selectedSize}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddToCart}
            className="px-5 py-2.5 bg-inkNavy text-white hover:bg-zariGold active:scale-[0.97] transition-all duration-120 ease-out rounded-md text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ADD TO BAG</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default StickyAddToCartBar;
