'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/data/shopData';

export const KidsEthnicFeatureSection: React.FC = () => {
  // Filter for genuine kids ethnic products only
  const kidsProducts = MOCK_PRODUCTS.filter((p) => p.category === 'kids').slice(0, 4);

  return (
    <section className="w-full py-16 sm:py-24 bg-white text-navy border-b border-navy/10 scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-navy/10 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-roseGold font-sans font-medium">
              Little Royalty Spotlight
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy leading-tight tracking-tight mt-1">
              Kids Ethnic Collections
            </h2>
            <p className="text-xs sm:text-sm font-sans font-light text-navy/70 max-w-lg mt-1">
              Pure silk Kanjeevaram pattu frocks &amp; twirl-worthy lehenga cholis with 100% soft cotton lining.
            </p>
          </div>
          <Link
            href="/shop?target=kids"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-roseGold hover:text-navy transition-colors shrink-0 group"
          >
            <span>Explore Kids Ethnic</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Kids Grid: 4-Column layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {kidsProducts.map((product) => (
            <div key={product.id} className="group relative flex flex-col bg-white overflow-hidden">
              <Link href={`/shop/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F8F6] block border border-navy/5">
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 text-[9px] font-sans font-semibold uppercase tracking-[0.14em] bg-navy text-white">
                    PURE SILK
                  </span>
                </div>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </Link>
              <div className="pt-3 pb-1 text-left">
                <span className="text-[9px] uppercase tracking-[0.18em] text-roseGold font-medium block">
                  100% Cotton Lined
                </span>
                <Link href={`/shop/${product.slug}`}>
                  <h3 className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.06em] text-navy hover:text-roseGold transition-colors truncate mt-0.5">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-sans font-semibold text-navy font-tnum">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[11px] text-navy/40 line-through font-tnum">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KidsEthnicFeatureSection;
