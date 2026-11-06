'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HeroCarousel from '@/components/home/HeroCarousel';
import CircularCategoryScroller from '@/components/home/CircularCategoryScroller';
import ShopByCategoryBento from '@/components/home/ShopByCategoryBento';
import ProductCarousel from '@/components/home/ProductCarousel';
import { Product } from '@/types';
import { DivisionPreference, getStoredPreference, setStoredPreference } from '@/lib/preference';

// Dynamically import chooser modal to avoid blocking LCP or adding to initial critical bundle
const PreferenceModal = dynamic(() => import('@/components/home/PreferenceModal'), {
  ssr: false,
});

const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'));

interface HomePageClientProps {
  trendingProducts: Product[];
  womenTrending?: Product[];
  kidsTrending?: Product[];
  newDrops: Product[];
  spotlightProduct: Product | null;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({
  trendingProducts,
  womenTrending = [],
  kidsTrending = [],
  newDrops,
}) => {
  const [pref, setPref] = useState<DivisionPreference>('all');
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Sync preference with localStorage / cookie on mount and set html[data-pref]
  useEffect(() => {
    const initial = getStoredPreference();
    setPref(initial);
    document.documentElement.setAttribute('data-pref', initial);

    const handlePrefChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ pref: DivisionPreference }>;
      if (customEvent.detail && customEvent.detail.pref) {
        setPref(customEvent.detail.pref);
        document.documentElement.setAttribute('data-pref', customEvent.detail.pref);
      }
    };

    window.addEventListener('tgc-pref-changed', handlePrefChanged);
    return () => window.removeEventListener('tgc-pref-changed', handlePrefChanged);
  }, []);

  const handlePreferenceChange = useCallback((newPref: DivisionPreference) => {
    if (newPref === pref) return;
    setIsCrossfading(true);
    setStoredPreference(newPref);
    setPref(newPref);
    document.documentElement.setAttribute('data-pref', newPref);
    setTimeout(() => {
      setIsCrossfading(false);
    }, 200);
  }, [pref]);

  // Fallbacks if one division is empty
  const activeWomenTrending = womenTrending.length > 0 ? womenTrending : trendingProducts;
  const activeKidsTrending = kidsTrending.length > 0 ? kidsTrending : trendingProducts;

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1417] selection:bg-[#F3DDE0] selection:text-[#1A1E3A] pb-16">
      {/* 
        HERO CAROUSEL:
        - Full-bleed edge-to-edge layout
        - Small round prev/next arrows on mobile (36px, 12px from edge) & desktop
        - Floating switch pill overlapping bottom edge
      */}
      <HeroCarousel
        filter={pref}
        onFilterChange={handlePreferenceChange}
      />

      {/* 
        Crossfading content wrapper:
        200ms opacity transition on preference switch, no scroll jump and no reload.
      */}
      <div
        style={{
          opacity: isCrossfading ? 0 : 1,
          transition: 'opacity 200ms ease',
        }}
        className="w-full flex flex-col"
      >
        {/* 
          CATEGORY CIRCLES STRIP:
          Directly under hero (with 28px extra top padding for pill clearance).
          Follows pref: Women / Kids / All
        */}
        <CircularCategoryScroller filter={pref} />

        {/* 
          DIVISION 1: WOMEN
          Toggled via html[data-pref="kids"] [data-division="women"] { display: none !important; }
        */}
        <div data-division="women" className="w-full flex flex-col">
          <ProductCarousel
            title={pref === 'women' ? 'Trending This Week' : "Women's Trending"}
            products={activeWomenTrending}
            variant="trending"
            filter="women"
            viewAllHref="/shop?target=women"
            viewAllLabel="VIEW ALL WOMEN"
          />

          <ShopByCategoryBento
            filter="women"
            title="Shop Women's Collection"
            viewAllHref="/shop?target=women"
            viewAllLabel="VIEW ALL WOMEN CATEGORIES"
          />
        </div>

        {/* 
          DIVISION 2: KIDS
          Toggled via html[data-pref="women"] [data-division="kids"] { display: none !important; }
        */}
        <div data-division="kids" className="w-full flex flex-col">
          <ProductCarousel
            title={pref === 'kids' ? 'Trending This Week' : "Kids' Trending"}
            products={activeKidsTrending}
            variant="trending"
            filter="kids"
            viewAllHref="/shop?target=kids"
            viewAllLabel="VIEW ALL KIDS"
          />

          <ShopByCategoryBento
            filter="kids"
            title="Shop Kids' Collection"
            viewAllHref="/shop?target=kids"
            viewAllLabel="VIEW ALL KIDS CATEGORIES"
          />
        </div>

        {/* 
          NEW IN:
          Follows active preference
        */}
        {newDrops && newDrops.length > 0 && (
          <ProductCarousel
            title="New In"
            products={newDrops}
            variant="new"
            filter={pref}
            viewAllHref={`/shop?sort=newest&target=${pref}`}
            viewAllLabel="VIEW ALL NEW DROPS"
          />
        )}

        {/* REVIEWS & PATRON TESTIMONIALS */}
        <TestimonialsSection />
      </div>

      {/* FIRST-VISIT CHOOSER MODAL (opens ~1s after load, only if no preference stored) */}
      <PreferenceModal onSelect={handlePreferenceChange} />
    </div>
  );
};

export default HomePageClient;
