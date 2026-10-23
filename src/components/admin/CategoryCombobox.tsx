'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Category } from '@/types';
import { Search, ChevronDown, Check, Sparkles, Layers } from 'lucide-react';

interface CategoryComboboxProps {
  categories: Category[];
  value: string; // selected category slug
  onChange: (categorySlug: string, category: Category | undefined) => void;
  required?: boolean;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  categories,
  value,
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Active categories only
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.is_active !== false);
  }, [categories]);

  // Selected category object
  const selectedCategory = useMemo(() => {
    return activeCategories.find((c) => c.slug === value);
  }, [activeCategories, value]);

  // Filter categories by query
  const filteredCategories = useMemo(() => {
    if (!query.trim()) return activeCategories;
    const q = query.toLowerCase().trim();
    return activeCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.parent_group && c.parent_group.toLowerCase().includes(q))
    );
  }, [activeCategories, query]);

  // Group filtered categories by age_group (ladies | kids | unisex), then by parent_group
  const groupedCategories = useMemo(() => {
    const ageGroups: Record<string, Record<string, Category[]>> = {
      ladies: {},
      kids: {},
      unisex: {},
    };

    filteredCategories.forEach((cat) => {
      const ageKey = cat.age_group || 'ladies';
      const parentKey = cat.parent_group || 'Other';
      if (!ageGroups[ageKey]) ageGroups[ageKey] = {};
      if (!ageGroups[ageKey][parentKey]) ageGroups[ageKey][parentKey] = [];
      ageGroups[ageKey][parentKey].push(cat);
    });

    return ageGroups;
  }, [filteredCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cat: Category) => {
    onChange(cat.slug, cat);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Combobox Trigger Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-zinc-50 border text-zinc-900 px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-all rounded-md ${
          isOpen
            ? 'bg-white border-zinc-950 ring-1 ring-zinc-950 shadow-sm'
            : 'border-zinc-200 hover:border-zinc-400'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedCategory ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-zinc-900 tracking-wide uppercase">
                {selectedCategory.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                {selectedCategory.age_group === 'kids' ? 'Kids' : 'Ladies'} • {selectedCategory.parent_group || 'General'}
              </span>
            </div>
          ) : (
            <span className="text-zinc-400 font-medium">
              [Select Category — Type to search]
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-zinc-900' : ''
          }`}
        />
      </div>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-zinc-200 rounded-lg shadow-2xl z-[150] max-h-96 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-3 border-b border-zinc-100 bg-zinc-50/70 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search category, e.g. Anarkali, Frock, Co-ord..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-900 focus:outline-none placeholder:text-zinc-400 font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-mono font-bold text-zinc-400 hover:text-zinc-900 px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grouped Category Options List */}
          <div className="overflow-y-auto p-2 space-y-4 divide-y divide-zinc-100">
            {filteredCategories.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 font-medium">
                No matching categories found for &quot;{query}&quot;.
              </div>
            ) : (
              (['ladies', 'kids', 'unisex'] as const).map((ageKey) => {
                const parentGroups = groupedCategories[ageKey];
                if (!parentGroups || Object.keys(parentGroups).length === 0) return null;

                const ageLabel = ageKey === 'ladies' ? 'LADIES' : ageKey === 'kids' ? 'KIDS' : 'UNISEX';

                return (
                  <div key={ageKey} className="pt-2 first:pt-0 space-y-2">
                    {/* Age Group Header */}
                    <div className="px-2 py-1 bg-zinc-900 text-white rounded text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-red" />
                        {ageLabel} CATEGORIES
                      </span>
                      <span className="font-mono text-[9px] text-zinc-300">
                        {Object.values(parentGroups).flat().length} items
                      </span>
                    </div>

                    {/* Parent Group Sub-Headers */}
                    {Object.entries(parentGroups).map(([parentName, catItems]) => (
                      <div key={parentName} className="space-y-1 pl-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 border-b border-zinc-100/60">
                          <Layers className="w-3 h-3 text-zinc-400" />
                          <span>{parentName}</span>
                        </div>

                        {/* Category Items */}
                        <div className="grid grid-cols-1 gap-1">
                          {catItems.map((cat) => {
                            const isSelected = cat.slug === value;
                            return (
                              <div
                                key={cat.id}
                                onClick={() => handleSelect(cat)}
                                className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-zinc-900 text-white font-bold'
                                    : 'text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
                                }`}
                              >
                                <span>{cat.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
