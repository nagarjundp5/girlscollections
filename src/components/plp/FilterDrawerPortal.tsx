'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/useScrollLock';

export interface DraftFilters {
  target: string[]; // 'women', 'kids'
  categories: string[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colours: string[];
  fabrics: string[];
  occasions: string[];
  discount: number; // 0, 10, 20, 30, 50
  inStockOnly: boolean;
}

export const EMPTY_DRAFT_FILTERS: DraftFilters = {
  target: [],
  categories: [],
  minPrice: 500,
  maxPrice: 35000,
  sizes: [],
  colours: [],
  fabrics: [],
  occasions: [],
  discount: 0,
  inStockOnly: false,
};

interface FilterDrawerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: DraftFilters;
  onApply: (draft: DraftFilters) => void;
  facetCounts?: {
    categories?: Record<string, number>;
    sizes?: Record<string, number>;
    colours?: Record<string, number>;
    fabrics?: Record<string, number>;
    occasions?: Record<string, number>;
  };
  totalCount?: number;
}

export const FilterDrawerPortal: React.FC<FilterDrawerPortalProps> = ({
  isOpen,
  onClose,
  appliedFilters,
  onApply,
  facetCounts = {},
  totalCount = 0,
}) => {
  // Local Draft State
  const [draft, setDraft] = useState<DraftFilters>(appliedFilters);
  const [tempMinPrice, setTempMinPrice] = useState<string>(String(appliedFilters.minPrice));
  const [tempMaxPrice, setTempMaxPrice] = useState<string>(String(appliedFilters.maxPrice));

  // Search queries for long lists
  const [categorySearch, setCategorySearch] = useState('');
  const [fabricSearch, setFabricSearch] = useState('');

  // Accordion open states (only the first one open by default: 'division')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    division: true,
    category: false,
    price: false,
    size: false,
    colour: false,
    fabric: false,
    occasion: false,
    discount: false,
    availability: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync draft whenever opened
  useEffect(() => {
    if (isOpen) {
      setDraft(appliedFilters);
      setTempMinPrice(String(appliedFilters.minPrice));
      setTempMaxPrice(String(appliedFilters.maxPrice));
      lockBodyScroll();

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        unlockBodyScroll();
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isOpen, appliedFilters, onClose]);

  // Count active draft selections
  const activeDraftCount = useMemo(() => {
    return (
      draft.target.length +
      draft.categories.length +
      draft.sizes.length +
      draft.colours.length +
      draft.fabrics.length +
      draft.occasions.length +
      (draft.discount > 0 ? 1 : 0) +
      (draft.inStockOnly ? 1 : 0) +
      (draft.minPrice > 500 || draft.maxPrice < 35000 ? 1 : 0)
    );
  }, [draft]);

  // Handlers for toggles
  const toggleArrayItem = (key: 'target' | 'categories' | 'sizes' | 'colours' | 'fabrics' | 'occasions', val: string) => {
    setDraft((prev) => {
      const arr = prev[key];
      const nextArr = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
      return { ...prev, [key]: nextArr };
    });
  };

  const handlePriceBlur = () => {
    const min = Math.max(0, Number(tempMinPrice) || 0);
    const max = Math.max(min, Number(tempMaxPrice) || 35000);
    setDraft((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const handleClearAll = () => {
    setDraft(EMPTY_DRAFT_FILTERS);
    setTempMinPrice('500');
    setTempMaxPrice('35000');
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  // Filtered lists for long categories & fabrics
  const categoryEntries = useMemo(() => {
    const entries = Object.entries(facetCounts.categories || {});
    if (!categorySearch) return entries;
    return entries.filter(([name]) => name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [facetCounts.categories, categorySearch]);

  const fabricEntries = useMemo(() => {
    const entries = Object.entries(facetCounts.fabrics || {});
    if (!fabricSearch) return entries;
    return entries.filter(([name]) => name.toLowerCase().includes(fabricSearch.toLowerCase()));
  }, [facetCounts.fabrics, fabricSearch]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter catalogue"
      className="fixed inset-0 z-[100] flex flex-col justify-end lg:justify-start font-sans select-none"
    >
      {/* Dim Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
      />

      {/* 
        Drawer Container:
        Desktop: left slide-in drawer (width 400px, full height)
        Mobile: bottom sheet (height 92dvh, rounded top)
      */}
      <div
        className="relative z-10 w-full lg:w-[400px] h-[92dvh] lg:h-full bg-white text-[#1C1417] shadow-2xl rounded-t-2xl lg:rounded-none flex flex-col overflow-hidden animate-in slide-in-from-bottom lg:slide-in-from-left duration-200"
      >
        {/* Sticky Header */}
        <div className="shrink-0 h-[56px] px-5 border-b border-neutral-200 flex items-center justify-between bg-white z-20">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-medium tracking-[0.04em] uppercase text-[#1C1417]">
              Filters
            </h2>
            {activeDraftCount > 0 && (
              <span className="text-[12px] font-semibold text-[#B8924A]">
                ({activeDraftCount})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Scrollable Accordions Body with overscroll-contain */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-neutral-200 overscroll-contain">
          
          {/* 1. DIVISION (WOMEN, KIDS) - Open by default */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('division')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Division
              </span>
              {openSections.division ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.division && (
              <div className="mt-3 flex gap-2">
                {[
                  { id: 'women', label: 'Women' },
                  { id: 'kids', label: 'Kids' },
                ].map((div) => {
                  const isChecked = draft.target.includes(div.id);
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => toggleArrayItem('target', div.id)}
                      className={`px-4 py-2 text-[13px] font-medium uppercase tracking-[0.04em] border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#1C1417] text-white border-[#1C1417]'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {div.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. CATEGORY */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Category
              </span>
              {openSections.category ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.category && (
              <div className="mt-3 space-y-2">
                {/* Search box inside long lists */}
                {Object.keys(facetCounts.categories || {}).length > 6 && (
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-neutral-200 outline-none focus:border-black font-sans"
                    />
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {categoryEntries.length === 0 ? (
                    <span className="text-[12px] text-neutral-400">No categories found</span>
                  ) : (
                    categoryEntries.map(([cat, count]) => {
                      const isChecked = draft.categories.includes(cat.toLowerCase());
                      return (
                        <label
                          key={cat}
                          className="flex items-center justify-between py-1 text-[13px] text-neutral-700 hover:text-black cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleArrayItem('categories', cat.toLowerCase())}
                              className="w-4 h-4 accent-[#1C1417] cursor-pointer"
                            />
                            <span className="capitalize">{cat.replace(/-/g, ' ')}</span>
                          </div>
                          <span className="text-[12px] text-neutral-400">({count})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. PRICE (Range slider + inputs, update draft on release/blur) */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Price Range
              </span>
              {openSections.price ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.price && (
              <div className="mt-3 space-y-3">
                <input
                  type="range"
                  min={500}
                  max={35000}
                  step={250}
                  value={draft.maxPrice}
                  onChange={(e) => setDraft((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                  onMouseUp={handlePriceBlur}
                  onTouchEnd={handlePriceBlur}
                  className="w-full accent-[#1C1417] cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center border border-neutral-300 px-2 py-1 text-[13px]">
                    <span className="text-neutral-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={tempMinPrice}
                      onChange={(e) => setTempMinPrice(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="w-full outline-none font-sans"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-neutral-400 text-xs">to</span>
                  <div className="flex-1 flex items-center border border-neutral-300 px-2 py-1 text-[13px]">
                    <span className="text-neutral-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="w-full outline-none font-sans"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. SIZES (Chips) */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('size')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Size
              </span>
              {openSections.size ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.size && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(facetCounts.sizes || {}).map(([sz, count]) => {
                  const isChecked = draft.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleArrayItem('sizes', sz)}
                      className={`min-w-[34px] h-[34px] px-2 text-[12px] font-medium uppercase border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#1C1417] text-white border-[#1C1417]'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      <span>{sz}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. COLOUR (Swatches) */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('colour')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Colour
              </span>
              {openSections.colour ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.colour && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(facetCounts.colours || {}).map(([c, count]) => {
                  const isChecked = draft.colours.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArrayItem('colours', c)}
                      className={`px-3 py-1.5 text-[12px] font-medium uppercase border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#1C1417] text-white border-[#1C1417]'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      <span>{c}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. FABRIC */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('fabric')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Fabric
              </span>
              {openSections.fabric ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.fabric && (
              <div className="mt-3 space-y-2">
                {Object.keys(facetCounts.fabrics || {}).length > 6 && (
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search fabrics..."
                      value={fabricSearch}
                      onChange={(e) => setFabricSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-neutral-200 outline-none focus:border-black font-sans"
                    />
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {fabricEntries.map(([fab, count]) => {
                    const isChecked = draft.fabrics.includes(fab);
                    return (
                      <label
                        key={fab}
                        className="flex items-center justify-between py-1 text-[13px] text-neutral-700 hover:text-black cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleArrayItem('fabrics', fab)}
                            className="w-4 h-4 accent-[#1C1417] cursor-pointer"
                          />
                          <span>{fab}</span>
                        </div>
                        <span className="text-[12px] text-neutral-400">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 7. OCCASION */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('occasion')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Occasion
              </span>
              {openSections.occasion ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.occasion && (
              <div className="mt-3 space-y-1.5">
                {Object.entries(facetCounts.occasions || {}).map(([occ, count]) => {
                  const isChecked = draft.occasions.includes(occ);
                  return (
                    <label
                      key={occ}
                      className="flex items-center justify-between py-1 text-[13px] text-neutral-700 hover:text-black cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleArrayItem('occasions', occ)}
                          className="w-4 h-4 accent-[#1C1417] cursor-pointer"
                        />
                        <span>{occ}</span>
                      </div>
                      <span className="text-[12px] text-neutral-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 8. DISCOUNT */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection('discount')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                Discount
              </span>
              {openSections.discount ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {openSections.discount && (
              <div className="mt-3 space-y-2">
                {[10, 20, 30, 50].map((d) => (
                  <label
                    key={d}
                    className="flex items-center gap-2 text-[13px] text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="discount"
                      checked={draft.discount === d}
                      onChange={() => setDraft((p) => ({ ...p, discount: p.discount === d ? 0 : d }))}
                      className="w-4 h-4 accent-[#1C1417] cursor-pointer"
                    />
                    <span>{d}% and above</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 9. AVAILABILITY */}
          <div className="py-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[14px] font-medium uppercase tracking-[0.04em] text-[#1C1417]">
                In Stock Only
              </span>
              <input
                type="checkbox"
                checked={draft.inStockOnly}
                onChange={(e) => setDraft((p) => ({ ...p, inStockOnly: e.target.checked }))}
                className="w-4 h-4 accent-[#1C1417] cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Sticky Footer: "Clear All" + "Apply (N)" */}
        <div className="shrink-0 p-4 border-t border-neutral-200 bg-white flex items-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-1/3 py-3 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-[12px] font-sans font-medium uppercase tracking-[0.1em] transition-colors cursor-pointer"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 bg-[#1C1417] text-white hover:bg-black text-[12px] font-sans font-medium uppercase tracking-[0.1em] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Apply</span>
            {activeDraftCount > 0 && <span>({activeDraftCount})</span>}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

