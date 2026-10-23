'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DrapeCategory {
  id: string;
  name: string;
  count: string;
  image: string;
  slug: string;
}

const DRAPE_CATEGORIES: DrapeCategory[] = [
  {
    id: '1',
    name: 'Royal Silk Anarkalis',
    count: '42 Ensembles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
    slug: 'anarkalis',
  },
  {
    id: '2',
    name: 'Kids Pure Silk Pattu',
    count: '38 Outfits',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
    slug: 'pattu-frocks',
  },
  {
    id: '3',
    name: 'Bridal Zari Lehengas',
    count: '24 Designs',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
    slug: 'lehengas',
  },
  {
    id: '4',
    name: 'Organza & Chanderi Suits',
    count: '19 Outfits',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
    slug: 'anarkalis',
  },
  {
    id: '5',
    name: 'Designer Zari Gowns',
    count: '15 Silhouettes',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=85&w=800',
    slug: 'gowns',
  },
];

export const CategoryDrapeRail: React.FC = () => {
  return (
    <section className="w-full py-14 sm:py-20 md:py-28 bg-sand/30 border-y border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="eyebrow-text">SIGNATURE PALETTE</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-inkNavy mt-1">
            The Drape Rail
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-inkNavy/70 font-sans max-w-sm">
          Horizontal curations stepping down gracefully in silhouette, reflecting the fluid unfurling of a royal silk pallu.
        </p>
      </div>

      {/* Horizontally Swipeable Drape Rail (Mobile Snap-Scroll with peek) */}
      <div className="w-full overflow-x-auto no-scrollbar pl-6 sm:pl-12 pr-12 pb-4 scroll-smooth snap-x snap-mandatory">
        <div className="flex items-end gap-5 sm:gap-8 w-max">
          {DRAPE_CATEGORIES.map((cat, idx) => {
            // First tile is hero-weight (taller), subsequent tiles step down slightly
            const heightClasses =
              idx === 0
                ? 'h-[380px] sm:h-[460px] w-[260px] sm:w-[320px]'
                : idx === 1
                ? 'h-[340px] sm:h-[410px] w-[230px] sm:w-[280px]'
                : idx === 2
                ? 'h-[310px] sm:h-[370px] w-[210px] sm:w-[260px]'
                : 'h-[280px] sm:h-[340px] w-[200px] sm:w-[240px]';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`group relative snap-start shrink-0 rounded-t-[140px] overflow-hidden bg-woven-texture border border-zariGold/25 shadow-lg transition-all duration-500 hover:-translate-y-2 ${heightClasses}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/20 to-transparent p-6 flex flex-col justify-end text-ivory">
                  <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-zariGoldLight font-semibold mb-1">
                    {cat.count}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ivory group-hover:text-zariGoldLight transition-colors leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryDrapeRail;
