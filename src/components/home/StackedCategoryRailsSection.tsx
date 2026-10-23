'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '@/data/shopData';
import { ProductCard } from '../ProductCard';

interface CategoryRailConfig {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  categoryFilter: string | ((p: Product) => boolean);
  linkUrl: string;
  linkText: string;
}

const CATEGORY_RAILS: CategoryRailConfig[] = [
  {
    id: 'anarkali-silk-rail',
    title: 'Silk Anarkali Sets',
    eyebrow: 'HANDWOVEN SILK & ORGANZA',
    description: 'Royal Kanjeevaram anarkalis, gold zari borders, & handcrafted organza ensembles.',
    categoryFilter: (p) => p.category === 'anarkalis' || p.target === 'women',
    linkUrl: '/shop?category=anarkalis',
    linkText: 'View All Silk Anarkali Sets',
  },
  {
    id: 'anarkali-rail',
    title: 'Anarkali Suits & Kurtis',
    eyebrow: 'GOTA PATTI & MOTI WORK',
    description: 'Floor-length flowing silhouettes and detailed festive tunic edits.',
    categoryFilter: (p) => p.category === 'kurtis' || p.subcategory.includes('Kurti'),
    linkUrl: '/shop?category=kurtis',
    linkText: 'View All Anarkalis & Kurtis',
  },
  {
    id: 'lehenga-rail',
    title: 'Royal Lehengas & Gowns',
    eyebrow: 'HERITAGE PALACE EMBROIDERY',
    description: 'Zari kalis, sweetheart bustiers, & celebration festive lehengas.',
    categoryFilter: (p) => p.category === 'lehengas' || p.subcategory.includes('Lehenga'),
    linkUrl: '/shop?category=lehengas',
    linkText: 'View All Lehengas & Gowns',
  },
  {
    id: 'kids-rail',
    title: 'Little Royalty — Kids Ethnic',
    eyebrow: 'PATTU FROCKS & SOFT SILK',
    description: '100% cotton-lined non-scratchy pure silk frocks & boy dhoti sets.',
    categoryFilter: (p) => p.target === 'kids' || p.category === 'pattu-frocks' || p.category === 'kids-kurta',
    linkUrl: '/shop?target=kids',
    linkText: 'View All Kids Ethnic',
  },
  {
    id: 'indowestern-rail',
    title: 'Indo-Western & Co-ords',
    eyebrow: 'MODERN DRAPES & CAPES',
    description: 'Contemporary silhouetted drapes, cape sets, & peplum trouser ensembles.',
    categoryFilter: (p) => p.category === 'indo-western' || p.category === 'co-ords',
    linkUrl: '/shop?category=indo-western',
    linkText: 'View All Indo-Western',
  },
];

const SingleRail: React.FC<{ rail: CategoryRailConfig }> = ({ rail }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter products for this rail (fallback to all mock products sliced if filter has few matches)
  const filteredProducts = MOCK_PRODUCTS.filter(
    typeof rail.categoryFilter === 'function'
      ? rail.categoryFilter
      : (p) => p.category === rail.categoryFilter
  );
  const products = filteredProducts.length >= 3 ? filteredProducts : MOCK_PRODUCTS.slice(0, 5);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full space-y-4 border-t border-zariGold/35 pt-6 sm:pt-8"
    >
      {/* Rail Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zariGold/20 pb-3 gap-2">
        <div>
          <span className="eyebrow-text text-zariGold font-semibold text-[11px] sm:text-xs tracking-[0.2em] block mb-0.5">
            {rail.eyebrow}
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-inkNavy tracking-tight">
            {rail.title}
          </h3>
        </div>
        <p className="text-xs font-sans font-semibold text-inkNavy/70 max-w-md hidden sm:block">
          {rail.description}
        </p>
      </div>

      {/* Product Scroll Rail */}
      <div className="relative group/rail">
        {/* Desktop Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3 lg:-left-5 top-[38%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-inkNavy text-ivory border border-zariGold/40 shadow-xl items-center justify-center hover:bg-zariGold hover:text-inkNavy transition-all duration-300 opacity-0 group-hover/rail:opacity-100 focus:opacity-100"
          aria-label={`Scroll ${rail.title} left`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3 lg:-right-5 top-[38%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-inkNavy text-ivory border border-zariGold/40 shadow-xl items-center justify-center hover:bg-zariGold hover:text-inkNavy transition-all duration-300 opacity-0 group-hover/rail:opacity-100 focus:opacity-100"
          aria-label={`Scroll ${rail.title} right`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-3 px-1 -mx-1"
        >
          {products.map((product, idx) => (
            <motion.div
              key={`${rail.id}-${product.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="snap-start shrink-0 w-[78vw] sm:w-[260px] md:w-[calc((100%-36px)/3.2)] lg:w-[calc((100%-48px)/3.25)] min-w-[220px]"
            >
              <ProductCard product={product} priorityImage={idx === 0} variant="rail" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right-Aligned Category View All Link */}
      <div className="flex justify-end pt-1">
        <Link
          href={rail.linkUrl}
          className="group inline-flex items-center space-x-1.5 text-xs font-sans font-bold uppercase tracking-wider text-inkNavy hover:text-zariGold transition-colors"
        >
          <span>{rail.linkText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export const StackedCategoryRailsSection: React.FC = () => {
  return (
    <section className="w-full py-10 sm:py-16 md:py-20 bg-ivory border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12 sm:space-y-16">
        {CATEGORY_RAILS.map((rail) => (
          <SingleRail key={rail.id} rail={rail} />
        ))}
      </div>
    </section>
  );
};

export default StackedCategoryRailsSection;
