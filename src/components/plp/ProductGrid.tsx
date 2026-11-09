'use client';

import React, { useEffect, useRef } from 'react';
import { Product } from '@/data/shopData';
import { ProductCard } from './ProductCard';
import { RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  mobileColumns?: 1 | 2;
  desktopColumns?: 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  mobileColumns = 2,
  desktopColumns = 4,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 font-sans select-none">
        <h3 className="text-[18px] font-normal tracking-[0.04em] uppercase text-[#1C1417]">
          No Products Found
        </h3>
        <p className="mt-2 text-[14px] text-neutral-500 font-normal">
          We couldn&apos;t find any pieces matching your current selection. Try clearing your filters.
        </p>
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
