'use client';

import React from 'react';
import { X } from 'lucide-react';
import { DraftFilters } from './FilterDrawerPortal';

interface ActiveFilterChipsProps {
  filters: DraftFilters;
  onRemove: (type: keyof DraftFilters, value?: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  const chips: Array<{ label: string; type: keyof DraftFilters; val?: string }> = [];

  filters.target.forEach((t) => chips.push({ label: t === 'women' ? 'Women' : 'Kids', type: 'target', val: t }));
  filters.categories.forEach((c) => chips.push({ label: c.replace(/-/g, ' '), type: 'categories', val: c }));
  filters.sizes.forEach((s) => chips.push({ label: `Size: ${s}`, type: 'sizes', val: s }));
  filters.colours.forEach((c) => chips.push({ label: c, type: 'colours', val: c }));
  filters.fabrics.forEach((f) => chips.push({ label: f, type: 'fabrics', val: f }));
  filters.occasions.forEach((o) => chips.push({ label: o, type: 'occasions', val: o }));
  if (filters.discount > 0) chips.push({ label: `${filters.discount}%+ off`, type: 'discount' });
  if (filters.inStockOnly) chips.push({ label: 'In Stock', type: 'inStockOnly' });
  if (filters.minPrice > 500 || filters.maxPrice < 35000) {
    chips.push({ label: `₹${filters.minPrice} - ₹${filters.maxPrice}`, type: 'minPrice' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-[#E8E2D9] px-3 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar font-sans select-none">
      <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-neutral-400 shrink-0">
        Filtered by:
      </span>

      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onRemove(chip.type, chip.val)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#1C1417] text-[12px] font-sans font-medium uppercase tracking-[0.02em] transition-colors cursor-pointer shrink-0"
        >
          <span>{chip.label}</span>
          <X className="w-3.5 h-3.5 text-neutral-500 hover:text-black" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#B8924A] hover:text-[#1C1417] transition-colors cursor-pointer shrink-0 ml-1 underline underline-offset-4"
      >
        Clear All
      </button>
    </div>
  );
};

