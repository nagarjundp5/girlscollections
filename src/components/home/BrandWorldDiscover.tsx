'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Heart, Award, ShieldCheck } from 'lucide-react';

export const BrandWorldDiscover: React.FC = () => {
  return (
    <section
      id="discover-brand-world"
      className="w-full bg-ivory text-navy py-16 sm:py-24 border-b border-navy/10 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 text-roseGold font-sans text-xs uppercase tracking-[0.2em] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-roseGold" />
            <span>Our Heritage &amp; Craft</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy leading-tight tracking-tight">
            Discover The Girls Collection
          </h2>
          <p className="text-xs sm:text-sm font-sans font-light text-navy/70 leading-relaxed max-w-xl">
            Where centuries-old Indian handloom weaving meets contemporary luxury silhouettes for women and little girls.
          </p>
          <div className="w-12 h-[1px] bg-roseGold/60 mt-1" />
        </div>

        {/* Story Grid: 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Image Banner */}
          <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden border border-navy/10 shadow-md group bg-white">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200"
              alt="Artisan Loom Weaving"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-sm bg-white/90 backdrop-blur-md border border-navy/10 text-navy">
              <p className="text-xs font-serif italic text-navy">
                &ldquo;Every thread tells a story of royal South Indian zari heritage.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-3xl font-serif font-bold text-navy leading-snug">
                Handcrafted with Pure Silks <span className="inline-block px-1 font-sans font-normal opacity-90 text-roseGold">&amp;</span> Authentic Zari
              </h3>
              <p className="text-xs sm:text-sm font-sans font-light text-navy/75 leading-relaxed">
                Founded with a mission to preserve traditional weaving arts while designing ethereal festive ensembles, our garments are crafted by master weavers across Kanchipuram, Banaras, and Chanderi.
              </p>
            </div>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5 p-4 rounded-sm bg-white border border-navy/10 shadow-xs">
                <Award className="w-4 h-4 text-roseGold" />
                <h4 className="text-xs font-serif font-bold text-navy">Master Weavers</h4>
                <p className="text-[11px] font-sans font-light text-navy/70 leading-normal">
                  Supporting 120+ traditional weaver families directly.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-sm bg-white border border-navy/10 shadow-xs">
                <Heart className="w-4 h-4 text-roseGold" />
                <h4 className="text-xs font-serif font-bold text-navy">Kid-Gentle Lining</h4>
                <p className="text-[11px] font-sans font-light text-navy/70 leading-normal">
                  Soft 100% breathable cotton lining under every frock.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-sm bg-white border border-navy/10 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-roseGold" />
                <h4 className="text-xs font-serif font-bold text-navy">Certified Pure</h4>
                <p className="text-[11px] font-sans font-light text-navy/70 leading-normal">
                  Authentic Silk Mark certified pure handloom weaves.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BrandWorldDiscover;
