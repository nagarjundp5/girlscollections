'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

interface EditorialProductFeatureProps {
  product: any;
  kicker?: string;
  narrative?: string;
}

export const EditorialProductFeature: React.FC<EditorialProductFeatureProps> = ({
  product,
  kicker = 'PIECE OF THE SEASON',
  narrative = 'Handwoven with pure zari threads and pure mulberry silk. A masterwork of South Indian handloom tradition tailored for royal celebrations.',
}) => {
  const { addToCart } = useShop();

  const handleQuickAdd = () => {
    const size = typeof product.sizes?.[0] === 'string' ? product.sizes[0] : (product.sizes?.[0]?.size || 'Free Size');
    addToCart(product, size);
  };

  const formattedPrice = typeof product.price === 'number'
    ? (product.price > 100000 ? Math.round(product.price / 100) : product.price)
    : 0;

  const comparePriceVal = product.originalPrice || (product.compare_price ? Math.round(product.compare_price / 100) : undefined);

  return (
    <section className="w-full py-16 sm:py-20 md:py-28 bg-sand/20 text-inkNavy border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-ivory border border-zariGold/30 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl">
          
          {/* Spotlight Hero Image */}
          <div className="md:col-span-6 relative h-[450px] sm:h-[540px] w-full rounded-xl overflow-hidden shadow-md">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            )}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-gold-gradient text-white text-[10px] font-sans font-bold uppercase tracking-widest rounded-xs shadow-md">
                ATELIER SPOTLIGHT
              </span>
            </div>
          </div>

          {/* Details & Direct Purchase Section */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-sans font-semibold text-xs text-zariGold tracking-[0.25em] uppercase">
                {kicker}
              </span>
              <div className="h-[1px] w-8 bg-zariGold/40" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-inkNavy leading-tight tracking-tight mb-3">
              {product.name}
            </h3>

            <p className="text-sm font-sans text-inkNavy/75 leading-relaxed mb-6">
              {narrative}
            </p>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-zariGold/20">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-zariGold font-tnum">
                ₹{formattedPrice.toLocaleString('en-IN')}
              </span>
              {comparePriceVal && comparePriceVal > formattedPrice && (
                <span className="text-sm font-sans text-inkNavy/40 line-through font-normal font-tnum">
                  ₹{comparePriceVal.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={`/shop/${product.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-inkNavy text-white hover:bg-zariGold transition-colors rounded-md text-xs font-sans font-bold uppercase tracking-widest text-center shadow-md group"
              >
                <span>EXPLORE PIECE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={handleQuickAdd}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ivory text-inkNavy border border-zariGold/40 hover:bg-zariGold hover:text-white transition-all rounded-md text-xs font-sans font-bold uppercase tracking-widest"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EditorialProductFeature;
