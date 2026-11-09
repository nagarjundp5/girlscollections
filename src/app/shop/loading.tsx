import React from 'react';

export default function ShopLoading() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FAF8F5] select-none font-sans">
      {/* 52px Sticky Toolbar Skeleton */}
      <div className="sticky top-0 z-30 h-[52px] bg-white border-b border-[#E8E2D9] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-4 w-16 bg-neutral-200 animate-pulse rounded" />
          <div className="h-4 w-14 bg-neutral-200 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-neutral-200 animate-pulse rounded" />
          <div className="h-4 w-8 bg-neutral-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="w-full max-w-[1920px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[2px] p-0 2xl:px-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-full flex flex-col bg-[#F3EFEA]/80">
            <div className="w-full aspect-[2/3] bg-neutral-200/70 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-1/3 bg-neutral-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
