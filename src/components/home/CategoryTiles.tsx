'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const CategoryTiles: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 bg-ivory">
      
      {/* Section Eyebrow Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-roseGold font-sans font-semibold">
          Editorial Collections
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy mt-1">
          Explore Our World
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Tile 1: Shop Women (Studio Virupa Pure Editorial Style) */}
        <Link href="/shop?target=women" className="group block space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-muted rounded-none border border-roseGold/20">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200"
              alt="Women Ethnic & Western Couture"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Clean Caption Text Block BELOW Image */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between border-b border-roseGold/20 pb-2">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy group-hover:text-roseGold transition-colors">
                Shop Women
              </h3>
              <span className="text-xs uppercase tracking-widest text-roseGold font-sans font-semibold">
                48 Items
              </span>
            </div>
            <p className="text-xs text-charcoal-muted font-sans font-light">
              Handwoven Organza Suits, Zari Lehengas, Embroidered Anarkalis &amp; Indo-Western Couture
            </p>
          </div>
        </Link>

        {/* Tile 2: Shop Kids */}
        <Link href="/shop?target=kids" className="group block space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-muted rounded-none border border-roseGold/20">
            <Image
              src="https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=8000"
              alt="Kids Royal Ethnic Wear"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Clean Caption Text Block BELOW Image */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between border-b border-roseGold/20 pb-2">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy group-hover:text-roseGold transition-colors">
                Shop Kids Ethnic
              </h3>
              <span className="text-xs uppercase tracking-widest text-roseGold font-sans font-semibold">
                32 Items
              </span>
            </div>
            <p className="text-xs text-charcoal-muted font-sans font-light">
              Kanjeevaram Silk Pattu Frocks, Girls Lehenga Cholis &amp; Boys Kurta Dhoti Sets
            </p>
          </div>
        </Link>

      </div>
    </section>
  );
};
