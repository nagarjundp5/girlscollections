'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/data/shopData';
import { ProductGallery } from '@/components/pdp/ProductGallery';
import { ProductInfo } from '@/components/pdp/ProductInfo';
import { StickyAddToCartBar } from '@/components/pdp/StickyAddToCartBar';
import { ProductCard } from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';
import { ButterflyMotif } from '@/components/ui/Motifs';
import { haptic } from '@/lib/haptics';

interface PDPClientViewProps {
  product: Product;
  relatedProducts: Product[];
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function PDPClientView({ product, relatedProducts }: PDPClientViewProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useShop();
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Determine current active price based on selected size
  const currentSizeObj = useMemo(() => {
    if (!Array.isArray(product.sizes) || !selectedSize) return undefined;
    return (product.sizes as any[]).find((s) =>
      typeof s === 'string' ? s === selectedSize : s.size === selectedSize
    );
  }, [product.sizes, selectedSize]);

  const activePrice =
    currentSizeObj && typeof currentSizeObj === 'object' && currentSizeObj.price
      ? currentSizeObj.price
      : product.price;

  const scrollToSize = () => {
    const el = document.getElementById('pdp-size-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const sizeHeader = el.querySelector('h3');
      if (sizeHeader) {
        el.classList.add('ring-2', 'ring-[var(--cta)]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--cta)]'), 1200);
      }
    }
    haptic('warn');
  };

  const handleStickyAddToCart = () => {
    if (!selectedSize) {
      scrollToSize();
      return;
    }
    const defaultColor = product.colors?.[0]?.name || 'Standard';
    addToCart(product, selectedSize, defaultColor, 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tgc-cart-bounce'));
    }
    haptic('tap');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on The Girls Collections`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        haptic('tap');
      } catch {
        // User cancelled or share dismissed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        haptic('success');
      } catch {
        // Fallback ignored
      }
    }
  };

  const categoryLabel = toTitleCase(product.subcategory || product.category);

  return (
    <div
      data-theme={product.target === 'kids' ? 'kids' : 'women'}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans"
    >
      {/* ── Breadcrumb Navigation ── */}
      <nav
        aria-label="Breadcrumb"
        className="w-full border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-xs py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-sans text-[var(--muted)]"
      >
        <div className="max-w-[1200px] mx-auto flex items-center space-x-1.5 truncate">
          <Link href="/" className="hover:text-[var(--ink)] transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]/60 shrink-0" />
          <Link
            href={`/shop?target=${product.target || 'women'}`}
            className="hover:text-[var(--ink)] transition-colors shrink-0"
          >
            {product.target === 'kids' ? 'Kids' : 'Women'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]/60 shrink-0" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[var(--ink)] transition-colors shrink-0"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]/60 shrink-0" />
          <span className="text-[var(--ink)] font-semibold truncate">{product.name}</span>
        </div>
      </nav>

      {/* ── Main Product Display Section (Desktop 2-Col, Max 1200px) ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery (7 Cols Desktop, Sticky) */}
          <div className="lg:col-span-7 w-full lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              productName={product.name}
              productId={product.id}
              inWishlist={isInWishlist(product.id)}
              onToggleWishlist={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              onShare={handleShare}
            />
          </div>

          {/* Right Column: Information, Pricing, Size, Actions (5 Cols Desktop) */}
          <div className="lg:col-span-5 w-full">
            <ProductInfo
              product={product}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              activePrice={activePrice}
            />
          </div>
        </div>
      </section>

      {/* ── Curated Recommendations ── */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-[var(--line)] bg-white py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <ButterflyMotif className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <p className="text-xs font-semibold text-[var(--gold)] tracking-wide">
                Complete your ensemble
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--ink)]">
                You may also like
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
        activePrice={activePrice}
        onAddToCart={handleStickyAddToCart}
        onScrollToSize={scrollToSize}
      />
    </div>
  );
}

export default PDPClientView;
