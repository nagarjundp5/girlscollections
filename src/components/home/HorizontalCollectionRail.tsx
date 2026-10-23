'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useGSAPScrollReveal } from '@/lib/useGSAPScrollReveal';

interface RailCard {
  id: string;
  title: string;
  count: string;
  href: string;
  image: string;
}

const RAIL_CARDS: RailCard[] = [
  {
    id: 'langa-davani-rail',
    title: 'Langa Davani',
    count: '24 Designs',
    href: '/shop?category=langa-davani',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'sharara-sets-rail',
    title: 'Sharara & Gharara',
    count: '18 Designs',
    href: '/shop?category=sharara-sets',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'traditional-gowns-rail',
    title: 'Traditional Coat Gowns',
    count: '16 Designs',
    href: '/shop?category=traditional-gowns',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'kids-pattu-rail',
    title: 'Kids Pure Silk Frocks',
    count: '32 Designs',
    href: '/shop?target=kids',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'party-frocks-rail',
    title: 'Party Frocks & Dresses',
    count: '20 Designs',
    href: '/shop?category=party-frocks',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=800',
  },
];

export const HorizontalCollectionRail: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useGSAPScrollReveal<HTMLElement>({ selector: '.rail-item', stagger: 0.06 });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="collection-portrait-rail"
      className="py-16 sm:py-24 bg-white text-navy border-b border-navy/10 scroll-mt-24 relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium">
              Deep Taxonomy Browse
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy tracking-tight mt-0.5">
              Explore By Silhouette
            </h2>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-navy/20 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-white border border-navy/20 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Tall Portrait Snap-Scroll Rail */}
        <div
          ref={scrollRef}
          className="flex space-x-5 sm:space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
        >
          {RAIL_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="rail-item group relative w-[220px] sm:w-[280px] aspect-[9/14] shrink-0 rounded-sm overflow-hidden border border-navy/10 shadow-xs hover:shadow-xl transition-all duration-500 bg-navy-dark snap-start"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 640px) 70vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent p-5 flex flex-col justify-end text-ivory">
                <span className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-roseGold mb-1">
                  {card.count}
                </span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-ivory tracking-tight group-hover:text-roseGold transition-colors leading-tight">
                  {card.title}
                </h3>
                <div className="mt-2 flex items-center text-[11px] font-sans font-medium text-roseGold uppercase tracking-[0.16em] opacity-90 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <span>View Silhouette</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalCollectionRail;
