'use client';

import React from 'react';
import Image from 'next/image';
import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

interface FabricCraftItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const FABRIC_ITEMS: FabricCraftItem[] = [
  {
    id: 'kanjeevaram-silk',
    title: 'Pure Kanjeevaram Silk',
    subtitle: '100% Certified Mulberry Silk',
    description: 'Woven with real silver & gold zari threads on traditional handlooms.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=90&w=800',
  },
  {
    id: 'pure-organza',
    title: 'Pure Organza Weaves',
    subtitle: 'Featherlight & Translucent',
    description: 'Ethereal sheer organza drapes adorned with scalloped zari embroidery.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=90&w=800',
  },
  {
    id: 'chanderi-silk',
    title: 'Chanderi Weaves',
    subtitle: 'Lustrous Sheen & Breathability',
    description: 'Handcrafted Chanderi silk with delicate floral zari bootis.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=90&w=800',
  },
  {
    id: 'zardosi-handwork',
    title: 'Zardosi Handwork',
    subtitle: 'Master Artisan Needlecraft',
    description: 'Ornate metallic threadwork, moti, and dabka hand embroidery.',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  },
];

export const FabricCraftsmanshipSection: React.FC = () => {
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.fabric-card', stagger: 0.07 });

  return (
    <section
      ref={sectionRef}
      id="fabric-craftsmanship"
      className="w-full bg-white text-navy py-16 sm:py-24 border-b border-navy/10 scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium">
              Material Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy leading-tight tracking-tight mt-1">
              Fabric &amp; Artisan Craftsmanship
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans font-light text-navy/70 max-w-md">
            Every garment is crafted with authentic Silk Mark certified fabrics and hand-embroidered by traditional artisans.
          </p>
        </div>

        {/* 4 Card Macro Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {FABRIC_ITEMS.map((item) => (
            <div
              key={item.id}
              className="fabric-card group relative bg-ivory rounded-sm overflow-hidden border border-navy/10 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Macro Fabric Crop Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-dark">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-[8.5px] font-sans font-semibold uppercase tracking-[0.14em] bg-white/90 text-navy rounded-full backdrop-blur-md shadow-xs">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {/* Card Caption Text */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-1.5 bg-ivory">
                <h3 className="text-base font-serif font-bold text-navy group-hover:text-roseGold transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-navy/70 font-sans font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FabricCraftsmanshipSection;
