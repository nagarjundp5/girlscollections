'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { MOCK_PRODUCTS } from '@/data/shopData';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useShop();

  const wishlistProducts = MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-ivory text-inkNavy min-h-screen pb-24 select-none">
      
      {/* Header Banner */}
      <div className="bg-sand/30 border-b border-zariGold/20 py-12 px-6 sm:px-12 text-center">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="eyebrow-text text-zariGoldLight">YOUR PERSONAL SANCTUARY</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-inkNavy">
            Saved Couture Wishlist ({wishlistProducts.length})
          </h1>
          <p className="text-xs text-inkNavy/70 font-sans">
            Keep track of your favorite handcrafted sarees, lehengas, and kids ethnic wear.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-12">
        {wishlistProducts.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-sand/50 text-zariGold flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-inkNavy">Your Wishlist is Empty</h2>
            <p className="text-xs text-inkNavy/60 font-sans leading-relaxed">
              Explore our new arrivals and tap the heart icon on any saree or pattu frock to save it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-[2px] btn-gold-gradient text-xs font-semibold uppercase tracking-[0.2em] shadow-lg"
            >
              <span>Explore All Couture</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
