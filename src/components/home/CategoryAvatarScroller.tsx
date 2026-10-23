'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryAvatar {
  id: string;
  name: string;
  href: string;
  image: string;
}

const CATEGORY_AVATARS: CategoryAvatar[] = [
  {
    id: 'langa-davani',
    name: 'Langa Davani',
    href: '/shop?category=langa-davani',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'sharara-sets',
    name: 'Sharara Sets',
    href: '/shop?category=sharara-sets',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'traditional-gowns',
    name: 'Traditional Gowns',
    href: '/shop?category=traditional-gowns',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'party-frocks',
    name: 'Party Frocks',
    href: '/shop?category=party-frocks',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'kids-ethnic',
    name: 'Kids Ethnic',
    href: '/shop?target=kids',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    href: '/shop?isNew=true',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'festive-edit',
    name: 'Festive Edit',
    href: '/shop?occasion=Festive',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'bridesmaid-edit',
    name: 'Bridesmaid Edit',
    href: '/shop?edit=bridesmaid-edit',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=400',
  },
  {
    id: 'sale',
    name: 'Sale',
    href: '/shop?isSale=true',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=400',
  },
];

export const CategoryAvatarScroller: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-ivory text-navy py-5 sm:py-7 border-b border-navy/10 relative overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative flex items-center">
        
        {/* Desktop Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 z-10 w-9 h-9 rounded-full bg-white text-navy shadow-md border border-navy/10 items-center justify-center hover:bg-roseGold hover:text-navy transition-all duration-300 -translate-y-2"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Category Avatars Container */}
        <div
          ref={scrollContainerRef}
          className="w-full flex items-center space-x-6 sm:space-x-8 lg:space-x-10 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 sm:px-4"
        >
          {CATEGORY_AVATARS.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col items-center shrink-0 space-y-2.5 focus:outline-none"
            >
              {/* Circular Avatar Frame (~96px mobile, ~124-128px desktop) */}
              <div className="relative w-[96px] h-[96px] sm:w-[120px] sm:h-[120px] lg:w-[128px] lg:h-[128px] rounded-full p-[2.5px] bg-gradient-to-tr from-roseGold/20 via-roseGold/60 to-roseGold transition-transform duration-300 group-hover:scale-105 shadow-xs">
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-ivory bg-ivory">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="128px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>
              </div>

              {/* Serif / Clean Typography Label */}
              <span className="text-xs sm:text-sm font-serif font-medium text-navy group-hover:text-roseGold transition-colors tracking-tight text-center whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 z-10 w-9 h-9 rounded-full bg-white text-navy shadow-md border border-navy/10 items-center justify-center hover:bg-roseGold hover:text-navy transition-all duration-300 -translate-y-2"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>

      </div>
    </section>
  );
};

export default CategoryAvatarScroller;
