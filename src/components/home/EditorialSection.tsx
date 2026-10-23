'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const EditorialSection: React.FC = () => {
  return (
    <section className="py-20 bg-ivory text-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-20">
        
        {/* Studio Virupa Style Full-Width Banner with Bold Condensed Typography Directly on Photography */}
        <div className="relative aspect-[16/7] sm:aspect-[21/8] w-full border border-roseGold/20 overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=1800"
            alt="The Heritage Silk Story"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Subtle Warm Vignette Light Falloff */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
          
          <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end text-ivory">
            <span className="text-xs uppercase tracking-[0.3em] text-roseGold font-sans font-bold mb-2">
              SEASONAL EDIT
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-ivory tracking-tight leading-none">
                  THE HEIRLOOM SILK EDIT
                </h2>
                <p className="text-sm sm:text-base text-ivory/80 font-sans font-light mt-2 max-w-xl">
                  Handcrafted Kanjeevaram weaves, organza suits &amp; pure silk kids pattu frocks.
                </p>
              </div>
              <Link
                href="/shop?occasion=festive"
                className="px-8 py-3.5 rounded-full bg-roseGold text-navy text-xs font-bold uppercase tracking-widest hover:bg-ivory transition-all shadow-lg flex-shrink-0 w-max"
              >
                Discover Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Asymmetrical 2-Column Lookbook Narrative Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] sm:aspect-[4/3] w-full border border-roseGold/20 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1200"
                alt="Mother & Daughter Handcrafted Silk Weave"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-roseGold font-sans font-semibold">
              JOURNAL &amp; CRAFT
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy leading-tight">
              Weaving Memories Across Generations
            </h2>

            <p className="text-sm text-charcoal-muted font-sans font-light leading-relaxed">
              Our couture is born in traditional weaving clusters where master artisans hand-loom 
              every zari motif. Designed with soft, zero-scratch cotton linings for young girls, 
              our garments marry heritage craftsmanship with comfortable, everyday luxury.
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-navy border-b-2 border-roseGold pb-1 hover:text-roseGold transition-colors"
              >
                <span>Read Our Craft Story</span>
                <ArrowRight className="w-4 h-4 text-roseGold" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
