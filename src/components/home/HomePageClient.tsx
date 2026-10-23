'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import HeroCarousel from '@/components/home/HeroCarousel';
import HomepageFilterBar, { HomepageFilterOption } from '@/components/home/HomepageFilterBar';
import CircularCategoryScroller from '@/components/home/CircularCategoryScroller';
import BannerSectionDivider from '@/components/home/BannerSectionDivider';
import ShopByCategoryBento from '@/components/home/ShopByCategoryBento';
import ProductCarousel from '@/components/home/ProductCarousel';
import { Product } from '@/types';

const CategoryShowcaseRow = dynamic(() => import('@/components/home/CategoryShowcaseRow'));
const EditorialProductFeature = dynamic(() => import('@/components/home/EditorialProductFeature'));
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'));

interface HomePageClientProps {
  trendingProducts: Product[];
  newDrops: Product[];
  spotlightProduct: Product | null;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({
  trendingProducts,
  newDrops,
  spotlightProduct,
}) => {
  const [homepageFilter, setHomepageFilter] = useState<HomepageFilterOption>('all');

  return (
    <div className="w-full bg-ivory text-inkNavy selection:bg-blush selection:text-navy pb-20 sm:pb-12">
      {/* Slim sticky filter strip directly under header (ivory #FBF7F1 background, 44px tall) */}
      <div className="sticky top-0 z-30 w-full bg-[#FBF7F1] border-b border-[#EFE7E2] shadow-xs">
        <HomepageFilterBar
          activeFilter={homepageFilter}
          onFilterChange={(newFilter) => setHomepageFilter(newFilter)}
          isFloating={false}
        />
      </div>

      {/* Hero Carousel (starts cleanly below the filter strip) */}
      <div className="relative w-full h-[85vh] sm:h-screen sm:h-[100dvh] overflow-hidden">
        <HeroCarousel filter={homepageFilter} />
      </div>

      {/* CATEGORY UNIVERSE (Shop All / Women / Kids Circular Discovery) */}
      <CircularCategoryScroller filter={homepageFilter} />

      {/* FULL BLEED BANNER SECTION DIVIDER */}
      <BannerSectionDivider filter={homepageFilter} />

      {/* 5. ARCH COLLECTION (Driven by homepageFilter) */}
      <ShopByCategoryBento filter={homepageFilter} />

      {/* 6 & 7. TRENDING THIS WEEK (Driven by homepageFilter) */}
      <ProductCarousel
        title="Trending This Week"
        accentWord="This Week"
        eyebrow="MOST LOVED RIGHT NOW"
        products={trendingProducts}
        variant="trending"
        filter={homepageFilter}
        viewAllHref="/shop"
        viewAllLabel="EXPLORE TRENDING"
      />

      {/* REPEATED CATEGORY CARD GRID SHOWCASE */}
      <CategoryShowcaseRow
        eyebrow="EXPLORE BY CATEGORY"
        title="Handcrafted Wardrobe Showcase"
        accentWord="Handcrafted"
      />

      {/* EDITORIAL BREAK — SPOTLIGHT PRODUCT */}
      {spotlightProduct && (
        <EditorialProductFeature
          product={spotlightProduct}
          kicker="PIECE OF THE SEASON"
          narrative="Masterpiece artisan craftsmanship with signature hand detailing and tailored silhouettes designed for memorable celebrations."
        />
      )}

      {/* FULL BLEED BANNER SECTION DIVIDER */}
      <BannerSectionDivider filter={homepageFilter} />

      {/* NEW DROPS */}
      <ProductCarousel
        title="New Drops & Recent Arrivals"
        accentWord="Recent Arrivals"
        eyebrow="JUST ADDED"
        products={newDrops}
        variant="new"
        viewAllHref="/shop"
        viewAllLabel="VIEW ALL DROPS"
      />

      {/* PATRON STORIES & TESTIMONIALS */}
      <TestimonialsSection />
    </div>
  );
};

export default HomePageClient;
