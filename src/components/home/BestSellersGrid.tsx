'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/shopData';
import { ProductCard } from '../ProductCard';
import { ArrowRight } from 'lucide-react';

export const BestSellersGrid: React.FC = () => {
  const bestSellers = MOCK_PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section
      id="best-sellers"
      className="py-16 sm:py-24 bg-ivory text-navy border-b border-roseGold/20 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 sm:mb-12 border-b border-roseGold/20 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-roseGold font-sans font-semibold">
              Most Coveted
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy mt-1">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center text-xs font-bold uppercase tracking-widest text-roseGold hover:text-navy transition-colors"
          >
            <span>Explore All Best Sellers</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* 2 Col Mobile, 4 Col Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersGrid;
