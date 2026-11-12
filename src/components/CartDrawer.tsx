'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { MOCK_PRODUCTS } from '@/data/shopData';
import {
  CloseIcon,
  TrashIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@/components/ui/BrandIcons';
import { Plus, Minus, ArrowRight, ShieldCheck, Tag, Check } from 'lucide-react';
import { useScrollLock } from '@/lib/useScrollLock';

// In-memory cache for Cart Drawer recommendations (0 DB and 0 network hits on repeated opens)
let memoryRecommendedCache: any[] | null = null;

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    freeShippingProgress,
    amountNeededForFreeShipping,
    addToCart,
  } = useShop();

  useScrollLock(isCartOpen);

  // Quick size selector modal state for recommendations
  const [sizePickerProduct, setSizePickerProduct] = useState<any | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const formatPrice = (priceInPaiseOrRupees: number) => {
    const rupees = priceInPaiseOrRupees > 100000 ? Math.round(priceInPaiseOrRupees / 100) : priceInPaiseOrRupees;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  // Recommended products with 2-tier client cache (memory + sessionStorage), 0 DB hits
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>(() => {
    if (memoryRecommendedCache && memoryRecommendedCache.length > 0) return memoryRecommendedCache;
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('tgc_cart_recommended_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryRecommendedCache = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });
  const [isLoadingRecommended, setIsLoadingRecommended] = useState<boolean>(false);

  useEffect(() => {
    if (!isCartOpen) return;

    if (memoryRecommendedCache && memoryRecommendedCache.length > 0) {
      setRecommendedProducts(memoryRecommendedCache);
      return;
    }

    try {
      const stored = sessionStorage.getItem('tgc_cart_recommended_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryRecommendedCache = parsed;
          setRecommendedProducts(parsed);
          return;
        }
      }
    } catch {}

    let isCancelled = false;
    setIsLoadingRecommended(true);

    async function loadRecommended() {
      try {
        const res = await fetch('/api/products/recommended', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const prods = data.products || [];

        const curated = prods
          .filter(
            (p: any) =>
              p &&
              p.is_active !== false &&
              p.images &&
              p.images.length > 0 &&
              !p.images[0].includes('three-kids-mobile') &&
              !p.images[0].includes('photo-1610030469983')
          )
          .slice(0, 6);

        if (!isCancelled && curated.length > 0) {
          memoryRecommendedCache = curated;
          setRecommendedProducts(curated);
          try {
            sessionStorage.setItem('tgc_cart_recommended_v2', JSON.stringify(curated));
          } catch {}
        }
      } catch (err) {
        console.warn('[CartDrawer] Recommended fetch note:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRecommended(false);
        }
      }
    }

    loadRecommended();

    return () => {
      isCancelled = true;
    };
  }, [isCartOpen]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'TGC10' || clean === 'FESTIVE10') {
      setAppliedCoupon(clean);
      setCouponMessage({ text: `Code ${clean} applied! 10% discount added.` });
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try TGC10', isError: true });
    }
  };

  const handleAddRecommended = (prod: any) => {
    const rawSizes = prod.sizes;
    const sizesList = Array.isArray(rawSizes)
      ? rawSizes.map((s: any) => (typeof s === 'string' ? s : s?.size)).filter(Boolean)
      : [];

    const safeProd = {
      ...prod,
      colors: Array.isArray(prod.colors) && prod.colors.length > 0 ? prod.colors : [{ name: 'Standard', hex: '#000000' }],
    };

    if (sizesList.length > 1) {
      // Product requires size choice: open quick size picker
      setSizePickerProduct({ ...safeProd, parsedSizes: sizesList });
    } else {
      // Single size or Free Size
      const defaultSize = sizesList[0] || 'Free Size';
      addToCart(safeProd, defaultSize);
    }
  };

  const cartProductKeys = new Set(
    cart.map((item) => String(item.product?.id || item.product?.slug || ''))
  );
  const visibleRecommendations = recommendedProducts
    .filter((p) => !cartProductKeys.has(String(p.id)) && !cartProductKeys.has(String(p.slug)))
    .slice(0, 4);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden select-none">
          {/* Backdrop with Soft Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              setIsCartOpen(false);
              setSizePickerProduct(null);
            }}
            className="fixed inset-0 bg-[#1C1417]/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel Sliding in from Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none z-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="w-screen max-w-full sm:max-w-md bg-[#FBF7F1] text-[#1C1417] shadow-2xl flex flex-col justify-between border-l border-[#EFE7E2] pointer-events-auto"
            >
              {/* TOP HEADER ROW */}
              <div className="px-5 sm:px-6 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-4 border-b border-[#EFE7E2] flex items-center justify-between bg-[#FBF7F1] shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#3B1230]/10 border border-[#3B1230]/20 flex items-center justify-center text-[#3B1230]">
                    <ShoppingBagIcon className="w-4 h-4 text-[#3B1230]" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1C1417]">
                    Your Bag <span className="text-sm font-sans font-medium text-[#B8903A] font-tnum">({cartCount})</span>
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setSizePickerProduct(null);
                  }}
                  className="w-9 h-9 rounded-full border border-[#E5D7CE] hover:border-[#3B1230] hover:bg-[#3B1230]/5 flex items-center justify-center text-[#1C1417] transition-all active:scale-95 cursor-pointer"
                  aria-label="Close cart"
                >
                  <CloseIcon className="w-4 h-4 text-[#1C1417]" />
                </button>
              </div>

              {/* FREE SHIPPING PROGRESS BAR */}
              <div className="px-5 sm:px-6 py-2.5 bg-[#F4EDE5] border-b border-[#EFE7E2] shrink-0">
                <div className="flex items-center justify-between text-xs font-sans text-[#1C1417] mb-1.5">
                  <div className="flex items-center space-x-1.5 font-medium truncate mr-2">
                    <TruckIcon className="w-3.5 h-3.5 text-[#B8903A] shrink-0" />
                    <span className="truncate">
                      {amountNeededForFreeShipping > 0
                        ? `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more for FREE Shipping!`
                        : '🎉 Unlocked FREE Pan-India Shipping!'}
                    </span>
                  </div>
                  <span className="font-bold text-[#B8903A] shrink-0">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-[#E5D7CE]">
                  <div
                    className="bg-gradient-to-r from-[#B8903A] to-[#D4AF37] h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* DRAWER CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {cart.length === 0 ? (
                  /* 1. EMPTY STATE */
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#F4EDE5] border border-[#E5D7CE] text-[#3B1230] flex items-center justify-center mx-auto shadow-xs">
                      <ShoppingBagIcon className="w-8 h-8 text-[#3B1230]" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#1C1417]">Your Bag is Empty</h3>
                    <p className="text-xs sm:text-sm font-sans text-[#1C1417]/70 max-w-xs mx-auto leading-relaxed">
                      Discover our handcrafted anarkalis, pattu frocks, and festive ethnic wear.
                    </p>
                    {/* Centered Solid Wine #3B1230 48px Explore Button */}
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center justify-center px-8 h-[48px] rounded-lg bg-[#3B1230] hover:bg-[#4E1A40] text-white text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 cursor-pointer mx-auto"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 ml-2 text-white" />
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* 2. LINE ITEMS LIST */}
                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex space-x-3.5 p-3 rounded-xl bg-white border border-[#EFE7E2] shadow-2xs transition-all hover:border-[#D5C2B6]"
                        >
                          {/* Product Thumbnail */}
                          <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[#EFE7E2] bg-[#F7F2EC]">
                            {item.product.images && item.product.images[0] ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover object-top"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#B8903A] font-serif font-bold text-lg">
                                TGC
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <h4 className="text-xs sm:text-sm font-sans font-medium text-[#1C1417] line-clamp-1">
                                  {item.product.name}
                                </h4>
                                {/* 44px Hit Target Remove Button */}
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 -mr-1 -mt-1 flex items-center justify-center text-[#1C1417]/40 hover:text-[#9A1F2A] transition-colors active:scale-90 cursor-pointer"
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-[11px] text-[#1C1417]/65 space-x-1.5 mt-0.5 font-sans">
                                <span>
                                  Size: <strong className="text-[#1C1417] font-semibold">{item.selectedSize}</strong>
                                </span>
                                {item.selectedColor && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Color: <strong className="text-[#1C1417] font-semibold">{item.selectedColor}</strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              {/* 44px Quantity Stepper */}
                              <div className="flex items-center border border-[#E5D7CE] rounded-lg h-[44px] bg-[#FBF7F1] px-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-9 h-9 flex items-center justify-center text-[#1C1417] hover:text-[#3B1230] hover:bg-black/5 rounded-md transition-colors active:scale-95 cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-[#1C1417] font-tnum">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-9 h-9 flex items-center justify-center text-[#1C1417] hover:text-[#3B1230] hover:bg-black/5 rounded-md transition-colors active:scale-95 cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-xs sm:text-sm font-bold text-[#1C1417] font-tnum">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 4. COUPON INPUT */}
                    <div className="pt-2">
                      <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                        <div className="flex rounded-lg border border-[#E5D7CE] bg-white overflow-hidden focus-within:border-[#3B1230] transition-colors">
                          <div className="pl-3 flex items-center text-[#B8903A]">
                            <Tag className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 h-[44px] px-3 text-xs text-[#1C1417] placeholder:text-[#8C7A70] bg-transparent outline-none uppercase font-semibold"
                          />
                          <button
                            type="submit"
                            disabled={!couponCode.trim()}
                            className="h-[44px] px-5 bg-[#3B1230] hover:bg-[#4E1A40] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponMessage && (
                          <p
                            className={`text-[11px] px-1 font-medium ${
                              couponMessage.isError ? 'text-[#9A1F2A]' : 'text-emerald-700'
                            }`}
                          >
                            {couponMessage.text}
                          </p>
                        )}
                        {!appliedCoupon && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-[#1C1417]/70 pt-0.5 px-1">
                            <span>Use code</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCouponCode('FESTIVE10');
                                setAppliedCoupon('FESTIVE10');
                                setCouponMessage({ text: 'Code FESTIVE10 applied! 10% discount added.' });
                              }}
                              className="font-bold text-[#3B1230] underline underline-offset-2 hover:text-[#B8903A] cursor-pointer"
                            >
                              FESTIVE10
                            </button>
                            <span>for 10% off</span>
                          </div>
                        )}
                      </form>
                    </div>
                  </>
                )}

                {/* 6. "YOU MAY ALSO LIKE" RECOMMENDATIONS */}
                {(visibleRecommendations.length > 0 || isLoadingRecommended) && (
                  <div className="pt-3 border-t border-[#EFE7E2] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-[#1C1417]">
                        You May Also Like
                      </h3>
                      <span className="text-[10px] font-sans text-[#B8903A] font-medium">Curated for you</span>
                    </div>

                    {visibleRecommendations.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1">
                        {visibleRecommendations.map((prod, idx) => (
                          <motion.div
                            key={prod.id || prod.slug}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.1 + idx * 0.05,
                              type: 'spring',
                              stiffness: 260,
                              damping: 20,
                            }}
                            className="snap-start shrink-0 w-[125px] sm:w-[135px] bg-white rounded-xl p-2.5 border border-[#EFE7E2] shadow-2xs flex flex-col justify-between group"
                          >
                            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-2 bg-[#F7F2EC]">
                              <Image
                                src={prod.images?.[0] || '/hero/hero-saree-1.png'}
                                alt={prod.name}
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                sizes="135px"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="text-[11px] font-sans font-medium text-[#1C1417] line-clamp-1 group-hover:text-[#3B1230] transition-colors">
                                {prod.name}
                              </h4>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-[#1C1417] font-tnum">
                                  ₹{(prod.price > 100000 ? Math.round(prod.price / 100) : prod.price).toLocaleString('en-IN')}
                                </span>
                                {/* 44px Outlined + ADD Button with Quick Size Picker */}
                                <button
                                  onClick={() => handleAddRecommended(prod)}
                                  className="h-[44px] min-w-[54px] px-2.5 rounded-lg border border-[#3B1230] text-[#3B1230] hover:bg-[#3B1230] hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                                  title="Add to bag"
                                >
                                  + ADD
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="shrink-0 w-[125px] sm:w-[135px] bg-white rounded-xl p-2.5 border border-[#EFE7E2] shadow-2xs space-y-2 animate-pulse"
                          >
                            <div className="aspect-[3/4] w-full rounded-lg bg-[#F7F2EC]" />
                            <div className="h-3 bg-[#F7F2EC] rounded w-3/4" />
                            <div className="flex justify-between items-center pt-1">
                              <div className="h-3 bg-[#F7F2EC] rounded w-1/3" />
                              <div className="h-8 w-12 bg-[#F7F2EC] rounded-lg" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* QUICK SIZE PICKER SHEET (POPOVER) */}
              <AnimatePresence>
                {sizePickerProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="p-4 bg-white border-t border-[#E5D7CE] shadow-2xl space-y-3 z-20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#1C1417]">Select Size</p>
                        <p className="text-[11px] text-[#1C1417]/70 truncate max-w-[240px]">
                          {sizePickerProduct.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setSizePickerProduct(null)}
                        className="text-xs text-[#8C7A70] hover:text-[#1C1417] p-1 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sizePickerProduct.parsedSizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => {
                            addToCart(sizePickerProduct, size);
                            setSizePickerProduct(null);
                          }}
                          className="h-[44px] min-w-[44px] px-3.5 rounded-lg border border-[#3B1230] text-[#3B1230] hover:bg-[#3B1230] hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. STICKY FOOTER CHECKOUT BAR */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] border-t border-[#EFE7E2] bg-[#FBF7F1] space-y-3 shrink-0 shadow-lg">
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex justify-between text-[#1C1417]/70">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#1C1417] font-tnum">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Coupon ({appliedCoupon})</span>
                        <span className="font-bold font-tnum">-10%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#1C1417]/70">
                      <span>Shipping</span>
                      <span className="font-bold text-[#B8903A]">
                        {amountNeededForFreeShipping === 0 ? 'FREE' : 'Calculated at Checkout'}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-bold text-[#1C1417] pt-2 border-t border-[#EFE7E2]">
                      <span>Total</span>
                      <span className="text-[#3B1230] font-tnum font-sans font-bold">
                        {formatPrice(
                          appliedCoupon ? Math.round(cartSubtotal * 0.9) : cartSubtotal
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Primary Checkout Button: 52px solid wine #3B1230, full width with total */}
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full h-[52px] rounded-xl bg-[#3B1230] hover:bg-[#4E1A40] text-white text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <span>
                      Checkout •{' '}
                      {formatPrice(
                        appliedCoupon ? Math.round(cartSubtotal * 0.9) : cartSubtotal
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white ml-1" />
                  </Link>

                  {/* Secondary: Continue Shopping outlined 44px */}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full h-[44px] rounded-xl border border-[#3B1230]/30 hover:border-[#3B1230] text-[#1C1417] hover:bg-[#3B1230]/5 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center"
                  >
                    Continue Shopping
                  </button>

                  <div className="flex items-center justify-center space-x-1.5 text-[10.5px] text-[#1C1417]/60 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B8903A]" />
                    <span>100% Secure Checkout • Cash on Delivery Available</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
