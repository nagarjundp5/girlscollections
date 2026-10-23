'use client';

/**
 * SHAPE RULE GUIDELINE:
 * - CIRCLES = Category / discovery navigation
 * - ARCHES = Heritage / editorial storytelling sections (e.g. THE EDIT / ShopByCategoryBento)
 * - RECTANGLES = Product / shopping grids
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Flame } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

interface EditDestination {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  href: string;
  image: string;
}

const EDIT_DESTINATIONS: EditDestination[] = [
  {
    id: 'traditional',
    title: 'Traditional Couture',
    subtitle: 'Heritage Anarkalis, Kurta Suits & Pure Silk Drapes',
    eyebrow: 'CLASSIC SILHOUETTES',
    href: '/shop?category=all-kurta-sets',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200',
  },
  {
    id: 'festive',
    title: 'Festive Celebration',
    subtitle: 'Bridal Lehengas, Zari Gowns & Royal Festive Wear',
    eyebrow: 'CELEBRATION EDIT',
    href: '/shop?occasion=Festive',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'western',
    title: 'Western & Fusion',
    subtitle: 'Short Kurtis, Fusion Tops & Modern Skirts',
    eyebrow: 'CONTEMPORARY CHIC',
    href: '/shop?category=western-short-tops-or-short-kurtis',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
  },
];

export const TheEditSection: React.FC = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-ivory text-inkNavy border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8 sm:space-y-10">
        
        {/* Editorial Section Header */}
        <SectionHeader
          kicker="EDITORIAL DISCOVERY"
          title="THE EDIT"
          subtitle="Curated collection destinations spanning traditional craftsmanship, festive glamour, and western fusion."
          actionLabel="EXPLORE EDITS"
          actionHref="/shop"
        />

        {/* Asymmetric Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* 1. Large Arch Frame — Traditional Couture */}
          <div className="lg:col-span-7">
            <Link
              href={EDIT_DESTINATIONS[0].href}
              className="group relative block h-[380px] sm:h-[460px] lg:h-[520px] w-full rounded-t-[200px] sm:rounded-t-[240px] rounded-b-xl overflow-hidden arch-frame shadow-xl transition-all duration-500 hover:-translate-y-1 text-ivory"
            >
              <div className="arch-inner relative w-full h-full overflow-hidden">
                <Image
                  src={EDIT_DESTINATIONS[0].image}
                  alt={EDIT_DESTINATIONS[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-inkNavy/95 via-inkNavy/60 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                  <span className="eyebrow-text text-zariGoldLight font-semibold text-xs tracking-[0.2em] mb-1.5">
                    {EDIT_DESTINATIONS[0].eyebrow}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-serif font-bold text-ivory leading-tight group-hover:text-zariGoldLight transition-colors">
                    {EDIT_DESTINATIONS[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-ivory/80 mt-2 max-w-xl line-clamp-2">
                    {EDIT_DESTINATIONS[0].subtitle}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-zariGold">
                    <span>Explore Traditional Edit</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 2. Side-by-Side Column — Festive & Western */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 sm:gap-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 h-[260px] sm:h-[320px] lg:h-[360px]">
              
              {/* Festive Small Arch */}
              <Link
                href={EDIT_DESTINATIONS[1].href}
                className="group relative block h-full w-full rounded-t-[120px] rounded-b-lg overflow-hidden arch-frame shadow-md transition-all duration-500 hover:-translate-y-1 text-ivory"
              >
                <div className="arch-inner relative w-full h-full overflow-hidden">
                  <Image
                    src={EDIT_DESTINATIONS[1].image}
                    alt={EDIT_DESTINATIONS[1].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    sizes="25vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-inkNavy/95 via-inkNavy/50 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                    <span className="eyebrow-text text-zariGoldLight text-[9px] sm:text-[10px] tracking-[0.2em] mb-1">
                      {EDIT_DESTINATIONS[1].eyebrow}
                    </span>
                    <h4 className="text-base sm:text-xl font-serif font-bold text-ivory leading-tight group-hover:text-zariGoldLight transition-colors">
                      {EDIT_DESTINATIONS[1].title}
                    </h4>
                  </div>
                </div>
              </Link>

              {/* Western Small Arch */}
              <Link
                href={EDIT_DESTINATIONS[2].href}
                className="group relative block h-full w-full rounded-t-[120px] rounded-b-lg overflow-hidden arch-frame shadow-md transition-all duration-500 hover:-translate-y-1 text-ivory"
              >
                <div className="arch-inner relative w-full h-full overflow-hidden">
                  <Image
                    src={EDIT_DESTINATIONS[2].image}
                    alt={EDIT_DESTINATIONS[2].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    sizes="25vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-inkNavy/95 via-inkNavy/50 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                    <span className="eyebrow-text text-zariGoldLight text-[9px] sm:text-[10px] tracking-[0.2em] mb-1">
                      {EDIT_DESTINATIONS[2].eyebrow}
                    </span>
                    <h4 className="text-base sm:text-xl font-serif font-bold text-ivory leading-tight group-hover:text-zariGoldLight transition-colors">
                      {EDIT_DESTINATIONS[2].title}
                    </h4>
                  </div>
                </div>
              </Link>
            </div>

            {/* 3. Text Links for New Arrivals & Bestsellers Below */}
            <div className="p-5 sm:p-6 rounded-xl bg-sand/20 border border-zariGold/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <Link
                href="/shop?isNew=true"
                className="group flex-1 flex items-center justify-between p-3 rounded-lg bg-ivory border border-zariGold/20 hover:border-zariGold hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-zariGold shrink-0" />
                  <div>
                    <span className="block text-[10px] font-sans font-semibold text-zariGold tracking-widest uppercase">NEW ATELIER</span>
                    <span className="text-xs sm:text-sm font-serif font-bold text-inkNavy group-hover:text-zariGold transition-colors">Explore New Arrivals</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zariGold group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              <Link
                href="/shop?sort=popular"
                className="group flex-1 flex items-center justify-between p-3 rounded-lg bg-ivory border border-zariGold/20 hover:border-zariGold hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-zariGold shrink-0" />
                  <div>
                    <span className="block text-[10px] font-sans font-semibold text-zariGold tracking-widest uppercase">MOST LOVED</span>
                    <span className="text-xs sm:text-sm font-serif font-bold text-inkNavy group-hover:text-zariGold transition-colors">Explore Bestsellers</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zariGold group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default TheEditSection;
