'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera } from 'lucide-react';

interface StyledLook {
  id: string;
  influencerName: string;
  handle: string;
  image: string;
  productName: string;
  productPrice: number;
  productSlug: string;
}

const STYLED_LOOKS: StyledLook[] = [
  {
    id: 'look-1',
    influencerName: 'Ananya & Little Myra',
    handle: '@ananya_moments',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
    productName: 'Gulmohar Blush Organza Suit',
    productPrice: 4999,
    productSlug: 'gulmohar-blush-organza-suit',
  },
  {
    id: 'look-2',
    influencerName: 'Radhika Sen',
    handle: '@radhika_festive',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
    productName: 'Royal Navy Chanderi Zari Lehenga',
    productPrice: 8999,
    productSlug: 'royal-navy-zari-lehenga',
  },
  {
    id: 'look-3',
    influencerName: 'Priya & Baby Aadhya',
    handle: '@priya_diaries',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
    productName: 'Aadhya Kanjeevaram Pattu Frock',
    productPrice: 3299,
    productSlug: 'aadhya-kids-pattu-frock',
  },
  {
    id: 'look-4',
    influencerName: 'Kavya Sharma',
    handle: '@kavya_ethnics',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
    productName: 'Ananya Rose Gold Anarkali',
    productPrice: 5499,
    productSlug: 'ananya-rose-gold-anarkali',
  },
];

export const StyledInBrandSocial: React.FC = () => {
  return (
    <section
      id="styled-in-brand"
      className="w-full bg-ivory py-14 sm:py-20 border-b border-roseGold/20 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Left-Aligned Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10 border-b border-roseGold/20 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-roseGold font-sans text-xs uppercase tracking-[0.22em] font-medium">
              <Camera className="w-4 h-4 text-roseGold" />
              <span>As Seen On Our Community</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy leading-[0.98] tracking-tight mt-1">
              Styled In The Girls Collection
            </h2>
            <p className="text-xs sm:text-sm font-sans font-light text-charcoal-muted max-w-lg mt-1">
              Real celebrations, festive moments &amp; royal wedding guest styling by our patrons
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-roseGold hover:text-navy transition-colors shrink-0"
          >
            <span>View Gallery</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Styled Looks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STYLED_LOOKS.map((look) => (
            <div
              key={look.id}
              className="group flex flex-col rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-ivory border border-roseGold/25"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-ivory-muted">
                <Image
                  src={look.image}
                  alt={look.influencerName}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* User Tag Overlay */}
                <div className="absolute top-3 left-3 bg-navy/80 backdrop-blur-md px-3 py-1 rounded-full text-ivory text-[10px] font-sans font-medium flex items-center space-x-1.5 shadow-sm">
                  <Camera className="w-3 h-3 text-roseGold" />
                  <span>{look.handle}</span>
                </div>
              </div>

              {/* Tagged Product Bar at Bottom */}
              <div className="p-4 bg-ivory border-t border-roseGold/20 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="text-xs font-serif font-bold text-navy truncate">
                    {look.productName}
                  </h4>
                  <span className="text-xs font-sans font-bold text-roseGold">
                    ₹{look.productPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  href={`/shop/${look.productSlug}`}
                  className="px-3 py-1.5 rounded-full bg-navy text-ivory text-[10px] font-bold uppercase tracking-wider hover:bg-roseGold hover:text-navy transition-colors shrink-0 inline-flex items-center space-x-1"
                >
                  <span>Shop Look</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StyledInBrandSocial;
