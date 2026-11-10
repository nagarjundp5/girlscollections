'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Product } from '@/data/shopData';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  ShoppingBagIcon,
  RulerIcon,
  TruckIcon,
} from '@/components/ui/BrandIcons';
import {
  Plus,
  Minus,
  ShieldCheck,
  RefreshCw,
  Video,
  Share2,
  Tag,
  Check,
  Copy,
  MessageCircle,
} from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';
import { ProductAccordions } from './ProductAccordions';
import { getSizeLabel } from '@/data/masterSizes';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useShop();
  const { addToast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [needsAlteration, setNeedsAlteration] = useState<'No' | 'Yes'>('No');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const inWishlist = isInWishlist(product.id);

  // Active pricing calculations
  const currentSizeObj = product.sizes.find((s) => s.size === selectedSize) as any;
  const activePrice = currentSizeObj?.price ?? product.price;
  const activeOriginalPrice = currentSizeObj?.originalPrice ?? product.originalPrice;
  const hasMultiplePrices =
    (product as any).has_different_prices ||
    product.sizes.some((s: any) => s.price && s.price !== (product.sizes[0] as any)?.price);

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : 0;

  // Short SKU display (e.g. TGC-43D1378D)
  const shortSku = `TGC-${product.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  // Trigger size error animation & scroll
  const triggerSizePrompt = () => {
    setSizeError(true);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAdd = () => {
    if (!selectedSize) {
      triggerSizePrompt();
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, selectedColor, quantity);
    addToast('Added to your bag ✨', 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      triggerSizePrompt();
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  // SHARE Button with Web Share API and Clipboard Copy Fallback
  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.thegirlscollections.com';
    const canonicalUrl = `${origin}/shop/${product.slug}${selectedSize ? `?size=${encodeURIComponent(selectedSize)}` : ''}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | The Girls Collections`,
          text: `Check out ${product.name} on The Girls Collections - handcrafted ethnic wear.`,
          url: canonicalUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(canonicalUrl);
      addToast('Link copied to clipboard! 📋', 'success');
    } catch {
      addToast('Could not copy link', 'error');
    }
  };

  // Copy FESTIVE10 coupon
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('FESTIVE10');
    setCopiedCoupon(true);
    addToast('Coupon code FESTIVE10 copied!', 'success');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  // Pincode delivery estimate check
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setPincodeStatus('Delivery available in 3-5 business days • COD available');
  };

  return (
    <div className="space-y-6 text-[#1C1417] font-sans select-none">
      {/* Category Eyebrow & Short SKU */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#B8903A]">
            TGC LUXE • {product.target}&apos;S {product.subcategory || product.category}
          </span>
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
            {shortSku}
          </span>
        </div>
      </div>

      {/* Title & Share / Wishlist Row */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1C1417] leading-tight">
          {product.name}
        </h1>

        {/* 44px Outlined Square Buttons: Wishlist & Share */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`w-[44px] h-[44px] rounded-[6px] border-[1.5px] flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              inWishlist
                ? 'border-[#3B1230] bg-[#3B1230] text-white shadow-xs'
                : 'border-[#3B1230]/40 text-[#3B1230] bg-white hover:border-[#3B1230]'
            }`}
            title="Wishlist"
            aria-label="Save to Wishlist"
          >
            <HeartIcon
              className="w-5 h-5"
              filled={inWishlist}
              color={inWishlist ? '#FFFFFF' : '#3B1230'}
            />
          </button>

          <button
            onClick={handleShare}
            className="w-[44px] h-[44px] rounded-[6px] border-[1.5px] border-[#3B1230]/40 text-[#3B1230] bg-white hover:border-[#3B1230] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Share Product"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pricing Row */}
      <div className="border-b border-[#EFE7E2] pb-5 space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1417] font-sans">
            {!selectedSize && hasMultiplePrices ? 'From ' : ''}₹{activePrice.toLocaleString('en-IN')}
          </span>
          {activeOriginalPrice && activeOriginalPrice > activePrice && (
            <>
              <span className="text-base text-gray-400 line-through">
                ₹{activeOriginalPrice.toLocaleString('en-IN')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B1230] text-white text-[10px] font-bold uppercase tracking-wider">
                Save {discountPercent}%
              </span>
            </>
          )}
          <span className="text-xs text-gray-500 block ml-auto font-medium">
            Inclusive of all taxes
          </span>
        </div>
      </div>

      {/* Color Variant Selector */}
      {product.colors.length > 0 && (
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-[#1C1417] uppercase tracking-[0.14em] block">
            Color: <span className="text-[#B8903A] font-normal">{selectedColor}</span>
          </label>
          <div className="flex items-center gap-3">
            {product.colors.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                title={col.name}
                className={`w-7 h-7 rounded-full border transition-all p-0.5 cursor-pointer ${
                  selectedColor === col.name
                    ? 'border-[#3B1230] scale-110 shadow-sm'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <span
                  className="w-full h-full rounded-full block border border-black/10"
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector with 44px Size Chips & Wiggle Error State */}
      <div
        ref={sizeSectionRef}
        className={`space-y-3 pt-1 rounded-2xl p-3 transition-all ${
          sizeError ? 'bg-rose-50/70 border border-rose-300' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <label
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${
              isShaking ? 'animate-wiggle text-rose-700' : 'text-[#1C1417]'
            }`}
          >
            Select Size:{' '}
            {selectedSize ? (
              <span className="text-[#B8903A] font-bold normal-case">{selectedSize}</span>
            ) : (
              <span className="text-rose-600 font-semibold normal-case ml-1">
                {sizeError ? '— Please tap a size below' : '(Required)'}
              </span>
            )}
          </label>

          <button
            onClick={() => setSizeChartOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#B8903A] hover:text-[#1C1417] transition-colors font-medium cursor-pointer"
          >
            <RulerIcon className="w-3.5 h-3.5 text-[#B8903A]" />
            <span className="underline decoration-[#B8903A]/50 underline-offset-4">Size Guide</span>
          </button>
        </div>

        {/* 44px Size Chips */}
        <div className="flex flex-wrap gap-2.5">
          {product.sizes.map((s) => {
            const isSelected = selectedSize === s.size;
            const inStock = s.inStock !== false;

            return (
              <button
                key={s.size}
                disabled={!inStock}
                onClick={() => {
                  setSelectedSize(s.size);
                  setSizeError(false);
                }}
                className={`h-[44px] min-w-[44px] px-3.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer ${
                  !inStock
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#3B1230] text-white border border-[#3B1230] shadow-sm'
                    : 'bg-white text-[#1C1417] border border-[#3B1230]/30 hover:border-[#3B1230]'
                }`}
              >
                {getSizeLabel(s.size)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Fitting / Alteration Toggle (Segmented control with visible borders) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1C1417] uppercase tracking-[0.14em]">
            Custom Fitting / Alteration:
          </label>
          <span className="text-[11px] text-gray-500 font-normal">Complimentary service</span>
        </div>
        <div className="inline-flex p-1 bg-white rounded-xl border border-[#D6C7BE] w-full sm:w-auto">
          <button
            onClick={() => setNeedsAlteration('No')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              needsAlteration === 'No'
                ? 'bg-[#3B1230] text-white border-[#3B1230] shadow-xs'
                : 'bg-white text-[#1C1417] border-transparent hover:bg-gray-50'
            }`}
          >
            No (Standard Ready Size)
          </button>
          <button
            onClick={() => setNeedsAlteration('Yes')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              needsAlteration === 'Yes'
                ? 'bg-[#3B1230] text-white border-[#3B1230] shadow-xs'
                : 'bg-white text-[#1C1417] border-transparent hover:bg-gray-50'
            }`}
          >
            Yes (Custom Measurements)
          </button>
        </div>
      </div>

      {/* Quantity Stepper & Buttons Row */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <label className="text-xs font-semibold text-[#1C1417] uppercase tracking-[0.14em]">
            Quantity:
          </label>
          {/* 44px Quantity Stepper */}
          <div className="flex items-center border border-[#3B1230]/30 rounded-[6px] bg-white h-[44px]">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-[44px] h-[44px] text-[#1C1417] hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 text-xs font-bold text-[#1C1417]">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-[44px] h-[44px] text-[#1C1417] hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary CTA (Add to Bag: 52px, wine #3B1230, radius 6px) + Secondary Buy Now (gold #B08D57) */}
        <div className="space-y-2.5">
          <button
            onClick={handleAdd}
            className="w-full h-[52px] rounded-[6px] bg-[#3B1230] hover:bg-[#2A0D22] text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
          >
            <ShoppingBagIcon className="w-4 h-4 text-white" />
            <span>{selectedSize ? 'ADD TO BAG' : 'Select a size'}</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full h-[52px] rounded-[6px] bg-[#B08D57] hover:bg-[#9B7A49] text-[#1C1417] font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>BUY NOW</span>
          </button>
        </div>
      </div>

      {/* Offer Banner Card (Blush #F4E4E2, 1px gold border, code FESTIVE10 dark pill, fully visible) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F4E4E2] border border-[#B8903A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/70 border border-[#B8903A]/40 flex items-center justify-center text-[#B8903A] shrink-0 mt-0.5">
            <Tag className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#1C1417] font-sans">
              10% off your first order
            </p>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Valid sitewide across Women &amp; Kids collections on all prepaid and COD orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="bg-[#3B1230] text-white font-mono text-xs font-bold px-3 py-1.5 rounded-full tracking-wider shadow-2xs">
            FESTIVE10
          </span>
          <button
            onClick={handleCopyCoupon}
            className="px-3 py-1.5 rounded-lg border border-[#3B1230] bg-white hover:bg-[#3B1230] text-[#3B1230] hover:text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
          >
            {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCoupon ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Delivery Estimate Card with Pincode Check Input */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE7E2] space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1417]">
          <TruckIcon className="w-4 h-4 text-[#B8903A]" />
          <span>Check Delivery Estimate &amp; COD Availability</span>
        </div>

        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pincodeInput}
            onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Indian PIN code"
            className="flex-1 px-3.5 py-2.5 rounded-[6px] border border-[#D6C7BE] text-xs focus:outline-none focus:border-[#3B1230] bg-[#FBF7F1]/30 font-sans min-h-[44px]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-[6px] bg-[#3B1230] hover:bg-[#2A0D22] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[44px]"
          >
            Check
          </button>
        </form>

        {pincodeStatus && (
          <p className="text-xs text-[#3B1230] font-medium pt-0.5">
            {pincodeStatus}
          </p>
        )}
      </div>

      {/* 3 Equal Columns Trust Row */}
      <div className="grid grid-cols-3 gap-2 py-4 px-2 text-center border-t border-b border-[#EFE7E2]">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <TruckIcon className="w-4 h-4 text-[#B8903A]" />
          <span className="text-[11px] font-semibold text-[#1C1417]">Pan-India Dispatch</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 border-x border-[#EFE7E2] px-1">
          <ShieldCheck className="w-4 h-4 text-[#B8903A]" />
          <span className="text-[11px] font-semibold text-[#1C1417]">COD Available</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-[#B8903A]" />
          <span className="text-[11px] font-semibold text-[#1C1417]">7-Day Returns</span>
        </div>
      </div>

      {/* Equal-Width Concierge Buttons: WhatsApp & Video Consultation */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <a
          href="https://wa.me/917406164512?text=Hi%20The%20Girls%20Collections%2C%20I%20would%20like%20to%20inquire%20about%20this%20outfit."
          target="_blank"
          rel="noopener noreferrer"
          className="h-[44px] rounded-[6px] border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp Inquiry</span>
        </a>

        <button
          onClick={() => addToast('Video consultation requested! Our stylist will message you on WhatsApp.', 'success')}
          className="h-[44px] rounded-[6px] border border-[#3B1230] bg-white hover:bg-[#FAF6EE] text-[#3B1230] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Video className="w-4 h-4 text-[#3B1230]" />
          <span>Video Consultation</span>
        </button>
      </div>

      {/* Product Details & Specifications Accordions */}
      <ProductAccordions
        description={product.description}
        fabric={product.fabric}
        careInstructions={product.careInstructions}
        subcategory={product.subcategory}
        occasion={product.occasion}
        target={product.target}
        style_silhouette={product.style_silhouette}
        work_type={product.work_type}
        sleeve={product.sleeve}
        neckline={product.neckline}
        length_type={product.length_type}
        set_type={product.set_type}
      />

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        target={product.target}
      />
    </div>
  );
};

export default ProductInfo;
