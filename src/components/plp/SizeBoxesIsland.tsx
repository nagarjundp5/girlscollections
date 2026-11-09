'use client';

import React from 'react';
import Link from 'next/link';
import { FormattedCardSize } from '@/lib/size-display';

interface SizeBoxesIslandProps {
  slug: string;
  sizes: FormattedCardSize[];
}

export const SizeBoxesIsland: React.FC<SizeBoxesIslandProps> = ({ slug, sizes }) => {
  if (!sizes || sizes.length === 0) return null;

  // Max 6 visible per specs
  const visibleSizes = sizes.slice(0, 6);
  const remainingCount = sizes.length - 6;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full flex items-center justify-start gap-1 sm:gap-1.5 px-2 py-1.5 bg-white/90 backdrop-blur-xs border-t border-black/5"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-hidden">
        {visibleSizes.map((s, idx) => {
          if (!s.inStock) {
            return (
              <div
                key={idx}
                title={`${s.label} (Sold Out)`}
                className="relative w-7 h-7 min-w-[28px] min-h-[28px] border border-neutral-300 bg-neutral-100/80 text-neutral-400 text-[11px] font-sans font-medium flex items-center justify-center select-none cursor-not-allowed overflow-hidden"
              >
                <span>{s.label}</span>
                {/* Diagonal line strike */}
                <span className="absolute inset-0 border-t border-neutral-400 rotate-45 transform origin-center scale-125" />
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={`/shop/${slug}?size=${encodeURIComponent(s.sizeParam)}`}
              onClick={(e) => e.stopPropagation()}
              title={`Select ${s.label}`}
              className="w-7 h-7 min-w-[28px] min-h-[28px] border border-neutral-300 bg-white hover:bg-[#1C1417] hover:border-[#1C1417] text-[#1C1417] hover:text-white text-[11px] font-sans font-medium flex items-center justify-center transition-colors select-none cursor-pointer"
            >
              {s.label}
            </Link>
          );
        })}

        {remainingCount > 0 && (
          <span className="text-[10px] text-neutral-500 font-sans font-medium pl-0.5">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
};

