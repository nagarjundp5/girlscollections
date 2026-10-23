'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

interface EditorialStoryBlock {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
}

const EDITORIAL_STORIES: EditorialStoryBlock[] = [
  {
    id: 'story-1',
    eyebrow: 'Royal Heritage Weaves',
    title: 'The Kanjeevaram Silk Legacy',
    subtitle: 'Woven with real gold zari threads on traditional pit looms.',
    description: 'Each ensemble represents 120+ hours of painstaking artisan handwork. Crafted with 100% pure silk yarns, our Kanjeevaram Anarkali sets boast heavy zari borders and intricate peacock motifs.',
    ctaText: 'Explore Silk Anarkalis',
    ctaLink: '/shop?category=anarkalis',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=90&w=1200',
    imageAlt: 'Royal Banarasi Silk Anarkali',
  },
  {
    id: 'story-2',
    eyebrow: 'Little Royalty Edit',
    title: 'Soft Pure Silk Kids Frocks',
    subtitle: 'Luxury ethnic wear designed specifically for sensitive young skin.',
    description: 'Lined with 100% breathable, non-scratchy soft cotton underneath heavy zari borders, our kids pattu frocks ensure your little princess stays comfortable and twirl-ready all day long.',
    ctaText: 'Shop Kids Ethnic',
    ctaLink: '/shop?target=kids',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=8000',
    imageAlt: 'Kids Silk Pattu Frock',
  },
  {
    id: 'story-3',
    eyebrow: 'Bridal & Festive Curation',
    title: 'Statement Zari Lehengas & Gowns',
    subtitle: 'Sculpted silhouettes with fine Zardosi needlework.',
    description: 'Designed for wedding celebrations, these hand-embroidered lehenga sets feature flared silk skirts, metallic threadwork kalis, and featherlight organza dupattas.',
    ctaText: 'View Wedding Edit',
    ctaLink: '/shop?category=lehengas',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=90&w=1200',
    imageAlt: 'Royal Zari Lehenga',
  },
];

export const FeaturedCollectionsAlternating: React.FC = () => {
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.editorial-row', stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="featured-collections-editorial"
      className="w-full bg-ivory text-navy py-16 sm:py-28 border-b border-navy/10 scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16 sm:space-y-28">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.22em] text-roseGold font-sans font-medium">
            Curated Collections
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy leading-tight tracking-tight">
            The Editorial Curation
          </h2>
          <div className="w-12 h-[1px] bg-roseGold/60 mt-1" />
        </div>

        {/* Alternating Editorial Story Blocks */}
        <div className="space-y-16 sm:space-y-28">
          {EDITORIAL_STORIES.map((story, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div
                key={story.id}
                className="editorial-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Large Editorial Image (Left on Even, Right on Odd for Desktop; Always Top on Mobile) */}
                <div
                  className={`lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-sm overflow-hidden border border-navy/10 shadow-md bg-white group ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                </div>

                {/* Narrative Text Content Block */}
                <div
                  className={`lg:col-span-5 space-y-4 text-left ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium block">
                    {story.eyebrow}
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-serif font-bold text-navy leading-tight tracking-tight">
                    {story.title}
                  </h3>

                  <p className="text-sm font-serif italic text-navy/80 leading-snug">
                    {story.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm font-sans font-light text-navy/70 leading-relaxed pt-1">
                    {story.description}
                  </p>

                  <div className="pt-3">
                    <Link
                      href={story.ctaLink}
                      className="px-7 py-3 rounded-full bg-navy text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-roseGold hover:text-navy transition-all duration-300 shadow-xs inline-flex items-center space-x-2 group"
                    >
                      <span>{story.ctaText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturedCollectionsAlternating;
