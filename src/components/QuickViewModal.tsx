'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useShop();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const availableSizes = product.sizes?.filter((s) => s.inStock) || [];
  const activeSize = selectedSize || availableSizes[0]?.size || 'Free Size';

  const handleAddToCart = () => {
    addToCart(product, activeSize);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-inkNavy/70 backdrop-blur-md flex items-end md:items-center justify-end md:justify-center p-0 md:p-6 transition-all">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0 z-0"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal / Drawer Surface */}
      <div className="relative z-10 w-full md:max-w-xl bg-ivory text-inkNavy rounded-t-2xl md:rounded-2xl border border-zariGold/30 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-[90vh] animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-ivory/80 backdrop-blur-md border border-zariGold/30 flex items-center justify-center text-inkNavy hover:bg-zariGold hover:text-white transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Stage with Arch Frame Accent */}
        <div className="relative w-full md:w-1/2 h-[260px] md:h-auto bg-sand/30 shrink-0 p-3 flex items-center justify-center">
          <div className="relative w-full h-full arch-frame-sm overflow-hidden shadow-inner">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-6 flex flex-col justify-between flex-1 overflow-y-auto">
          <div>
            {/* Category Eyebrow */}
            <span className="font-sans font-semibold text-[10.5px] text-zariGold tracking-[0.2em] uppercase block mb-1">
              {product.category}
            </span>

            {/* Title */}
            <h3 className="text-xl font-serif font-bold text-inkNavy leading-tight mb-2">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-sans font-bold text-zariGold font-tnum">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-xs font-sans text-inkNavy/40 line-through font-normal font-tnum">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-inkNavy/80 block mb-2">
                  SELECT SIZE: <span className="text-zariGold">{activeSize}</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableSizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-3 py-1.5 text-xs font-sans font-bold border rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                        activeSize === s.size
                          ? 'bg-zariGold text-white border-zariGold shadow-xs'
                          : 'bg-ivory text-inkNavy/80 border-zariGold/30 hover:border-zariGold'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-zariGold/20 flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-gradient text-inkNavy hover:shadow-lg transition-all rounded-md text-xs font-sans font-bold uppercase tracking-widest shadow-md cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>ADD TO BAG</span>
            </button>

            <Link
              href={`/shop/${product.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-bold uppercase tracking-widest text-zariGold hover:text-inkNavy transition-colors text-center"
            >
              <span>VIEW FULL PIECE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;
