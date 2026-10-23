'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { WOMEN_MASTER_SIZES, KIDS_MASTER_SIZES, MASTER_ATTRIBUTES_SEED } from '@/data/masterSizes';

export interface FilterState {
  category: string[];
  target: string[];
  occasion: string[];
  size: string[];
  age: string[];
  colour: string[];
  fabric: string[];
  style: string[];
  workType: string[];
  sleeve: string[];
  neckline: string[];
  discount: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  productCounts?: Record<string, number>;
}

const AGE_GROUPS = [
  { label: '0 - 12 Months', values: ['0-3M', '3-6M', '6-9M', '9-12M'] },
  { label: '1 - 4 Years', values: ['1-2Y', '2-3Y', '3-4Y'] },
  { label: '4 - 8 Years', values: ['4-5Y', '5-6Y', '6-7Y', '7-8Y'] },
  { label: '8 - 12 Years', values: ['8-9Y', '9-10Y', '10-11Y', '11-12Y'] },
  { label: '12 - 16 Years', values: ['12-13Y', '13-14Y', '14-15Y', '15-16Y'] },
];

const DISCOUNT_OPTIONS = [
  { label: '10% and above', value: '10' },
  { label: '20% and above', value: '20' },
  { label: '30% and above', value: '30' },
  { label: '50% and above', value: '50' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  productCounts = {},
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    target: true,
    occasion: true,
    age: true,
    size: true,
    colour: true,
    fabric: true,
    style: false,
    workType: false,
    sleeve: false,
    neckline: false,
    discount: false,
    availability: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleArrayToggle = (key: keyof FilterState, val: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter((item) => item !== val)
      : [...current, val];
    onChange({ ...filters, [key]: updated });
  };

  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, priceRange: [min, max] });
  };

  // Group attributes by type from Master Attributes
  const occasions = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'occasion');
  const fabrics = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'fabric');
  const styles = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'style');
  const workTypes = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'work_type');
  const sleeves = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'sleeve');
  const necklines = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'neckline');
  const colours = MASTER_ATTRIBUTES_SEED.filter((a) => a.type === 'colour');

  return (
    <aside className="w-full space-y-5 text-[#1A1A2E] font-sans text-xs select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#B8924A]/25">
        <div>
          <span className="font-sans font-bold text-[9px] text-[#B8924A] tracking-[0.2em] uppercase block">
            REFINE CATALOGUE
          </span>
          <h4 className="text-sm font-serif font-semibold text-[#1A1E3A]">Filters & Attributes</h4>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-[11px] text-[#B8924A] hover:text-[#1A1E3A] transition-colors font-sans font-medium uppercase tracking-wider cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* 1. PRICE RANGE SLIDER (MIN / MAX IN ₹) */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Price Range
          </span>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.price && (
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-medium text-[#1A1E3A]">
              <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={500}
              max={30000}
              step={250}
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
              className="w-full accent-[#B8924A] cursor-pointer"
            />
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 flex items-center border border-[#B8924A]/30 rounded-md px-2 py-1 bg-white">
                <span className="text-[10px] text-[#6B6B7B] mr-1">₹</span>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                  className="w-full text-xs font-mono outline-none bg-transparent"
                  placeholder="Min"
                />
              </div>
              <span className="text-[#6B6B7B] text-xs">to</span>
              <div className="flex-1 flex items-center border border-[#B8924A]/30 rounded-md px-2 py-1 bg-white">
                <span className="text-[10px] text-[#6B6B7B] mr-1">₹</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                  className="w-full text-xs font-mono outline-none bg-transparent"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. OCCASION */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Occasion
          </span>
          {openSections.occasion ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.occasion && (
          <div className="space-y-2 pt-2.5">
            {occasions.map((occ) => {
              const isSelected = filters.occasion.includes(occ.name);
              const count = productCounts[occ.name] || 0;
              return (
                <label key={occ.slug} className="flex items-center justify-between cursor-pointer py-0.5 hover:text-[#B8924A]">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('occasion', occ.name)}
                      className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                    />
                    <span className={`text-xs ${isSelected ? 'font-semibold text-[#1A1E3A]' : 'text-[#6B6B7B]'}`}>
                      {occ.name}
                    </span>
                  </div>
                  {count > 0 && <span className="text-[10px] text-[#6B6B7B]">({count})</span>}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. AGE (KIDS) */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('age')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Age (Kids Ethnic)
          </span>
          {openSections.age ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.age && (
          <div className="pt-2.5 space-y-2.5">
            {AGE_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B8924A] block">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.values.map((v) => {
                    const isSelected = filters.age.includes(v);
                    return (
                      <button
                        key={v}
                        onClick={() => handleArrayToggle('age', v)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A1E3A] text-white border-[#1A1E3A]'
                            : 'bg-white text-[#1A1A2E] border-[#B8924A]/25 hover:border-[#B8924A]'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SIZE (WOMEN ALPHA & NUMERIC) */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Women&apos;s Size
          </span>
          {openSections.size ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.size && (
          <div className="pt-2.5 flex flex-wrap gap-1.5">
            {WOMEN_MASTER_SIZES.map((sz) => {
              const isSelected = filters.size.includes(sz.code);
              return (
                <button
                  key={sz.code}
                  onClick={() => handleArrayToggle('size', sz.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1A1E3A] text-white border-[#1A1E3A]'
                      : 'bg-white text-[#1A1A2E] border-[#B8924A]/25 hover:border-[#B8924A]'
                  }`}
                  title={sz.label}
                >
                  {sz.code}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. COLOUR SWATCHES */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('colour')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Colour Swatches
          </span>
          {openSections.colour ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.colour && (
          <div className="pt-2.5 grid grid-cols-4 gap-2">
            {colours.map((col) => {
              const isSelected = filters.colour.includes(col.name);
              return (
                <button
                  key={col.slug}
                  onClick={() => handleArrayToggle('colour', col.name)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected ? 'border-[#1A1E3A] bg-black/5 ring-1 ring-[#1A1E3A]' : 'border-transparent hover:bg-black/5'
                  }`}
                  title={col.name}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/15 shadow-xs"
                    style={{ backgroundColor: col.hex_code || '#FAF6EE' }}
                  />
                  <span className="text-[9.5px] truncate max-w-full text-center text-[#6B6B7B]">
                    {col.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. FABRIC */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('fabric')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Fabric
          </span>
          {openSections.fabric ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.fabric && (
          <div className="space-y-2 pt-2.5">
            {fabrics.map((fab) => {
              const isSelected = filters.fabric.includes(fab.name);
              return (
                <label key={fab.slug} className="flex items-center justify-between cursor-pointer py-0.5 hover:text-[#B8924A]">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('fabric', fab.name)}
                      className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                    />
                    <span className={`text-xs ${isSelected ? 'font-semibold text-[#1A1E3A]' : 'text-[#6B6B7B]'}`}>
                      {fab.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. STYLE / SILHOUETTE */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('style')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Style &amp; Silhouette
          </span>
          {openSections.style ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.style && (
          <div className="space-y-2 pt-2.5">
            {styles.map((st) => (
              <label key={st.slug} className="flex items-center space-x-2 cursor-pointer py-0.5 hover:text-[#B8924A]">
                <input
                  type="checkbox"
                  checked={filters.style.includes(st.name)}
                  onChange={() => handleArrayToggle('style', st.name)}
                  className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                />
                <span className="text-xs text-[#6B6B7B]">{st.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 8. WORK TYPE */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('workType')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Work &amp; Craftsmanship
          </span>
          {openSections.workType ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.workType && (
          <div className="space-y-2 pt-2.5">
            {workTypes.map((wt) => (
              <label key={wt.slug} className="flex items-center space-x-2 cursor-pointer py-0.5 hover:text-[#B8924A]">
                <input
                  type="checkbox"
                  checked={filters.workType.includes(wt.name)}
                  onChange={() => handleArrayToggle('workType', wt.name)}
                  className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                />
                <span className="text-xs text-[#6B6B7B]">{wt.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 9. SLEEVE & NECKLINE */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('sleeve')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Sleeve &amp; Neckline
          </span>
          {openSections.sleeve ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.sleeve && (
          <div className="space-y-3 pt-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#B8924A] block mb-1">Sleeves</span>
              <div className="space-y-1.5">
                {sleeves.map((sl) => (
                  <label key={sl.slug} className="flex items-center space-x-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={filters.sleeve.includes(sl.name)}
                      onChange={() => handleArrayToggle('sleeve', sl.name)}
                      className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                    />
                    <span className="text-xs text-[#6B6B7B]">{sl.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#B8924A] block mb-1">Necklines</span>
              <div className="space-y-1.5">
                {necklines.map((nl) => (
                  <label key={nl.slug} className="flex items-center space-x-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={filters.neckline.includes(nl.name)}
                      onChange={() => handleArrayToggle('neckline', nl.name)}
                      className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                    />
                    <span className="text-xs text-[#6B6B7B]">{nl.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 10. DISCOUNT */}
      <div className="border-b border-[#B8924A]/15 pb-4">
        <button
          onClick={() => toggleSection('discount')}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="font-serif font-semibold text-sm text-[#1A1E3A] group-hover:text-[#B8924A] transition-colors">
            Discount
          </span>
          {openSections.discount ? <ChevronUp className="w-3.5 h-3.5 text-[#B8924A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#B8924A]" />}
        </button>
        {openSections.discount && (
          <div className="space-y-2 pt-2.5">
            {DISCOUNT_OPTIONS.map((disc) => (
              <label key={disc.value} className="flex items-center space-x-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={filters.discount.includes(disc.value)}
                  onChange={() => handleArrayToggle('discount', disc.value)}
                  className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-3.5 h-3.5"
                />
                <span className="text-xs text-[#6B6B7B]">{disc.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 11. AVAILABILITY */}
      <div className="pb-2">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="font-serif font-semibold text-sm text-[#1A1E3A]">In Stock Pieces Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded border-[#B8924A]/40 text-[#1A1E3A] focus:ring-[#B8924A] accent-[#B8924A] w-4 h-4"
          />
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
