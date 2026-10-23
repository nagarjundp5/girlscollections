'use client';

import React, { useState } from 'react';
import { Product } from '@/data/shopData';
import { useShop } from '@/context/ShopContext';
import {
  HeartIcon,
  ShoppingBagIcon,
  PackageIcon,
  RulerIcon,
  CheckIcon,
  WhatsAppIcon,
  SparklesIcon,
  TruckIcon,
} from '@/components/ui/BrandIcons';
import { Plus, Minus, Star, ShieldCheck, RefreshCw, Video } from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';
import { ProductAccordions } from './ProductAccordions';
import OfferCard from '@/components/ui/OfferCard';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [needsAlteration, setNeedsAlteration] = useState<'No' | 'Yes'>('No');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAdd = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1200);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Calculate estimated delivery date (4 business days from today)
  const deliveryDateStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const emiMonthly = Math.round(product.price / 3);

  return (
    <div className="space-y-6 text-navy font-sans select-none">
      {/* Category Eyebrow, SKU & Rating Row */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="eyebrow-text text-roseGold capitalize font-semibold tracking-eyebrow">
            TGC LUXE • {product.target}&apos;S {product.subcategory}
          </span>
          <div className="flex items-center space-x-1 text-xs text-roseGold font-semibold">
            <Star className="w-3.5 h-3.5 fill-roseGold text-roseGold" />
            <span>{product.rating}</span>
            <span className="text-navy/50 font-normal">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* SKU Line */}
        <p className="text-[11px] font-mono text-navy/40 uppercase tracking-widest">
          SKU: TGC-{product.id.toUpperCase()}-2026
        </p>
      </div>

      {/* Product Title (Fraunces Display Serif) */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-navy leading-snug">
        {product.name}
      </h1>

      {/* Pricing & Tax Note */}
      <div className="space-y-3 border-b border-roseGold/20 pb-5">
        <div className="flex items-baseline space-x-3">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy font-tnum">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-base text-navy/40 line-through font-tnum">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-oxblood text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Save {discountPercent}%
              </span>
            </>
          )}
          <span className="text-[11px] text-navy/60 block ml-auto font-medium">
            Inclusive of all taxes
          </span>
        </div>

        {/* EMI / Pay Later Strip Styled as Soft Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-sand/20 border border-roseGold/30 text-xs text-navy/80">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-4 h-4 text-roseGold shrink-0" />
            <span>
              Or pay in 3 interest-free EMIs of <strong className="font-extrabold text-navy">₹{emiMonthly.toLocaleString('en-IN')}/mo</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white border border-roseGold/30 text-[10px] font-bold text-roseGold uppercase tracking-wider shrink-0">
            Simpl / Razorpay
          </span>
        </div>
      </div>

      {/* Color Variant Selector */}
      {product.colors.length > 0 && (
        <div className="space-y-2 pt-1">
          <label className="text-xs font-sans font-semibold text-navy uppercase tracking-[0.14em] block">
            Color: <span className="text-roseGold font-normal">{selectedColor}</span>
          </label>
          <div className="flex items-center space-x-3">
            {product.colors.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                title={col.name}
                className={`w-7 h-7 rounded-full border transition-all p-0.5 cursor-pointer ${
                  selectedColor === col.name ? 'border-roseGold scale-110 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <span
                  className="w-full h-full rounded-full block border border-black/10 shadow-2xs"
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector with Diagonal Strike & Scale Micro-Animation */}
      <div className={`space-y-3 pt-1 rounded-xl p-2 transition-all ${sizeError ? 'bg-red-50/80 border border-red-300' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans font-semibold text-navy uppercase tracking-[0.14em]">
            Select Size:{' '}
            {selectedSize ? (
              <span className="text-[#B8924A] font-semibold">{selectedSize}</span>
            ) : (
              <span className="text-red-600 font-medium normal-case ml-1">
                {sizeError ? '— Please select a size first' : '(Required)'}
              </span>
            )}
          </label>
          <button
            onClick={() => setSizeChartOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-[#B8924A] hover:text-navy transition-colors font-medium cursor-pointer"
          >
            <RulerIcon className="w-3.5 h-3.5 text-[#B8924A]" />
            <span className="underline decoration-[#B8924A]/40 underline-offset-4">Size Guide</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {product.sizes.map((s) => {
            const isSelected = selectedSize === s.size;
            return (
              <button
                key={s.size}
                disabled={!s.inStock}
                onClick={() => {
                  setSelectedSize(s.size);
                  setSizeError(false);
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  !s.inStock
                    ? 'opacity-40 bg-sand/30 border-navy/20 cursor-not-allowed text-navy/40 line-through after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-navy/30 after:to-transparent'
                    : isSelected
                    ? 'bg-navy text-ivory border-navy shadow-md scale-105 ring-2 ring-[#B8924A]'
                    : 'bg-ivory text-navy border-roseGold/30 hover:border-roseGold hover:bg-sand/20'
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Alteration Segmented Control */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans font-semibold text-navy uppercase tracking-[0.14em]">
            Custom Fitting / Alteration:
          </label>
          <span className="text-[11px] text-navy/50 font-normal">Complimentary concierge service</span>
        </div>
        <div className="inline-flex p-1 bg-sand/30 rounded-xl border border-roseGold/30 w-full sm:w-auto">
          <button
            onClick={() => setNeedsAlteration('No')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              needsAlteration === 'No'
                ? 'bg-navy text-ivory shadow-2xs'
                : 'text-navy/70 hover:text-navy'
            }`}
          >
            No (Standard Ready Size)
          </button>
          <button
            onClick={() => setNeedsAlteration('Yes')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              needsAlteration === 'Yes'
                ? 'bg-navy text-ivory shadow-2xs'
                : 'text-navy/70 hover:text-navy'
            }`}
          >
            Yes (Custom Measurements)
          </button>
        </div>
      </div>

      {/* Quantity Stepper & Primary Add to Cart CTA */}
      <div className="space-y-4 pt-3">
        <div className="flex items-center space-x-4">
          <label className="text-xs font-sans font-semibold text-navy uppercase tracking-[0.14em]">
            Quantity:
          </label>
          <div className="flex items-center border border-roseGold/40 rounded-xl px-3 py-1 bg-ivory">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-navy hover:text-roseGold p-1 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 text-xs font-bold text-navy font-tnum">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-navy hover:text-roseGold p-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary CTA with Press Animation & Morphing Success State */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className={`flex-1 py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
              addedNotice
                ? 'bg-emerald-700 text-white scale-[0.99]'
                : 'btn-gold-gradient text-white active:scale-[0.98]'
            }`}
          >
            {addedNotice ? (
              <>
                <CheckIcon className="w-5 h-5 text-white animate-bounce" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-5 h-5 text-white" />
                <span>Add To Bag</span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-4 rounded-xl border border-roseGold/30 transition-all cursor-pointer active:scale-95 ${
              inWishlist ? 'text-oxblood bg-ivory shadow-sm' : 'text-navy hover:bg-roseGold/10'
            }`}
            title="Wishlist"
          >
            <HeartIcon className="w-5 h-5" filled={inWishlist} color={inWishlist ? '#7A1F2B' : 'currentColor'} />
          </button>
        </div>
      </div>

      {/* Delivery Estimate Row with Custom Vector Package Icon */}
      <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-ivory border border-roseGold/25 shadow-2xs">
        <div className="w-9 h-9 rounded-full bg-roseGold/15 border border-roseGold/30 flex items-center justify-center text-roseGold shrink-0">
          <PackageIcon className="w-4 h-4 text-roseGold" />
        </div>
        <div className="text-xs font-sans text-navy">
          <span>Estimated Pan-India Delivery: </span>
          <strong className="font-extrabold text-navy">{deliveryDateStr}</strong>
          <span className="block text-[11px] text-navy/60">Dispatch within 24-48 business hours</span>
        </div>
      </div>

      {/* Quick Action Buttons (WhatsApp Concierge & Video Shopping) */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://wa.me/919999999999?text=Hi%20TGC%2C%20I%20would%20like%20to%20know%20more%20about%20this%20product"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-roseGold/30 bg-white text-navy text-xs font-medium hover:border-roseGold transition-colors shadow-2xs"
        >
          <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp Inquiry</span>
        </a>
        <button
          onClick={() => alert('Video shopping concierge slot booking requested! Our stylist will contact you.')}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-roseGold/30 bg-white text-navy text-xs font-medium hover:border-roseGold transition-colors shadow-2xs cursor-pointer"
        >
          <Video className="w-4 h-4 text-roseGold" />
          <span>Video Consultation</span>
        </button>
      </div>

      {/* Embedded In-Page Offer Card */}
      <div className="pt-2">
        <OfferCard
          code="FESTIVE10"
          headline="Get 10% Off Your First Purchase"
          subtext="Valid sitewide across Women & Kids collections"
        />
      </div>

      {/* Single-Line Trust Badges */}
      <div className="flex items-center justify-between gap-2 py-3 px-1 text-[11px] text-navy/70 border-t border-b border-roseGold/20 mt-4">
        <div className="flex items-center space-x-1.5">
          <TruckIcon className="w-3.5 h-3.5 text-roseGold shrink-0" />
          <span>Pan-India Dispatch</span>
        </div>
        <span className="text-roseGold/30">•</span>
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-roseGold shrink-0" />
          <span>COD Available</span>
        </div>
        <span className="text-roseGold/30">•</span>
        <div className="flex items-center space-x-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-roseGold shrink-0" />
          <span>7-Day Easy Returns</span>
        </div>
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
