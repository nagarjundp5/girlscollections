'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, TrendingUp, History, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { MOCK_PRODUCTS, Product } from '@/data/shopData';

const TRENDING_TAGS = [
  'Silk Anarkalis',
  'Wedding Lehengas',
  'Festive Organza',
  'Kids Pure Silk Pattu',
  'Zari Lehengas',
];

const OCCASION_TILES = [
  { label: 'Wedding', query: 'lehenga' },
  { label: 'Reception', query: 'anarkali' },
  { label: 'Festive', query: 'organza' },
  { label: 'Everyday', query: 'pattu' },
];

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useShop();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tgc_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = [searchTerm, ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('tgc_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            const formatted: Product[] = data.products.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              category: p.category || 'ethnic-wear',
              target: (p.gender === 'kids' || p.category?.includes('kids')) ? 'kids' : 'women',
              subcategory: p.subcategory || p.category || '',
              occasion: p.occasion || 'Festive',
              price: p.price > 10000 ? Math.round(p.price / 100) : p.price,
              originalPrice: p.compare_price ? (p.compare_price > 10000 ? Math.round(p.compare_price / 100) : p.compare_price) : undefined,
              isNew: true,
              isBestSeller: !!p.is_featured,
              isSale: !!p.compare_price,
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
              sizes: [{ size: 'Free Size', inStock: true }],
              colors: [{ name: 'Standard', hex: '#C9A66B' }],
              fabric: p.description || '',
              description: p.description || '',
              careInstructions: ['Dry Clean Only'],
              rating: 5.0,
              reviewsCount: 10,
            }));
            setDbProducts(formatted);
          }
        }
      } catch (e) {
        console.error('Failed to load search products:', e);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const q = query.toLowerCase();
      const pool = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;
      const filtered = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          (p.fabric && p.fabric.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
      setResults(filtered);
    }
  }, [query, dbProducts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[105] flex flex-col bg-inkNavy/95 backdrop-blur-xl text-ivory animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Top Bar Header */}
      <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-12 pt-8 pb-4 flex items-center justify-between border-b border-zariGold/20">
        <span className="font-sans font-semibold text-xs text-zariGold tracking-[0.25em] uppercase">
          WHAT ARE YOU LOOKING FOR?
        </span>
        <button
          onClick={() => setIsSearchOpen(false)}
          className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center text-ivory hover:bg-zariGold hover:text-white transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Stage */}
      <div className="max-w-4xl mx-auto w-full px-6 sm:px-12 py-8 sm:py-12">
        <div className="relative flex items-center border-b-2 border-zariGold/60 pb-3">
          <Search className="w-7 h-7 text-zariGold mr-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                saveRecentSearch(query.trim());
              }
            }}
            placeholder="Search anarkalis, pattu frocks, lehengas, kurtis..."
            autoFocus
            className="w-full bg-transparent text-xl sm:text-3xl text-ivory placeholder-ivory/40 focus:outline-none font-serif tracking-tight"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-ivory/60 hover:text-ivory p-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Pre-typing suggestions */}
        {query.trim() === '' && (
          <div className="mt-10 space-y-8">
            
            {/* Recent Searches (If any) */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-sans font-semibold text-zariGold tracking-[0.2em] uppercase mb-3">
                  <History className="w-4 h-4" />
                  <span>RECENT SEARCHES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3.5 py-1.5 rounded-md bg-ivory/10 border border-zariGold/20 text-xs font-sans text-ivory/80 hover:bg-zariGold hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Tags */}
            <div>
              <div className="flex items-center gap-2 text-xs font-sans font-semibold text-zariGold tracking-[0.2em] uppercase mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>TRENDING</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      saveRecentSearch(tag);
                    }}
                    className="px-4 py-2 rounded-md bg-ivory/10 border border-zariGold/30 text-xs font-sans font-medium text-ivory/90 hover:bg-zariGold hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop by Occasion Tiles */}
            <div>
              <div className="text-xs font-sans font-semibold text-zariGold tracking-[0.2em] uppercase mb-3">
                SHOP BY OCCASION
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OCCASION_TILES.map((occ) => (
                  <button
                    key={occ.label}
                    onClick={() => {
                      setQuery(occ.query);
                      saveRecentSearch(occ.label);
                    }}
                    className="p-4 rounded-xl bg-ivory/5 border border-zariGold/20 hover:border-zariGold hover:bg-zariGold/10 text-left transition-all group"
                  >
                    <span className="font-serif font-bold text-sm text-ivory group-hover:text-zariGold block">
                      {occ.label}
                    </span>
                    <span className="text-[10px] font-sans text-ivory/60 block mt-0.5 uppercase tracking-wider">
                      Explore →
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Real-time Search Results */}
        {query.trim() !== '' && (
          <div className="mt-10">
            <div className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-zariGold mb-6">
              RESULTS FOR &quot;{query}&quot; ({results.length} piece{results.length !== 1 ? 's' : ''})
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center text-ivory/60 font-serif text-lg">
                No items match your search. Try searching for &quot;Anarkali&quot;, &quot;Pattu Frock&quot;, or &quot;Lehenga&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={() => {
                      saveRecentSearch(query);
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center p-3 rounded-xl bg-ivory/5 border border-zariGold/20 hover:bg-zariGold/10 transition-all"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-sand/20">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <span className="font-sans text-[9px] text-zariGold tracking-wider uppercase block">
                        {product.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-sans font-medium text-ivory truncate group-hover:text-zariGold transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs font-sans font-bold text-zariGold mt-1 font-tnum">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zariGold/60 group-hover:text-zariGold group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchOverlay;
