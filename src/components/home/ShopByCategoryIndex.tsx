'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SHOP_BY_CATEGORY_ITEMS } from '@/data/categoryTaxonomy';

import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

export const ShopByCategoryIndex: React.FC = () => {
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.editorial-tile', stagger: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="shop-category-index"
      className="w-full bg-ivory text-navy py-16 sm:py-24 border-b border-navy/10 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Left-Aligned Navy Serif Header + Right Rose Gold Link */}
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-navy/10 pb-4">
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy leading-tight tracking-tight">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-roseGold hover:text-navy transition-colors shrink-0 group"
          >
            <span>Explore Full Index</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* --- DESKTOP ASYMMETRIC TILE GRID --- */}
        <div className="hidden md:grid grid-cols-4 gap-4 sm:gap-5 auto-rows-[260px] lg:auto-rows-[300px]">
          {SHOP_BY_CATEGORY_ITEMS.map((item, idx) => {
            const spanClass =
              idx === 0
                ? 'col-span-2 row-span-2'
                : idx === 1
                ? 'col-span-2 row-span-1'
                : 'col-span-1 row-span-1';

            return (
              <Link
                key={item.id}
                href={`/shop?category=${item.slug}`}
                className={`editorial-tile group relative rounded-sm overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 bg-navy-dark border border-navy/10 ${spanClass}`}
              >
                {/* Full-Bleed Imagery */}
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800'}
                  alt={item.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  priority={idx === 0}
                />

                {/* Bottom Scrim & Serif Display Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent p-5 lg:p-7 flex flex-col justify-end text-ivory">
                  <h3 className="text-xl lg:text-3xl font-serif font-bold text-ivory tracking-tight group-hover:text-roseGold transition-colors leading-tight">
                    {item.name}
                  </h3>
                  <div className="mt-1.5 flex items-center text-[11px] font-sans font-medium text-roseGold uppercase tracking-[0.16em] opacity-90 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* --- MOBILE EDITORIAL FLOW --- */}
        <div className="flex flex-col md:hidden space-y-4">
          {SHOP_BY_CATEGORY_ITEMS.map((item, idx) => (
            <Link
              key={item.id}
              href={`/shop?category=${item.slug}`}
              className={`editorial-tile group relative w-full rounded-sm overflow-hidden shadow-xs active:scale-[0.99] transition-all bg-navy-dark border border-navy/10 ${
                idx === 0 ? 'aspect-[4/5]' : 'aspect-[16/10]'
              }`}
            >
              <Image
                src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800'}
                alt={item.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-transparent p-5 flex flex-col justify-end text-ivory">
                <h3 className="text-2xl font-serif font-bold text-ivory tracking-tight">
                  {item.name}
                </h3>
                <span className="text-[11px] font-sans font-medium text-roseGold uppercase tracking-[0.16em] block mt-1">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategoryIndex;
