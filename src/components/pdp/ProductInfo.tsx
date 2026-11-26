'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Product } from '@/data/shopData';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Copy,
  Tag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Video,
  Ruler,
} from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';
import { ProductAccordions } from './ProductAccordions';
import { formatSizeLabel, getSizeAgeSubtitle, getWomenSizeSubtitle } from '@/lib/formatSizeLabel';
import { siteConfig } from '@/lib/siteConfig';
import { haptic } from '@/lib/haptics';

interface ProductInfoProps {
  product: Product;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  activePrice: number;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedSize,
  onSizeChange,
  activePrice,
}) => {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useShop();
  const { addToast } = useToast();

  const [sizeError, setSizeError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{ message: string; isSuccess: boolean } | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const isKids = product.target === 'kids';

  // Pricing calculations
  const currentSizeObj = (product.sizes as any[]).find((s) => s.size === selectedSize);
  const activeOriginalPrice = currentSizeObj?.originalPrice ?? product.originalPrice;
  const hasMultiplePrices =
    (product as any).has_different_prices ||
    (product.sizes as any[]).some(
      (s: any) => s.price && s.price !== (product.sizes[0] as any)?.price
    );

  const discountPercent =
    activeOriginalPrice && activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : 0;

  // Short SKU display (e.g. TGC-A4385536)
  const shortSku = `TGC-${product.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  // Clean category label for pill (e.g. "Kids · Party wear" or "Women · Kurta sets")
  const categoryPillLabel = useMemo(() => {
    const targetLabel = isKids ? 'Kids' : 'Women';
    const sub = (product.subcategory || product.category || '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${targetLabel} · ${sub}`;
  }, [isKids, product.subcategory, product.category]);

  // Trigger size error animation & scroll without annoying alert popups
  const triggerSizePrompt = () => {
    setSizeError(true);
    setIsShaking(true);
    haptic('warn');
    setTimeout(() => setIsShaking(false), 300);
    sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAdd = () => {
    if (!selectedSize) {
      triggerSizePrompt();
      return;
    }
    setSizeError(false);
    haptic('success');
    // Default color payload preserved for backend compatibility
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, selectedSize, defaultColor, quantity);
    setAddedFeedback(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tgc-cart-bounce'));
    }
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      triggerSizePrompt();
      return;
    }
    setSizeError(false);
    haptic('tap');
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, selectedSize, defaultColor, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  // Copy FESTIVE10 coupon
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('FESTIVE10');
    setCopiedCoupon(true);
    haptic('success');
    setTimeout(() => setCopiedCoupon(false), 1500);
  };

  // Pincode delivery estimate check
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    haptic('tap');
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setPincodeStatus({
        message: 'Please enter a valid 6-digit Indian PIN code',
        isSuccess: false,
      });
      return;
    }
    setPincodeStatus({
      message: 'Delivery available in 3-5 business days • COD available with ₹200 advance',
      isSuccess: true,
    });
  };

  // Video call request link
  const videoCallMessage = useMemo(() => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://www.thegirlscollections.com';
    const currentUrl = `${origin}/shop/${product.slug}${selectedSize ? `?size=${encodeURIComponent(selectedSize)}` : ''}`;
    const sizeDisplay = selectedSize ? formatSizeLabel(selectedSize) : 'not selected';

    return (
      `Hi The Girls Collections, I'd like a video call to see this product.\n` +
      `Product: ${product.name}\n` +
      `Style code: ${shortSku}\n` +
      `Size: ${sizeDisplay}\n` +
      `Price: ₹${activePrice.toLocaleString('en-IN')}\n` +
      `Link: ${currentUrl}\n` +
      `Please let me know a convenient time. Thank you!`
    );
  }, [product.name, product.slug, shortSku, selectedSize, activePrice]);

  return (
    <div className="space-y-6 text-[var(--ink)] font-sans select-none">
      {/* ── 2) TITLE AND PRICE BLOCK ── */}
      <div className="space-y-2.5">
        {/* Category Pill & Style Code */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EBE1] text-[var(--ink)]">
            {categoryPillLabel}
          </span>
          <span className="text-xs text-[var(--muted)] font-mono">
            Style code: {shortSku}
          </span>
        </div>

        {/* Title: Lora 600, 22px mobile / 30px desktop, full width */}
        <h1 className="font-serif font-semibold text-[22px] sm:text-[26px] lg:text-[30px] leading-[1.3] text-[var(--ink)]">
          {product.name}
        </h1>

        {/* Price Row (Baseline aligned, tabular-nums) */}
        <div className="pt-1 border-b border-[#EADFD6] pb-4 space-y-1">
          {/* Starting price label if size not chosen and has variable pricing */}
          {!selectedSize && hasMultiplePrices && (
            <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
              Starting price
            </p>
          )}

          <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3">
            <span className="text-[26px] sm:text-[28px] font-bold text-[var(--ink)] tabular-nums">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>

            {activeOriginalPrice && activeOriginalPrice > activePrice && (
              <>
                <span className="text-[16px] text-[var(--muted)] line-through tabular-nums">
                  ₹{activeOriginalPrice.toLocaleString('en-IN')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7ED] text-[var(--success)] text-xs font-bold tabular-nums">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-[var(--muted)] font-normal pt-0.5">
            Inclusive of all taxes
          </p>
        </div>
      </div>

      {/* ── 4) SIZE AND AGE DISPLAY ── */}
      <div
        id="pdp-size-section"
        ref={sizeSectionRef}
        className={`space-y-3 pt-1 rounded-2xl p-3 sm:p-4 bg-white border border-[#EADFD6] transition-all ${
          sizeError ? 'ring-2 ring-[var(--cta)] bg-rose-50/40' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-semibold text-[18px] text-[var(--ink)]">
              Select size
            </h3>
            {selectedSize ? (
              <span className="text-sm font-semibold text-[var(--ink)]">
                : {formatSizeLabel(selectedSize)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--cta)]">
                (Required)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              haptic('tap');
              setSizeChartOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-[var(--ink)] hover:text-[var(--cta)] transition-colors font-medium cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5 text-[var(--cta)]" />
            <span className="underline decoration-[var(--line)] underline-offset-4">Size guide</span>
          </button>
        </div>

        {/* 3-Column Grid on Mobile, 4-Column on Desktop */}
        <div
          className={`grid grid-cols-3 sm:grid-cols-4 gap-2.5 ${
            isShaking ? 'animate-shake-chips' : ''
          }`}
        >
          {product.sizes.map((s) => {
            const isSelected = selectedSize === s.size;
            const inStock = s.inStock !== false;
            const sizeNum = formatSizeLabel(s.size);
            const subtitle = isKids
              ? getSizeAgeSubtitle(s.size, true)
              : getWomenSizeSubtitle(s.size);

            return (
              <button
                key={s.size}
                type="button"
                disabled={!inStock}
                onClick={() => {
                  haptic('tap');
                  onSizeChange(s.size);
                  setSizeError(false);
                }}
                className={`relative h-[64px] rounded-[14px] p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                  !inStock
                    ? 'bg-gray-50 text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed overflow-hidden'
                    : isSelected
                    ? 'bg-[var(--cta)] text-white border border-[var(--cta)] shadow-xs animate-chip-spring'
                    : 'bg-white text-[var(--ink)] border border-[#EADFD6] hover:border-[var(--cta)]/60'
                }`}
                aria-label={`Size ${sizeNum}`}
              >
                {/* Out of stock diagonal strike line */}
                {!inStock && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  >
                    <span className="w-[120%] h-[1.5px] bg-gray-400 rotate-[-28deg]" />
                  </span>
                )}

                {/* Selected Check Icon Top-Right */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white/25 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                )}

                {/* Large Size Number (20px, 700) */}
                <span className="text-[20px] font-bold leading-tight tabular-nums">
                  {sizeNum}
                </span>

                {/* Small Age or Label Below (13px, muted or white on selected) */}
                {subtitle && (
                  <span
                    className={`text-[12px] sm:text-[13px] font-normal leading-none mt-0.5 ${
                      isSelected ? 'text-white/90' : 'text-[var(--muted)]'
                    }`}
                  >
                    {subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3) Colour disclaimer line */}
        <p className="text-xs text-[var(--muted)] pt-1 italic">
          Actual colour may vary slightly from the photos.
        </p>
      </div>

      {/* ── 6) BUY BUTTONS, QUANTITY & ACTIONS ── */}
      <div id="pdp-main-actions" className="space-y-3.5 pt-1">
        {/* Compact Stepper (44px buttons) */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--ink)]">Quantity:</span>
          <div className="flex items-center border border-[#EADFD6] rounded-[12px] bg-white h-[44px]">
            <button
              type="button"
              onClick={() => {
                haptic('tap');
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-[44px] h-[44px] text-[var(--ink)] hover:bg-black/5 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-[var(--ink)] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                haptic('tap');
                setQuantity((q) => q + 1);
              }}
              className="w-[44px] h-[44px] text-[var(--ink)] hover:bg-black/5 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Add to Cart (52px, --cta, rounded 14px) & Secondary Buy Now (52px, --buy, rounded 14px) */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleAdd}
            className={`relative overflow-hidden w-full h-[52px] rounded-[14px] bg-[var(--cta)] hover:bg-[var(--cta-hover)] text-white font-sans text-[15px] font-bold flex items-center justify-center gap-2.5 transition-transform duration-150 cursor-pointer active:scale-[0.97] shadow-xs select-none ${
              addedFeedback ? 'animate-cta-press' : ''
            }`}
          >
            {/* CSS light sweep on add */}
            {addedFeedback && (
              <span
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 animate-shine-sweep pointer-events-none"
                aria-hidden="true"
              />
            )}
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[3]" />
                <span>Added to bag ✓</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full h-[52px] rounded-[14px] bg-[var(--buy)] hover:opacity-95 text-white font-sans text-[15px] font-semibold flex items-center justify-center gap-2 transition-transform duration-150 cursor-pointer active:scale-[0.97] shadow-xs select-none"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* ── 8) FIRST-ORDER OFFER BANNER ── */}
      <div
        className="p-4 sm:p-5 rounded-[16px] border border-[#EADFD6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
        style={{ backgroundColor: 'var(--accent-soft)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--accent-color)] shrink-0 mt-0.5 shadow-2xs">
            <Tag className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-serif font-semibold text-[17px] text-[var(--ink)] leading-snug">
              10% off your first order
            </h4>
            <p className="text-[14px] sm:text-[15px] text-[var(--muted)]">
              Valid on all prepaid and COD orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="bg-white border border-[#EADFD6] text-[var(--ink)] font-mono text-xs font-bold px-3 py-1.5 rounded-full tracking-wider shadow-2xs">
            FESTIVE10
          </span>
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="px-3.5 py-1.5 rounded-full border border-[var(--ink)]/20 bg-white hover:bg-[var(--ink)] hover:text-white text-[var(--ink)] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] active:scale-95"
          >
            {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCoupon ? 'Copied ✓' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* ── 9) VIDEO CALL REQUEST CARD ── */}
      <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#EADFD6] space-y-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <Video className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-serif font-semibold text-[17px] text-[var(--ink)]">
              See it live in our store
            </h4>
            <p className="text-[14px] text-[var(--muted)] leading-relaxed">
              Request a video call and our team will show you this piece.
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/919844371705?text=${encodeURIComponent(videoCallMessage)}`}
          target="_blank"
          rel="noopener"
          onClick={() => haptic('tap')}
          className="w-full min-h-[48px] rounded-[12px] border-2 border-[#25D366] bg-white hover:bg-emerald-50/50 text-[#128C7E] font-sans text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98]"
        >
          {/* Inline WhatsApp glyph */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.925-7.062A9.925 9.925 0 0 0 12.012 2zm0 18.314h-.003a8.318 8.318 0 0 1-4.241-1.157l-.304-.18-3.155.746.757-3.078-.198-.315a8.272 8.272 0 0 1-1.267-4.346c.001-4.577 3.731-8.303 8.313-8.303 2.217 0 4.302.863 5.869 2.428a8.248 8.248 0 0 1 2.43 5.867c-.002 4.578-3.732 8.304-8.311 8.304zm4.556-6.223c-.25-.125-1.477-.728-1.706-.811-.228-.083-.395-.125-.562.125-.166.25-.645.811-.79 1-.146.187-.291.208-.541.083-.25-.125-1.054-.388-2.008-1.238-.742-.662-1.243-1.48-1.389-1.73-.146-.25-.016-.385.109-.509.113-.112.25-.291.375-.437.125-.146.166-.25.25-.416.083-.167.042-.313-.021-.438-.063-.125-.562-1.354-.77-1.854-.203-.487-.41-.421-.562-.429-.146-.007-.312-.009-.479-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.417 1.02 2.583c.125.167 1.761 2.689 4.267 3.771.596.257 1.061.411 1.424.526.598.19 1.143.163 1.573.099.48-.071 1.477-.604 1.686-1.187.208-.583.208-1.083.146-1.187-.063-.105-.229-.167-.479-.292z" />
          </svg>
          <span>Request video call on WhatsApp</span>
        </a>

        <p className="text-[12px] text-[var(--muted)] text-center">
          Store hours: Mon-Sat 10:30 AM-9:00 PM, Sun 11:00 AM-8:30 PM.
        </p>
      </div>

      {/* ── 10) DELIVERY CHECK CARD ── */}
      <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#EADFD6] space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Truck className="w-4 h-4 text-[var(--cta)]" />
          <span>Check delivery estimate &amp; COD</span>
        </div>

        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincodeInput}
            onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit PIN code"
            className="flex-1 px-3.5 py-2.5 rounded-[10px] border border-[#EADFD6] text-sm focus:outline-none focus:border-[var(--buy)] bg-[#FBF8F4]/30 font-sans min-h-[44px]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-[10px] bg-[var(--buy)] hover:opacity-95 text-white text-xs font-semibold uppercase tracking-wider transition-opacity cursor-pointer min-h-[44px]"
          >
            Check
          </button>
        </form>

        {pincodeStatus && (
          <p
            className={`text-xs font-medium pt-0.5 ${
              pincodeStatus.isSuccess ? 'text-[var(--success)]' : 'text-rose-600'
            }`}
          >
            {pincodeStatus.message}
          </p>
        )}
      </div>

      {/* ── TRUST ROW OF 3 ICONS (Pan-India dispatch, COD available with ₹200 advance, Easy returns) ── */}
      <div className="grid grid-cols-3 gap-2 py-4 px-1 text-center border-y border-[#EADFD6]">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <Truck className="w-5 h-5 text-[var(--cta)]" />
          <span className="text-[12px] font-semibold text-[var(--ink)] leading-tight">
            Pan-India Dispatch
          </span>
          <span className="text-[11px] text-[var(--muted)]">1-2 business days</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 border-x border-[#EADFD6] px-1">
          <ShieldCheck className="w-5 h-5 text-[var(--cta)]" />
          <span className="text-[12px] font-semibold text-[var(--ink)] leading-tight">
            COD Available
          </span>
          <span className="text-[11px] text-[var(--muted)]">₹200 advance</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <RefreshCw className="w-5 h-5 text-[var(--cta)]" />
          <span className="text-[12px] font-semibold text-[var(--ink)] leading-tight">
            Easy Returns
          </span>
          <span className="text-[11px] text-[var(--muted)]">7-day window</span>
        </div>
      </div>

      {/* ── ACCORDIONS (Product details, Size guide, Delivery & returns) ── */}
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
