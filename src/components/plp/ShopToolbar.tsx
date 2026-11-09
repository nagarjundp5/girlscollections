'use client';

import React from 'react';
import { LayoutGrid, Grid3X3, Grid2X2, Square, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ShopToolbarProps {
  productCount: number;
  activeFilterCount: number;
  onOpenFilter: () => void;
  onOpenSort: () => void;
  mobileColumns: 1 | 2;
  setMobileColumns: (cols: 1 | 2) => void;
  desktopColumns: 3 | 4;
  setDesktopColumns: (cols: 3 | 4) => void;
  currentSortLabel?: string;
}

export const ShopToolbar: React.FC<ShopToolbarProps> = ({
  productCount,
  activeFilterCount,
  onOpenFilter,
  onOpenSort,
  mobileColumns,
  setMobileColumns,
  desktopColumns,
  setDesktopColumns,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Catalogue options"
      className="sticky top-0 z-30 h-[52px] bg-white border-b border-[#E8E2D9] select-none text-[#1C1417] font-sans"
    >
      <div className="max-w-[1920px] mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LEFT: Plain text FILTER & SORT buttons */}
        <div className="flex items-center gap-5 sm:gap-7">
          {/* FILTER Button */}
          <button
            type="button"
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 text-[14px] font-medium tracking-[0.04em] uppercase hover:text-black transition-colors cursor-pointer focus:outline-none"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
            <span>FILTER</span>
            {activeFilterCount > 0 && (
              <span className="text-[12px] font-semibold text-[#B8924A]">
                ({activeFilterCount})
              </span>
            )}
          </button>

          {/* SORT Button */}
          <button
            type="button"
            onClick={onOpenSort}
            className="flex items-center gap-1.5 text-[14px] font-medium tracking-[0.04em] uppercase hover:text-black transition-colors cursor-pointer focus:outline-none"
            aria-label="Open sorting"
          >
            <ArrowUpDown className="w-4 h-4 stroke-[1.75]" />
            <span>SORT</span>
          </button>
        </div>

        {/* RIGHT: Product count + View toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Product count */}
          <span className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#1C1417]/70">
            {productCount} {productCount === 1 ? 'PRODUCT' : 'PRODUCTS'}
          </span>

          <div className="h-4 w-[1px] bg-[#E8E2D9] hidden sm:block" />

          {/* Mobile View Toggle (1-col vs 2-col) */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileColumns(1)}
              className={`p-1.5 transition-colors cursor-pointer ${
                mobileColumns === 1 ? 'text-[#1C1417]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              aria-label="1 column view"
              title="Single Column"
            >
              <Square className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileColumns(2)}
              className={`p-1.5 transition-colors cursor-pointer ${
                mobileColumns === 2 ? 'text-[#1C1417]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              aria-label="2 column view"
              title="Two Columns"
            >
              <Grid2X2 className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Desktop View Toggle (3-col vs 4-col) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDesktopColumns(3)}
              className={`p-1.5 text-[12px] font-medium tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                desktopColumns === 3 ? 'text-[#1C1417] font-semibold' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              aria-label="3 columns view"
              title="3 Columns"
            >
              <Grid3X3 className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-[11px]">3</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopColumns(4)}
              className={`p-1.5 text-[12px] font-medium tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                desktopColumns === 4 ? 'text-[#1C1417] font-semibold' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              aria-label="4 columns view"
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:inline text-[11px]">4</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

