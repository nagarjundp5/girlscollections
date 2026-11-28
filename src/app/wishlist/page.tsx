'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { ProductCard } from '@/components/ProductCard';
import { useToast } from '@/components/ToastContainer';
import { formatSizeLabel } from '@/lib/formatSizeLabel';

export default function WishlistPage() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const { addToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoaded) return;
    let cancelled = false;

    async function loadWishlistProducts() {
      setLoading(true);
      try {
        const url = isSignedIn
          ? '/api/wishlist'
          : wishlist.length > 0
          ? `/api/wishlist?guestIds=${encodeURIComponent(wishlist.join(','))}`
          : '';

        if (!url) {
          if (!cancelled) setProducts([]);
          return;
        }

        const res = await fetch(url);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch {
        if (!cancelled) addToast('Could not load saved items', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWishlistProducts();
    return () => { cancelled = true; };
  }, [authLoaded, isSignedIn, wishlist.length]);

  const visibleProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveToBag = async (product: any) => {
    const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
    const sizeStrings = rawSizes.map((s: any) => (typeof s === 'string' ? s : s?.size || String(s))).filter(Boolean);
    const chosenSize = selectedSizes[product.id] || product.savedSize || sizeStrings[0] || 'Free Size';

    await addToCart(product, chosenSize, undefined, 1);
    toggleWishlist(product.id);
    addToast(`Moved ${product.name} to bag`, 'success');
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1A1E3A] min-h-screen pb-24 select-none">
      {/* Header */}
      <div className="bg-white border-b border-[#EADFD6] py-10 px-4 sm:px-8 text-center">
        <div className="max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1A1E3A]">
            My wishlist ({visibleProducts.length})
          </h1>
          <p className="text-sm sm:text-base text-[#6B6F85] font-sans">
            Products you love, saved in one place.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#EADFD6] overflow-hidden p-3 space-y-3">
                <div className="w-full h-56 bg-[#F3EFEA] rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-[#F3EFEA] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[#F3EFEA] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center space-y-5 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#FDF2F5] border border-[#F5D0DC] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-[#D94F7E]" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 21s-7-4.35-9.33-8.36C.74 9.35 2.42 5 6.4 5c2.2 0 3.74 1.15 4.6 2.4C11.86 6.15 13.4 5 15.6 5c3.98 0 5.66 4.35 3.73 7.64C19 16.65 12 21 12 21z" />
              </svg>
            </div>
            <p className="text-base text-[#1A1E3A] font-sans leading-relaxed">
              Nothing saved yet. Tap the heart on any product to save it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-xl bg-[#D94F7E] hover:bg-[#c43f6d] text-white text-sm font-sans font-semibold shadow-sm transition-transform active:scale-95"
            >
              <span>Start shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
            {visibleProducts.map((product) => {
              const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
              const sizeStrings = rawSizes.map((s: any) => (typeof s === 'string' ? s : s?.size || String(s))).filter(Boolean);
              const needsSizePicker = sizeStrings.length > 1;
              const currentSize = selectedSizes[product.id] || product.savedSize || sizeStrings[0] || 'Free Size';

              return (
                <div key={product.id} className="flex flex-col gap-2">
                  <ProductCard product={product} />

                  {needsSizePicker && (
                    <select
                      aria-label={`Select size for ${product.name}`}
                      value={currentSize}
                      onChange={(e) => setSelectedSizes((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-xl border border-[#EADFD6] bg-white text-xs font-sans text-[#1A1E3A]"
                    >
                      {sizeStrings.map((s: string) => (
                        <option key={s} value={s}>
                          Size: {formatSizeLabel(s)}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#D94F7E] hover:bg-[#c43f6d] text-white text-xs font-sans font-semibold transition-transform active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to bag</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-[#EADFD6] bg-white text-[#6B6F85] hover:text-[#D94F7E] text-xs font-sans font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
