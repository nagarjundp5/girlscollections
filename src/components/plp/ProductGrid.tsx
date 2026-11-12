'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/data/shopData';
import { ProductCard } from './ProductCard';
import { ShoppingBag, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  mobileColumns?: 1 | 2;
  desktopColumns?: 3 | 4;
  target?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  mobileColumns = 2,
  desktopColumns = 4,
  target,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Delegated Carousel Click Listener (prevents card link navigation, handles prev/next)
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-carousel-action]') as HTMLButtonElement | null;
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const action = btn.getAttribute('data-carousel-action');
    const card = btn.closest('[data-product-card]');
    if (!card) return;

    const container = card.querySelector('[data-carousel-container]') as HTMLElement | null;
    if (!container) return;

    const width = container.clientWidth;
    const currentScroll = container.scrollLeft;
    const targetScroll = action === 'next' ? currentScroll + width : currentScroll - width;

    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  // Delegated Carousel Scroll Listener (updates dots & button visibility)
  useEffect(() => {
    const grid = gridContainerRef.current;
    if (!grid) return;

    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      if (!container || !container.hasAttribute('data-carousel-container')) return;

      const card = container.closest('[data-product-card]');
      if (!card) return;

      const width = container.clientWidth;
      if (width <= 0) return;

      const activeIndex = Math.round(container.scrollLeft / width);
      const totalSlides = container.children.length;

      // Update dots
      const dots = card.querySelectorAll('[data-dot-index]');
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.className = 'h-1 rounded-full transition-all w-2.5 bg-white shadow-xs';
        } else {
          dot.className = 'h-1 rounded-full transition-all w-1 bg-white/60';
        }
      });

      // Update button visibility
      const prevBtn = card.querySelector('[data-carousel-action="prev"]') as HTMLButtonElement | null;
      const nextBtn = card.querySelector('[data-carousel-action="next"]') as HTMLButtonElement | null;

      if (prevBtn) {
        prevBtn.style.display = activeIndex === 0 ? 'none' : 'flex';
      }
      if (nextBtn) {
        nextBtn.style.display = activeIndex >= totalSlides - 1 ? 'none' : 'flex';
      }
    };

    grid.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => grid.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  // Infinite scroll IntersectionObserver sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || !onLoadMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isLoading]);

  if (isLoading && products.length === 0) {
    return (
      <div
        className={`w-full max-w-[1920px] mx-auto grid gap-[2px] p-0 2xl:px-6 ${
          mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
        } ${desktopColumns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'}`}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-full flex flex-col bg-[#F3EFEA]/60">
            <div className="w-full aspect-[2/3] bg-neutral-200/60 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-1/3 bg-neutral-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    const isKids = (target || '').toLowerCase() === 'kids';
    const divisionLabel = isKids ? 'Kids' : 'Women';
    const fallbackLink = `/shop?target=${isKids ? 'kids' : 'women'}`;

    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 font-sans select-none flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#B8924A]/30 flex items-center justify-center mb-4 text-[#B8924A]">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-serif font-bold uppercase tracking-[0.06em] text-[#1C1417]">
          No Products Found
        </h3>
        <p className="mt-2 text-sm text-[#1C1417]/70 font-normal leading-relaxed">
          We couldn&apos;t find any pieces in this category right now. Discover the rest of our handcrafted {divisionLabel} collection.
        </p>
        <Link
          href={fallbackLink}
          className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#3B1230] text-white text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#4E1A40] transition-transform active:scale-[0.98] shadow-md cursor-pointer"
        >
          Explore All {divisionLabel} Collection
        </Link>
      </div>
    );
  }

  // Column classes
  const mobileColClass = mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2';
  const desktopColClass = desktopColumns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-16">
      {/* Edge-to-edge product grid with 2px gap, 24px side padding only >1600px */}
      <div
        ref={gridContainerRef}
        onClick={handleGridClick}
        className={`w-full grid gap-[2px] p-0 2xl:px-6 ${mobileColClass} ${desktopColClass}`}
      >
        {products.map((product, idx) => (
          <ProductCard
            key={product.id || `${product.slug}-${idx}`}
            product={product}
            index={idx}
            priority={idx < 4}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-10 w-full" />}

      {/* Fallback Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-8 pb-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-8 py-3 bg-[#1C1417] text-white hover:bg-black text-[12px] font-sans font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Loading...' : 'Load More Products'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
