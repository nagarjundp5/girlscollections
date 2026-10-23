'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight, ArrowLeft, Truck, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { dbService } from '@/lib/db';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { toast } from '@/lib/toast';
import { StoreSettings } from '@/types';
import { MOCK_PRODUCTS } from '@/data/shopData';
import { ButterflyMotif } from '@/components/ui/Motifs';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const discountCode = useCartStore((state) => state.discountCode);
  const applyDiscount = useCartStore((state) => state.applyDiscount);

  const [promoInput, setPromoInput] = useState('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load store settings (shipping thresholds, etc.)
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await dbService.getSettings();
        setStoreSettings(settings);
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const subtotal = getCartTotal();
  const freeShippingThreshold = storeSettings?.free_shipping_threshold ?? 199900; // ₹1,999 in paise
  const defaultShippingCharge = storeSettings?.default_shipping_charge ?? 0;

  // Calculate shipping
  const shippingCharge = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : defaultShippingCharge;

  // Calculate discount amount
  let discountAmount = 0;
  if (discountCode) {
    if (discountCode.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * (discountCode.discount_value / 100));
    } else {
      discountAmount = discountCode.discount_value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.message || 'Invalid promo code!');
        return;
      }

      applyDiscount({
        id: 'applied-coupon',
        code: promoInput.toUpperCase().trim(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: 0,
        used_count: 0,
        is_active: true
      });
      toast.success(data.message || `Promo code applied successfully!`);
      setPromoInput('');
    } catch (err) {
      toast.error('Error applying coupon.');
      console.error(err);
    }
  };

  const handleRemovePromo = () => {
    applyDiscount(null);
    toast.info('Promo code removed.');
  };

  // Shipping progress helper
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const hasEarnedFreeShipping = subtotal >= freeShippingThreshold;

  // Complementary Cross-Sell Recommendations (excluding items already in bag)
  const cartItemIds = new Set(items.map((i) => i.id));
  const crossSellProducts = MOCK_PRODUCTS.filter((p) => !cartItemIds.has(p.id)).slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-28 px-6 space-y-8 bg-ivory text-navy" role="status" aria-live="polite">
        <div className="w-20 h-20 rounded-full border-2 border-zariGold/30 bg-blush/20 flex items-center justify-center shadow-md">
          <ShoppingBag className="w-8 h-8 text-zariGold stroke-[1.5]" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-zariGold font-bold">Your Shopping Bag</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wider text-navy">Your Bag is Empty</h1>
          <p className="text-charcoal-muted text-xs sm:text-sm tracking-wider max-w-sm mx-auto font-sans leading-relaxed">
            Discover our curated handcrafted sarees, lehengas, and kids pure silk collections.
          </p>
        </div>
        <Link
          href="/shop"
          className="bg-navy hover:bg-navy/90 text-ivory px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all flex items-center gap-2"
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-4 h-4 text-zariGold" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col bg-ivory text-navy">
      {/* Page Title & Breadcrumb Header */}
      <div className="border-b border-zariGold/20 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-zariGold text-xs uppercase tracking-widest font-mono font-bold mb-2">
            <ButterflyMotif className="w-4 h-4 text-zariGold" />
            <span>Luxury Handcrafted Fashion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-navy tracking-tight">
            Your Shopping Bag
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold tracking-widest text-navy bg-blush/40 border border-zariGold/30 px-3.5 py-1.5 rounded-full">
            {items.reduce((acc, item) => acc + item.quantity, 0)} ITEMS IN BAG
          </span>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zariGold hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items + Cross-Sell Row */}
        <div className="lg:col-span-7 space-y-8">
          {/* Cart Item Cards */}
          <div className="space-y-4" role="list" aria-label="Shopping bag items">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="p-4 sm:p-5 rounded-2xl border border-zariGold/30 bg-white shadow-md flex gap-4 sm:gap-6 items-start"
                role="listitem"
              >
                {/* Product Thumbnail */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-sand/20 border border-zariGold/20 shrink-0">
                  <NextImage
                    src={getOptimizedImageUrl(item.image, 200) || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300'}
                    alt={`${item.name} — size ${item.size}`}
                    fill
                    sizes="96px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9.5px] text-zariGold font-bold uppercase tracking-[0.2em] font-mono block">
                          THE GIRLS COLLECTIONS
                        </span>
                        <h3 className="text-sm sm:text-base font-serif font-bold text-navy mt-1 leading-snug truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-charcoal-muted font-medium mt-1">
                          Size: <span className="font-bold text-navy">{item.size}</span>
                        </p>
                      </div>
                      <span className="text-base font-bold text-navy shrink-0 font-sans">
                        ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zariGold/10">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-zariGold/30 rounded-lg bg-ivory/60" role="group" aria-label="Quantity controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-navy hover:text-zariGold transition-colors"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs px-2 text-navy font-bold w-7 text-center select-none font-sans">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-navy hover:text-zariGold transition-colors"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove item button */}
                    <button
                      onClick={() => {
                        removeItem(item.id, item.size);
                        toast.info(`Removed ${item.name} from bag.`);
                      }}
                      className="text-rose-700 hover:text-rose-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                      aria-label={`Remove ${item.name} from bag`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping low-friction link */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy hover:text-zariGold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-zariGold" />
              Continue Shopping
            </Link>
            <span className="text-xs text-charcoal-muted font-medium">
              Need help? WhatsApp us at <a href="https://wa.me/917483848505" target="_blank" className="underline font-bold text-navy">+91 74838 48505</a>
            </span>
          </div>

          {/* Cross-sell / "You Might Also Like" Horizontal Scroll Strip */}
          {crossSellProducts.length > 0 && (
            <div className="pt-6 border-t border-zariGold/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-navy">Complete Your Look</h3>
                  <p className="text-xs text-charcoal-muted">Frequently bought together with your selection</p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zariGold font-bold">
                  Curated Pairings
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {crossSellProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="w-40 sm:w-44 shrink-0 rounded-xl border border-zariGold/30 bg-white p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-sand/20 mb-2">
                      <NextImage
                        src={getOptimizedImageUrl(prod.images[0], 300)}
                        alt={prod.name}
                        fill
                        sizes="160px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-serif font-bold text-navy truncate">{prod.name}</h4>
                      <p className="text-xs font-sans font-bold text-zariGold mt-0.5">
                        ₹{(prod.price / 100).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        addItem({
                          id: prod.id,
                          name: prod.name,
                          slug: prod.slug,
                          price: prod.price,
                          image: prod.images[0] || '',
                          size: prod.sizes[0]?.size || 'Free Size',
                        });
                        toast.success(`Added ${prod.name} to bag!`);
                      }}
                      className="mt-2.5 w-full bg-ivory hover:bg-blush/40 border border-zariGold/40 text-navy py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-zariGold" /> Add to Bag
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary, Delivery Estimate & Promo Code */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Summary Box */}
          <div className="rounded-2xl border border-zariGold/30 bg-white p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-serif font-bold text-navy border-b border-zariGold/20 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <ShieldCheck className="w-5 h-5 text-zariGold" />
            </h2>

            {/* Free Shipping Progress & Delivery Estimate */}
            <div className="space-y-3 bg-blush/15 p-3.5 rounded-xl border border-zariGold/20">
              <div className="space-y-1.5">
                {hasEarnedFreeShipping ? (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Free Shipping Unlocked!
                  </p>
                ) : (
                  <p className="text-xs font-medium text-navy">
                    Add <span className="font-bold text-zariGold">
                      ₹{(amountToFreeShipping / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </span> more for FREE insured delivery
                  </p>
                )}
                <div className="w-full bg-sand/40 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-zariGold h-full transition-all duration-500 rounded-full"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-navy/80 pt-1 border-t border-zariGold/10">
                <Truck className="w-4 h-4 text-zariGold shrink-0" />
                <span>Express Air Delivery: <strong>5–7 Business Days</strong> across India</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between items-center text-charcoal-muted">
                <span>Bag Subtotal</span>
                <span className="font-bold text-navy text-sm">
                  ₹{(subtotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Promo code line */}
              {discountCode && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="uppercase font-bold tracking-wider">{discountCode.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">−₹{(discountAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-rose-700 hover:underline text-[10px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-charcoal-muted">
                <span>Shipping Fee</span>
                {shippingCharge === 0 ? (
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">
                    FREE
                  </span>
                ) : (
                  <span className="font-bold text-navy">
                    ₹{(shippingCharge / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-zariGold/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-navy">Estimated Total</span>
                <span className="text-2xl font-serif font-bold text-navy">
                  ₹{(finalTotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-[10px] text-charcoal-muted mt-1">Inclusive of all taxes &amp; transit insurance</p>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-navy hover:bg-navy/90 text-ivory text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-zariGold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Expandable Promo Code Box */}
          <div className="rounded-2xl border border-zariGold/30 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
              <Tag className="w-4 h-4 text-zariGold" />
              Have a Promo Code?
            </h3>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter FESTIVE10 / WELCOME10"
                className="flex-1 bg-ivory border border-zariGold/30 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-navy placeholder:text-charcoal-muted/60 focus:outline-none focus:border-zariGold"
              />
              <button
                type="submit"
                className="bg-zariGold hover:bg-zariGold/90 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors shadow-sm"
              >
                Apply
              </button>
            </form>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Use code <strong className="text-navy">FESTIVE10</strong> for 10% off your first order!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
