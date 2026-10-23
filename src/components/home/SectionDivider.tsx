'use client';

import React from 'react';
import Image from 'next/image';
import { Award, Heart, ShieldCheck } from 'lucide-react';
import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

export function TempleArchHairlineDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full py-6 flex items-center justify-center relative select-none ${className}`} aria-hidden="true">
      {/* Left Hairline */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-zariGold/30 to-zariGold/60" />
      
      {/* Temple Arch Central Tick Motif */}
      <div className="mx-4 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zariGold stroke-current">
          <path d="M 10 2 C 5 2 3 7 3 14 L 3 18 L 17 18 L 17 14 C 17 7 15 2 10 2 Z" strokeWidth="1.2" fill="none" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Right Hairline */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-zariGold/60 via-zariGold/30 to-transparent" />
    </div>
  );
}

interface SectionDividerProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  eyebrow = 'SIGNATURE HERITAGE',
  title = 'Handcrafted Luxury & Royal Indian Weaves',
  subtitle = 'Every drape is thoughtfully curated with pure Kanjeevaram silks, Chanderi weaves, and fine Zardosi handwork.',
}) => {
  const containerRef = useGSAPScrollReveal<HTMLElement>({ stagger: 0.08, yOffset: 20 });

  return (
    <section
      ref={containerRef}
      className="w-full bg-navy text-ivory py-16 sm:py-24 border-y border-roseGold/15 relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Full-Bleed Editorial Artisan Image */}
          <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-sm overflow-hidden border border-roseGold/20 shadow-xl bg-navy-dark group">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200"
              alt="Handcrafted Silk Weaving Detail"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3.5 sm:p-4 rounded-sm bg-navy/85 backdrop-blur-md border border-roseGold/20">
              <span className="text-[10px] uppercase tracking-[0.18em] text-roseGold font-medium block mb-0.5">
                Kanchipuram &amp; Banaras Artisans
              </span>
              <p className="text-xs font-serif italic text-ivory/90">
                &ldquo;Embellished with fine zari threads and master needlecraft.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & 3-Column Pillar Feature Row */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium block">
                {eyebrow}
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory leading-[1.05] tracking-tight">
                Handcrafted Luxury <span className="inline-block px-1 font-sans font-normal opacity-90 text-roseGold">&amp;</span> Royal Indian Weaves
              </h2>
              <p className="text-xs sm:text-base font-sans font-light text-ivory/80 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            </div>

            <div className="w-full h-px bg-roseGold/20" />

            {/* 3-Column Value Callout Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1">
              <div className="space-y-1.5 p-3 sm:p-4 rounded-sm bg-navy-light/40 border border-roseGold/15">
                <Award className="w-4 h-4 text-roseGold shrink-0" />
                <h3 className="text-xs font-serif font-bold text-ivory">Master Weavers</h3>
                <p className="text-[10px] font-sans font-light text-ivory/70 leading-tight">
                  Directly supporting 120+ traditional weaver families.
                </p>
              </div>

              <div className="space-y-1.5 p-3 sm:p-4 rounded-sm bg-navy-light/40 border border-roseGold/15">
                <Heart className="w-4 h-4 text-blush shrink-0" />
                <h3 className="text-xs font-serif font-bold text-ivory">Kid-Gentle Lining</h3>
                <p className="text-[10px] font-sans font-light text-ivory/70 leading-tight">
                  100% breathable soft cotton lining under frocks.
                </p>
              </div>

              <div className="space-y-1.5 p-3 sm:p-4 rounded-sm bg-navy-light/40 border border-roseGold/15">
                <ShieldCheck className="w-4 h-4 text-roseGold shrink-0" />
                <h3 className="text-xs font-serif font-bold text-ivory">Certified Pure</h3>
                <p className="text-[10px] font-sans font-light text-ivory/70 leading-tight">
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

export default SectionDivider;
