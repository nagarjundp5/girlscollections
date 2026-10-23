'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ZariThread from '@/components/ui/ZariThread';

export const CategoryBentoGrid: React.FC = () => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  return (
    <section className="w-full py-16 sm:py-24 md:py-32 bg-ivory">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="eyebrow-text">CURATED ARCHITECTURE</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-inkNavy mt-2">
            Shop by Category
          </h2>
          <div className="w-12 h-[1.5px] bg-gold-gradient mx-auto mt-4" />
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Tile 1: Large Hero Tile (Spans 7 cols on desktop) */}
          <Link
            href="/shop?target=women"
            onMouseEnter={() => setHoveredTile('tile1')}
            onMouseLeave={() => setHoveredTile(null)}
            className="md:col-span-7 relative h-[420px] sm:h-[540px] rounded-t-[180px] sm:rounded-t-[220px] overflow-hidden bg-woven-texture border border-zariGold/20 shadow-xl group transition-transform duration-500 hover:-translate-y-1"
          >
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200"
              alt="Women Ethnic Wear"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            {/* Soft Gradient Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/25 to-transparent p-8 sm:p-12 flex flex-col justify-end text-ivory">
              <span className="eyebrow-text text-zariGoldLight mb-2">Primary Collection</span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ivory group-hover:text-zariGoldLight transition-colors">
                Women&apos;s Royal Drapes
              </h3>
              <p className="text-xs sm:text-sm text-ivory/80 font-sans mt-2 max-w-md">
                Bridal anarkalis, zari lehengas, langa davanis, and handcrafted festive ensembles.
              </p>
            </div>
            <ZariThread variant="cardBorder" isHovered={hoveredTile === 'tile1'} />
          </Link>

          {/* Right Column: 2 Stacked Tiles (Spans 5 cols on desktop) */}
          <div className="md:col-span-5 flex flex-col gap-6 sm:gap-8">
            {/* Tile 2: Kids Ethnic Tile */}
            <Link
              href="/shop?target=kids"
              onMouseEnter={() => setHoveredTile('tile2')}
              onMouseLeave={() => setHoveredTile(null)}
              className="relative h-[200px] sm:h-[255px] rounded-t-[100px] sm:rounded-t-[120px] overflow-hidden bg-woven-texture border border-zariGold/20 shadow-lg group transition-transform duration-500 hover:-translate-y-1"
            >
              <Image
                src="https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800"
                alt="Kids Ethnic Wear"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/20 to-transparent p-6 flex flex-col justify-end text-ivory">
                <span className="eyebrow-text text-zariGoldLight mb-1">Little Royalty</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-ivory group-hover:text-zariGoldLight transition-colors">
                  Kids Pure Silk Pattu
                </h3>
              </div>
              <ZariThread variant="cardBorder" isHovered={hoveredTile === 'tile2'} />
            </Link>

            {/* Tile 3: Festive Couture Tile */}
            <Link
              href="/shop?occasion=Festive"
              onMouseEnter={() => setHoveredTile('tile3')}
              onMouseLeave={() => setHoveredTile(null)}
              className="relative h-[200px] sm:h-[255px] rounded-t-[100px] sm:rounded-t-[120px] overflow-hidden bg-woven-texture border border-zariGold/20 shadow-lg group transition-transform duration-500 hover:-translate-y-1"
            >
              <Image
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800"
                alt="Festive Couture"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/20 to-transparent p-6 flex flex-col justify-end text-ivory">
                <span className="eyebrow-text text-zariGoldLight mb-1">Seasonal Edit</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-ivory group-hover:text-zariGoldLight transition-colors">
                  Festive &amp; Bridal Couture
                </h3>
              </div>
              <ZariThread variant="cardBorder" isHovered={hoveredTile === 'tile3'} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryBentoGrid;
