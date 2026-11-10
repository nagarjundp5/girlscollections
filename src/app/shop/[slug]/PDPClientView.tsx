'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/data/shopData';
import { ProductGallery } from '@/components/pdp/ProductGallery';
import { ProductInfo } from '@/components/pdp/ProductInfo';
import { StickyAddToCartBar } from '@/components/pdp/StickyAddToCartBar';
import { ProductCard } from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';
import { ButterflyMotif } from '@/components/ui/Motifs';

interface PDPClientViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function PDPClientView({ product, relatedProducts }: PDPClientViewProps) {
  const { addToCart } = useShop();
  const [selectedSize, setSelectedSize] = useState<string>('');

  const handleStickyAddToCart = () => {
    const sizeToUse =
      selectedSize ||
      (Array.isArray(product.sizes) && product.sizes[0]
        ? typeof product.sizes[0] === 'string'
          ? product.sizes[0]
          : (product.sizes[0] as any).size
        : 'Free Size');

    addToCart(product, sizeToUse, product.colors[0]?.name || 'Standard', 1);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#1C1417]">
      {/* ── Breadcrumb Navigation ── */}
      <nav
        aria-label="Breadcrumb"
        className="w-full border-b border-[#EFE7E2] bg-white/70 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8 text-xs font-sans text-gray-500"
      >
        <div className="max-w-[1440px] mx-auto flex items-center space-x-2 truncate">
          <Link href="/" className="hover:text-[#3B1230] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link
            href={`/shop?target=${product.target || 'women'}`}
            className="hover:text-[#3B1230] transition-colors capitalize"
          >
            {product.target || 'Women'}&apos;s Collection
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#3B1230] transition-colors capitalize"
          >
            {product.subcategory || product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[#1C1417] font-semibold truncate">{product.name}</span>
        </div>
      </nav>

      {/* ── Main Product Display Section ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Gallery (7 Cols Desktop) */}
          <div className="lg:col-span-7 w-full">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Information, Pricing, Size, Actions (5 Cols Desktop) */}
          <div className="lg:col-span-5 w-full">
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* ── Curated Recommendations ── */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-[#EFE7E2] bg-white py-12 sm:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <ButterflyMotif className="w-6 h-6 text-[#B8903A]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8903A] block">
                Complete The Royal Ensemble
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1417]">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mobile Sticky Add to Bag Bar ── */}
      <StickyAddToCartBar
        product={product}
        selectedSize={selectedSize}
        onAddToCart={handleStickyAddToCart}
      />
    </div>
  );
}

export default PDPClientView;

