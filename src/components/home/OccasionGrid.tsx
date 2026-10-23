'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OCCASIONS_DATA } from '@/data/shopData';

import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

export const OccasionGrid: React.FC = () => {
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.grid > a', stagger: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="shop-occasion"
      className="py-20 sm:py-28 lg:py-32 bg-ivory text-navy border-b border-roseGold/15 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Left-Aligned Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16 border-b border-roseGold/20 pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium">
              Curated Occasions
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-navy leading-[1.02] tracking-tight mt-1.5">
              Shop By Occasion
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-roseGold hover:text-navy transition-colors shrink-0 group"
          >
            <span>All Occasions</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

        {/* Editorial Occasion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {OCCASIONS_DATA.map((occ) => (
            <Link
              key={occ.id}
              href={`/shop?occasion=${occ.id}`}
              className="group block space-y-3"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border border-roseGold/15 bg-ivory shadow-xs group-hover:shadow-lg transition-all">
                <Image
                  src={occ.image}
                  alt={occ.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Caption Text Block Below Image */}
              <div className="pt-1.5 space-y-1 border-b border-roseGold/15 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-navy group-hover:text-roseGold transition-colors">
                    {occ.title}
                  </h3>
                  <span className="text-[11px] font-sans text-roseGold font-medium">
                    {occ.count}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted/80 font-sans font-light line-clamp-2 min-h-[2.5rem]">
                  {occ.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionGrid;
