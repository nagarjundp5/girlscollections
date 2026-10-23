'use client';

import React from 'react';
import { Product } from '@/data/shopData';
import { ProductCard } from '../ProductCard';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-ivory border border-zariGold/20 p-4 space-y-4 shadow-xs">
            <div className="aspect-[3/4] w-full rounded-xl skeleton-shimmer" />
            <div className="h-3 w-1/3 rounded skeleton-shimmer" />
            <div className="h-5 w-3/4 rounded skeleton-shimmer" />
            <div className="h-5 w-1/2 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-sand/50 text-zariGold flex items-center justify-center mx-auto border border-zariGold/30">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-inkNavy">No Products Found</h3>
        <p className="text-sm text-inkNavy/60 font-sans font-medium">
          We couldn&apos;t find any pieces matching your current filter selection. 
          Try resetting filters or exploring our New Arrivals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7 lg:gap-9">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} priorityImage={idx < 4} index={idx} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center pt-8">
          <button
            onClick={onLoadMore}
            className="px-8 py-3.5 rounded-full bg-navy hover:bg-navy-dark text-ivory text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg inline-flex items-center space-x-2 transition-all cursor-pointer border border-zariGold/40 hover:border-zariGold"
          >
            <RefreshCw className="w-4 h-4 text-zariGold" />
            <span>Load More Products</span>
          </button>
        </div>
      )}
    </div>
  );
};

