'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowLeft, ArrowRight, History, Sparkles } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useScrollLock } from '@/lib/useScrollLock';
import { matchProducts, normalizeQuery, SearchableItem } from '@/lib/search/match';
import { CompactSearchItem } from '@/app/api/search/index/route';
import { WOMEN_CIRCLE_CATEGORIES, KIDS_CIRCLE_CATEGORIES } from '@/components/home/CircularCategoryScroller';
import { categoryHref } from '@/lib/categoryHref';

const STORAGE_KEY = 'tgc_recent_searches_v2';
const DEFAULT_TRENDING = [
  'Silk Anarkalis',
  'Bridal Lehengas',
  'Festive Organza',
  'Kids Pattu Frock',
  'Co-ord Sets',
  'Chanderi Kurtas',
];

export const SearchOverlay: React.FC = () => {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen } = useShop();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [targetPref, setTargetPref] = useState<'women' | 'kids'>('women');

  // Search catalog index
  const [catalogIndex, setCatalogIndex] = useState<CompactSearchItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Results state
  const [matchedProducts, setMatchedProducts] = useState<CompactSearchItem[]>([]);
  const [correctedTerm, setCorrectedTerm] = useState<string | undefined>(undefined);
  const [forceExactQuery, setForceExactQuery] = useState<string | null>(null);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useScrollLock(isSearchOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6));
      }
    } catch {}
  }, []);

  // Fetch compact search index when overlay opens (or on idle)
  useEffect(() => {
    if (!isSearchOpen) return;

    if (catalogIndex.length === 0 && !isLoadingIndex) {
      setIsLoadingIndex(true);
      fetch('/api/search/index')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.items)) {
            setCatalogIndex(data.items);
          }
        })
        .catch((err) => console.warn('Search index load note:', err))
        .finally(() => setIsLoadingIndex(false));
    }
  }, [isSearchOpen, catalogIndex.length, isLoadingIndex]);

  // Focus input automatically on open & reset state
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setDebouncedQuery('');
      setForceExactQuery(null);
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // 120ms debounce for typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setSelectedIndex(-1);
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Perform client-side matching using the typo-tolerant matching engine
  useEffect(() => {
    const activeSearch = forceExactQuery || debouncedQuery;
    if (activeSearch.length < 2 || catalogIndex.length === 0) {
      setMatchedProducts([]);
      setCorrectedTerm(undefined);
      return;
    }

    const { results, correctedQuery } = matchProducts(catalogIndex, activeSearch, {
      targetPreference: targetPref,
      limit: 6,
    });

    setMatchedProducts(results);
    setCorrectedTerm(forceExactQuery ? undefined : correctedQuery);

    // If zero results, log to capped Redis list
    if (results.length === 0) {
      fetch('/api/search/log-zero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeSearch }),
      }).catch(() => {});
    }
  }, [debouncedQuery, forceExactQuery, catalogIndex, targetPref]);

  const saveRecent = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeRecent = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearAllRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const handleSelectSearch = useCallback((searchTerm: string) => {
    saveRecent(searchTerm);
    setIsSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(searchTerm)}&target=${targetPref}`);
  }, [router, setIsSearchOpen, saveRecent, targetPref]);

  // Category suggestions matching query
  const matchedCategories = useMemo(() => {
    const q = normalizeQuery(debouncedQuery);
    if (q.length < 2) return [];

    const activeList = targetPref === 'kids' ? KIDS_CIRCLE_CATEGORIES : WOMEN_CIRCLE_CATEGORIES;
    return activeList
      .filter((c) => {
        const nameNorm = normalizeQuery(c.name);
        return nameNorm.includes(q) || q.includes(nameNorm);
      })
      .slice(0, 3);
  }, [debouncedQuery, targetPref]);

  // Keyboard navigation for live suggestions list
  const totalNavItems = matchedProducts.length + matchedCategories.length + (debouncedQuery.length >= 2 ? 1 : 0);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalNavItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalNavItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === -1 || selectedIndex === totalNavItems - 1) {
        handleSelectSearch(query);
      } else if (selectedIndex < matchedProducts.length) {
        const prod = matchedProducts[selectedIndex];
        saveRecent(prod.name);
        setIsSearchOpen(false);
        router.push(`/shop/${prod.slug}`);
      } else {
        const catIdx = selectedIndex - matchedProducts.length;
        const cat = matchedCategories[catIdx];
        if (cat) {
          saveRecent(cat.name);
          setIsSearchOpen(false);
          router.push(categoryHref(cat.slug, cat.group));
        }
      }
    }
  };

  // Matched part in bold helper
  const renderHighlightedName = (name: string, highlightQuery: string) => {
    const normName = normalizeQuery(name);
    const normQ = normalizeQuery(highlightQuery);
    const tokens = normQ.split(' ').filter(Boolean);

    if (tokens.length === 0) return <span>{name}</span>;

    // Build regex of tokens
    const regex = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = name.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <strong key={i} className="font-bold text-[#1C1417] bg-[#F4E4E2]/40 px-0.5 rounded">
              {part}
            </strong>
          ) : (
            <span key={i} className="text-[#1C1417]/90">{part}</span>
          )
        )}
      </span>
    );
  };

  if (!mounted || !isSearchOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      className="fixed inset-0 z-[120] bg-[#FBF7F1] flex flex-col overflow-hidden select-none"
    >
      {/* ── TOP BAR (60px) ─────────────────────────────────────────────────── */}
      <div className="h-[64px] border-b border-[#EFE7E2] px-3 sm:px-6 flex items-center gap-2 sm:gap-3 bg-[#FBF7F1] shrink-0 pt-[env(safe-area-inset-top,0px)]">
        {/* 44px Touch Target Back Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(false)}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-[#EFE7E2]/50 text-[#1C1417] active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Back to store"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* 48px Rounded White Input with 1px #EFE7E2 border */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setForceExactQuery(null);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search kurtas, lehengas, frocks..."
            className="w-full h-[48px] pl-10 pr-10 rounded-full bg-white border border-[#EFE7E2] text-[16px] font-sans text-[#1C1417] placeholder:text-[#8C7A70] outline-none focus:border-[#3B1230] focus:ring-1 focus:ring-[#3B1230] transition-all"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
                setForceExactQuery(null);
                inputRef.current?.focus();
              }}
              className="w-[44px] h-[44px] flex items-center justify-center absolute right-0 text-[#8C7A70] hover:text-[#1C1417] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-6 pb-[max(2rem,env(safe-area-inset-bottom,20px))]">
        {/* 1. WHILE TYPING (>1 char): LIVE SUGGESTIONS */}
        {debouncedQuery.length >= 2 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Typo Correction Header */}
            {correctedTerm && correctedTerm.toLowerCase() !== debouncedQuery.toLowerCase() && (
              <div className="bg-[#FAF6EE] border border-[#B8924A]/30 rounded-xl p-3 text-xs text-[#1C1417]">
                <span>Showing results for </span>
                <span className="font-bold text-[#3B1230] capitalize">{correctedTerm}</span>
                <span className="mx-2 text-[#8C7A70]">·</span>
                <button
                  type="button"
                  onClick={() => setForceExactQuery(debouncedQuery)}
                  className="text-[#B8924A] hover:underline cursor-pointer font-medium"
                >
                  Search for &lsquo;{debouncedQuery}&rsquo; instead
                </button>
              </div>
            )}

            {/* Results count & Quick Target Tabs */}
            <div className="flex items-center justify-between border-b border-[#EFE7E2] pb-2">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#8C7A70]">
                {matchedProducts.length > 0
                  ? `Suggestions (${matchedProducts.length})`
                  : 'No exact matches'}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTargetPref('women')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    targetPref === 'women'
                      ? 'bg-[#3B1230] text-white'
                      : 'bg-white border border-[#EFE7E2] text-[#1C1417]'
                  }`}
                >
                  Women
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPref('kids')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    targetPref === 'kids'
                      ? 'bg-[#3B1230] text-white'
                      : 'bg-white border border-[#EFE7E2] text-[#1C1417]'
                  }`}
                >
                  Kids
                </button>
              </div>
            </div>

            {/* Category matches if any */}
            {matchedCategories.length > 0 && (
              <div className="space-y-1">
                {matchedCategories.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={categoryHref(cat.slug, cat.group)}
                    onClick={() => {
                      saveRecent(cat.name);
                      setIsSearchOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border border-[#EFE7E2] bg-white hover:bg-[#FAF6EE] cursor-pointer transition-colors ${
                      selectedIndex === matchedProducts.length + idx ? 'ring-2 ring-[#3B1230]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#B8924A]/20 flex items-center justify-center text-[#B8924A]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C1417] capitalize">{cat.name}</p>
                        <p className="text-[10px] text-[#8C7A70] uppercase tracking-wider">in {cat.group}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C7A70]" />
                  </Link>
                ))}
              </div>
            )}

            {/* Product Rows (Up to 6) */}
            {matchedProducts.length > 0 ? (
              <div className="space-y-2">
                {matchedProducts.map((prod, idx) => (
                  <Link
                    key={prod.id}
                    href={`/shop/${prod.slug}`}
                    onClick={() => {
                      saveRecent(prod.name);
                      setIsSearchOpen(false);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border border-[#EFE7E2] bg-white hover:border-[#3B1230]/40 transition-all cursor-pointer ${
                      selectedIndex === idx ? 'ring-2 ring-[#3B1230] bg-[#FAF6EE]' : ''
                    }`}
                  >
                    {/* 56px Thumbnail */}
                    <div className="relative w-[56px] h-[56px] rounded-lg overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#EFE7E2]">
                      <Image
                        src={prod.img || '/hero/hero-saree-1.png'}
                        alt={prod.name}
                        fill
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1C1417] truncate leading-tight">
                        {renderHighlightedName(prod.name, debouncedQuery)}
                      </p>
                      <p className="text-[11px] text-[#8C7A70] truncate mt-0.5 capitalize">
                        {prod.catName || prod.cat} · {prod.div}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#1C1417] font-tnum">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.mrp && prod.mrp > prod.price && (
                          <span className="text-[10px] text-[#8C7A70] line-through font-tnum">
                            ₹{prod.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        {!prod.inStock && (
                          <span className="text-[9px] uppercase tracking-wider text-rose-600 font-bold">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#8C7A70] shrink-0 pr-1" />
                  </Link>
                ))}
              </div>
            ) : (
              /* Zero Results State */
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-[#1C1417]">
                  No products found for &lsquo;<strong>{debouncedQuery}</strong>&rsquo;
                </p>
                {correctedTerm && (
                  <p className="text-xs text-[#8C7A70]">
                    Did you mean{' '}
                    <button
                      type="button"
                      onClick={() => setQuery(correctedTerm)}
                      className="font-bold text-[#3B1230] underline cursor-pointer"
                    >
                      {correctedTerm}
                    </button>
                    ?
                  </p>
                )}
              </div>
            )}

            {/* Sticky "See all results" Button */}
            <div className="pt-2 sticky bottom-4">
              <button
                type="button"
                onClick={() => handleSelectSearch(debouncedQuery)}
                className="w-full h-[48px] rounded-xl bg-[#3B1230] text-white text-xs font-sans font-bold uppercase tracking-[0.16em] hover:bg-[#4E1A40] shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <span>See all results for &lsquo;{debouncedQuery}&rsquo;</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* 2. EMPTY STATE (NO QUERY) */
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* a) Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-[0.12em] text-[#1C1417]">
                    <History className="w-3.5 h-3.5 text-[#8C7A70]" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[11px] text-[#8C7A70] hover:text-[#3B1230] cursor-pointer font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      onClick={() => handleSelectSearch(item)}
                      className="h-[36px] pl-3 pr-2 rounded-full bg-white border border-[#EFE7E2] hover:border-[#3B1230] flex items-center gap-1.5 text-xs text-[#1C1417] cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecent(item, e)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#FAF6EE] text-[#8C7A70] hover:text-[#1C1417] cursor-pointer"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* b) Trending Chips (Solid, 14px, weight 500, dark text on blush #F4E4E2 with 1px border) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-[0.12em] text-[#1C1417]">
                <Sparkles className="w-3.5 h-3.5 text-[#B8924A]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TRENDING.map((trend) => (
                  <button
                    key={trend}
                    type="button"
                    onClick={() => handleSelectSearch(trend)}
                    className="h-[38px] px-3.5 rounded-full bg-[#F4E4E2] border border-[#E5D2D0] hover:border-[#3B1230] text-[14px] font-medium text-[#1C1417] flex items-center cursor-pointer transition-transform active:scale-95 shadow-2xs"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>

            {/* c) Women / Kids Quick Tabs */}
            <div className="flex items-center gap-2 border-b border-[#EFE7E2] pb-2">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.12em] text-[#1C1417]">
                Shop By Category
              </span>
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => setTargetPref('women')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    targetPref === 'women'
                      ? 'bg-[#3B1230] text-white'
                      : 'bg-white border border-[#EFE7E2] text-[#1C1417]'
                  }`}
                >
                  Women
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPref('kids')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    targetPref === 'kids'
                      ? 'bg-[#3B1230] text-white'
                      : 'bg-white border border-[#EFE7E2] text-[#1C1417]'
                  }`}
                >
                  Kids
                </button>
              </div>
            </div>

            {/* d) Shop by Category (2-row horizontal scroller of circular category images with labels) */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pb-2">
              {(targetPref === 'kids' ? KIDS_CIRCLE_CATEGORIES : WOMEN_CIRCLE_CATEGORIES)
                .slice(0, 8)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={categoryHref(cat.slug, cat.group)}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full border border-[#B8924A]/30 bg-white p-1 flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      {cat.image ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover object-top"
                            sizes="68px"
                          />
                        </div>
                      ) : (
                        <span className="font-serif text-sm font-bold text-[#B8924A]">
                          {cat.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="mt-1.5 text-[11px] font-sans font-medium text-[#1C1417] text-center line-clamp-1 group-hover:text-[#3B1230]">
                      {cat.line1} {cat.line2 || ''}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
