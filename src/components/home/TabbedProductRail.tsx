'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/data/shopData';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';

interface TabbedProductRailProps {
  products: Product[];
}

type TargetTab = 'ALL' | 'WOMEN' | 'KIDS';

export const TabbedProductRail: React.FC<TabbedProductRailProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<TargetTab>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter products based on selected tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'WOMEN') {
      return products.filter((p) => p.target === 'women');
    }
    if (activeTab === 'KIDS') {
      return products.filter((p) => p.target === 'kids');
    }
    return products;
  }, [products, activeTab]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 240;
    const index = Math.round(container.scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.max(0, Math.min(index, filteredProducts.length - 1)));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const totalCount = filteredProducts.length;
  const formattedCounter = `0${Math.min(activeIndex + 1, totalCount)} / 0${totalCount}`;
  const progressPercent = totalCount > 0 ? ((activeIndex + 1) / totalCount) * 100 : 0;

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-ivory text-inkNavy border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Header & Tab Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <SectionHeader
            kicker="FEATURED SHOPPING"
            title="From the Collection"
            subtitle="Explore handcrafted ensembles across Women's everyday, festive, and Kids collections."
          />

          {/* Target Filter Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 self-start md:self-auto p-1 rounded-lg bg-sand/20 border border-zariGold/20 shrink-0">
            {(['ALL', 'WOMEN', 'KIDS'] as TargetTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveIndex(0);
                    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
                  }}
                  className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-inkNavy text-white shadow-md'
                      : 'text-inkNavy/70 hover:text-zariGold hover:bg-ivory/50'
                  }`}
                >
                  {tab === 'ALL' ? 'SHOP ALL' : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Above Mobile Rail */}
        <div className="flex md:hidden items-center justify-between mb-3 px-1">
          <span className="font-serif font-semibold text-xs text-zariGold tracking-widest uppercase">
            {activeTab === 'ALL' ? 'ALL COLLECTIONS' : `${activeTab} EDIT`}
          </span>
          <span className="font-serif font-bold text-xs text-inkNavy/70 tracking-widest font-tnum">
            {formattedCounter}
          </span>
        </div>

        {/* Rail Container with Controls */}
        <div className="relative group/railScroll">
          
          {/* Desktop Left/Right Scroll Arrows */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-inkNavy/90 text-ivory border border-zariGold/40 shadow-lg items-center justify-center hover:bg-zariGold hover:text-white transition-all duration-300 cursor-pointer"
            aria-label="Scroll rail left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-inkNavy/90 text-ivory border border-zariGold/40 shadow-lg items-center justify-center hover:bg-zariGold hover:text-white transition-all duration-300 cursor-pointer"
            aria-label="Scroll rail right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Scroll Rail */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 px-4 -mx-4 sm:px-0 sm:mx-0"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[82vw] sm:w-[260px] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-72px)/4.25)] h-[400px] sm:h-[440px]"
              >
                <ProductCard product={product} variant="rail" />
              </div>
            ))}
          </div>

          {/* Thin Progress Line on Mobile */}
          <div className="w-full md:hidden h-[2px] bg-zariGold/20 mt-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-zariGold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* View All Footer Link */}
        <div className="mt-8 flex justify-end">
          <Link
            href={
              activeTab === 'WOMEN'
                ? '/shop?target=women'
                : activeTab === 'KIDS'
                ? '/shop?target=kids'
                : '/shop'
            }
            className="group inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-zariGold hover:text-inkNavy transition-colors"
          >
            <span>VIEW ALL {activeTab === 'ALL' ? 'PRODUCTS' : `${activeTab} ENSEMBLES`}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TabbedProductRail;
