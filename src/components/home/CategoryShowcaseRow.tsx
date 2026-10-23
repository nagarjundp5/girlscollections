'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { CategoryItem, WOMEN_CATEGORIES, KIDS_CATEGORIES, getCategoryHref } from '@/data/categoryTaxonomy';
import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

interface CategoryShowcaseRowProps {
  eyebrow?: string;
  title?: string;
  accentWord?: string;
  categories?: CategoryItem[];
  className?: string;
}

export const CategoryShowcaseRow: React.FC<CategoryShowcaseRowProps> = ({
  eyebrow = 'CURATED CATEGORY SHOWCASE',
  title = 'Signature Wardrobe Edits',
  accentWord = 'Signature',
  categories,
  className = '',
}) => {
  const containerRef = useGSAPScrollReveal<HTMLElement>({ stagger: 0.08, yOffset: 24 });

  // Default DB-driven items combining top Women + Kids featured categories
  const featuredWomen = WOMEN_CATEGORIES.filter((c) => c.featured && c.image);
  const featuredKids = KIDS_CATEGORIES.filter((c) => c.featured && c.image);

  const displayCategories: CategoryItem[] = categories || [
    ...featuredWomen,
    ...featuredKids,
  ].slice(0, 5);

  const renderTitle = () => {
    if (!accentWord) return title;
    const parts = title.split(new RegExp(`(${accentWord})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === accentWord.toLowerCase() ? (
            <span key={i} className="font-serif italic text-zariGold px-1 font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <section ref={containerRef} className={`w-full py-12 sm:py-16 bg-ivory ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-zariGold/20 pb-5 gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em] text-zariGold block">
              {eyebrow}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-inkNavy leading-[1.1]">
              {renderTitle()}
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-inkNavy hover:text-zariGold transition-colors group shrink-0"
          >
            <span>EXPLORE ALL CATEGORIES</span>
            <ArrowUpRight className="w-4 h-4 text-zariGold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* CATEGORY SHOWCASE CARDS CONTAINER */}
        {/* Mobile: 1.3 cards horizontal snap peek | Desktop: 4-5 static grid */}
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayCategories.map((category) => {
            const href = getCategoryHref(category);
            return (
              <Link
                key={category.id}
                href={href}
                className="group relative w-[75vw] max-w-[280px] sm:w-full shrink-0 snap-start rounded-2xl overflow-hidden border border-zariGold/30 bg-navy shadow-md hover:shadow-xl transition-all duration-300 aspect-[3/4] flex flex-col justify-end p-5 outline-none focus-visible:ring-2 focus-visible:ring-zariGold"
              >
                {/* CATEGORY COVER IMAGE WITH HOVER ZOOM */}
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />
                )}

                {/* GRADIENT SCRIM FOR LEGIBILITY */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-transparent transition-opacity duration-300 group-hover:from-navy/95" />

                {/* CARD CONTENT & FRAUNCES UPRIGHT SERIF TITLE */}
                <div className="relative z-10 space-y-1.5 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zariGold-light block">
                    {category.group === 'kids' ? 'KIDS ETHNIC' : 'WOMEN COLLECTION'}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-ivory leading-tight tracking-wide group-hover:text-zariGold-light transition-colors">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-xs font-sans font-normal text-ivory/80 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}

                  {/* ACTION LINK BADGE */}
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-roseGold group-hover:text-ivory transition-colors">
                    <span>EXPLORE</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CategoryShowcaseRow;
