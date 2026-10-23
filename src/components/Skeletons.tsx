import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="w-full border border-zariGold/20 bg-ivory rounded-xl overflow-hidden p-2">
      {/* Image skeleton */}
      <div className="aspect-[3/4] skeleton-shimmer bg-sand/30 rounded-lg w-full"></div>
      {/* Details skeleton */}
      <div className="pt-3 pb-1 space-y-2.5">
        <div className="h-3.5 skeleton-shimmer bg-sand/40 rounded-full w-2/5"></div>
        <div className="h-4 skeleton-shimmer bg-sand/50 rounded-md w-3/4"></div>
        <div className="flex gap-2 pt-1">
          <div className="h-4 skeleton-shimmer bg-zariGold/20 rounded-md w-1/3"></div>
          <div className="h-3.5 skeleton-shimmer bg-sand/30 rounded-md w-1/5"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-ivory p-4 rounded-2xl border border-zariGold/20">
      {/* Left: Gallery */}
      <div className="space-y-4">
        <div className="aspect-[3/4] skeleton-shimmer bg-sand/30 rounded-xl w-full"></div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton-shimmer bg-sand/30 rounded-lg"></div>
          ))}
        </div>
      </div>
      
      {/* Right: Info */}
      <div className="space-y-6 pt-2">
        <div className="space-y-2.5">
          <div className="h-3.5 skeleton-shimmer bg-zariGold/30 rounded-full w-1/4"></div>
          <div className="h-8 skeleton-shimmer bg-sand/50 rounded-lg w-4/5"></div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-7 skeleton-shimmer bg-zariGold/30 rounded-md w-28"></div>
          <div className="h-5 skeleton-shimmer bg-sand/30 rounded-md w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3.5 skeleton-shimmer bg-sand/40 rounded-full w-1/3"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-10 h-10 skeleton-shimmer bg-sand/30 rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-12 skeleton-shimmer bg-zariGold/20 rounded-md w-full"></div>
          <div className="h-12 skeleton-shimmer bg-sand/40 rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 skeleton-shimmer bg-sand/20 border border-zariGold/20 rounded-xl"></div>
        ))}
      </div>
      <div className="h-96 skeleton-shimmer bg-sand/20 border border-zariGold/20 rounded-xl w-full"></div>
    </div>
  );
}
