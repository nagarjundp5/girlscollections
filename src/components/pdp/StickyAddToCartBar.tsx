'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/data/shopData';
import { formatSizeLabel } from '@/lib/formatSizeLabel';

interface StickyAddToCartBarProps {
  product: Product;
  selectedSize: string;
  activePrice: number;
  onAddToCart: () => void;
  onScrollToSize: () => void;
}

export const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  selectedSize,
  activePrice,
  onAddToCart,
  onScrollToSize,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainActionBtn = document.getElementById('pdp-main-actions');

    if (!mainActionBtn) {
      const handleScroll = () => {
        setIsVisible(window.scrollY > 450);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Appears only after the main buttons scroll out of view
        const visible = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsVisible(visible);
        window.dispatchEvent(new CustomEvent('tgc-pdp-sticky', { detail: { isVisible: visible } }));
      },
      { threshold: 0.1 }
    );

    observer.observe(mainActionBtn);
    return () => {
      observer.disconnect();
      window.dispatchEvent(new CustomEvent('tgc-pdp-sticky', { detail: { isVisible: false } }));
    };
  }, []);

  return (
    <div
      className={`lg:hidden fixed z-[85] inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EADFD6] px-4 py-2.5 shadow-xl transition-transform duration-260 ease-out will-change-transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
      aria-hidden={!isVisible}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Product Details Left */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-serif font-semibold text-[var(--ink)] truncate leading-tight">
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="font-bold text-[var(--ink)] tabular-nums">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[var(--muted)] truncate">
              {selectedSize ? `• Size ${formatSizeLabel(selectedSize)}` : '• Size not chosen'}
            </span>
          </div>
        </div>

        {/* Add To Cart or Select Size Button */}
        <button
          type="button"
          onClick={selectedSize ? onAddToCart : onScrollToSize}
          className="h-[44px] px-5 rounded-[12px] bg-[var(--cta)] hover:bg-[var(--cta-hover)] active:scale-[0.96] text-white font-sans text-xs font-semibold flex items-center justify-center gap-2 shrink-0 shadow-xs transition-transform cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{selectedSize ? 'Add to Cart' : 'Select size'}</span>
        </button>
      </div>
    </div>
  );
};

export default StickyAddToCartBar;
