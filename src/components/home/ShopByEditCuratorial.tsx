'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SHOP_BY_EDIT_ITEMS } from '@/data/categoryTaxonomy';

import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

export const ShopByEditCuratorial: React.FC = () => {
  const featureEdit = SHOP_BY_EDIT_ITEMS[0];
  const supportingEdits = SHOP_BY_EDIT_ITEMS.slice(1);
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.grid > a', stagger: 0.07 });

  return (
    <section
      ref={sectionRef}
      id="shop-by-edit"
      className="w-full bg-ivory text-navy py-16 sm:py-24 border-b border-navy/10 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Left-Aligned Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium">
              Stylist Curations
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy leading-tight tracking-tight mt-1">
              Shop By Edit
            </h2>
            <p className="text-xs sm:text-sm font-sans font-light text-navy/70 max-w-lg mt-1">
              Handpicked themes, evocative color stories &amp; master artisan details
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-roseGold hover:text-navy transition-colors shrink-0 group"
          >
            <span>All Edits</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Feature Edit Tile */}
          {featureEdit && (
            <Link
              key={featureEdit.id}
              href={`/shop?edit=${featureEdit.slug}`}
              className="group relative col-span-2 row-span-2 aspect-[4/5] rounded-sm overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 bg-navy-dark border border-navy/10"
            >
              <Image
                src={featureEdit.image}
                alt={featureEdit.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-transparent p-5 sm:p-7 flex flex-col justify-end text-ivory">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium mb-1">
                  Signature Theme
                </span>
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-ivory tracking-tight group-hover:text-roseGold transition-colors">
                  {featureEdit.title}
                </h3>
                <p className="text-xs sm:text-sm font-sans font-light text-ivory/80 max-w-md mt-1.5 line-clamp-2">
                  {featureEdit.subtitle}
                </p>
              </div>
            </Link>
          )}

          {/* Supporting Edit Tiles */}
          {supportingEdits.map((item) => (
            <Link
              key={item.id}
              href={`/shop?edit=${item.slug}`}
              className="group relative col-span-1 aspect-[3/4] rounded-sm overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 bg-navy-dark border border-navy/10"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent p-4 flex flex-col justify-end text-ivory">
                <span className="text-[9px] uppercase tracking-[0.18em] text-roseGold font-sans font-medium mb-0.5">
                  Stylist Curation
                </span>
                <h3 className="text-sm sm:text-lg font-serif font-bold tracking-tight text-ivory group-hover:text-roseGold transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] font-sans font-light text-ivory/75 mt-0.5 line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByEditCuratorial;
