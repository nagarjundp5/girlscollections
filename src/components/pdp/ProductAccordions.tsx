'use client';

import React, { useState } from 'react';
import { ChevronDown, Truck, ShieldCheck, RefreshCw, Ruler, Info } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface ProductAccordionsProps {
  description: string;
  fabric: string;
  careInstructions: string[];
  subcategory?: string;
  occasion?: string;
  target?: 'women' | 'kids';
  style_silhouette?: string;
  work_type?: string;
  sleeve?: string;
  neckline?: string;
  length_type?: string;
  set_type?: string;
}

export const ProductAccordions: React.FC<ProductAccordionsProps> = ({
  description,
  fabric,
  careInstructions,
  subcategory = 'Ethnic Ensemble',
  occasion = 'Festive & Occasion',
  target = 'women',
  style_silhouette,
  work_type,
  sleeve,
  neckline,
  length_type,
  set_type,
}) => {
  const [openSections, setOpenSections] = useState({
    details: true,
    sizeGuide: false,
    delivery: false,
  });

  const toggle = (sec: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const specs = [
    { label: 'Category', value: subcategory },
    { label: 'Fabric Composition', value: fabric },
    ...(work_type ? [{ label: 'Work & Embroidery', value: work_type }] : []),
    ...(style_silhouette ? [{ label: 'Style & Silhouette', value: style_silhouette }] : []),
    ...(sleeve ? [{ label: 'Sleeve Styling', value: sleeve }] : []),
    ...(neckline ? [{ label: 'Neckline', value: neckline }] : []),
    ...(set_type ? [{ label: 'Set Includes', value: set_type }] : []),
    { label: 'Care Instructions', value: careInstructions.length > 0 ? careInstructions.join(' • ') : 'Dry Clean Recommended' },
    { label: 'Country of Origin', value: 'Handcrafted in India' },
  ];

  return (
    <div className="divide-y divide-[#EADFD6] border-y border-[#EADFD6] font-sans text-sm select-none my-6">
      {/* ── ACCORDION 1: PRODUCT DETAILS ── */}
      <div className="py-3.5">
        <button
          type="button"
          onClick={() => toggle('details')}
          className="w-full flex items-center justify-between text-left font-serif font-semibold text-[17px] text-[var(--ink)] cursor-pointer"
          aria-expanded={openSections.details}
        >
          <span className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[var(--cta)]" />
            <span>Product details</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted)] transition-transform duration-260 ease-out ${
              openSections.details ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-260 ease-out ${
            openSections.details ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-3 pb-2 space-y-3.5 text-[var(--ink)]/85 text-[15px] leading-relaxed">
              {description && <p>{description}</p>}

              <div className="rounded-xl border border-[#EADFD6] bg-[#FBF8F4]/50 divide-y divide-[#EADFD6] text-xs">
                {specs.map((spec, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 p-2.5 gap-1 text-xs">
                    <span className="font-semibold text-[var(--muted)]">{spec.label}</span>
                    <span className="sm:col-span-2 font-medium text-[var(--ink)]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCORDION 2: SIZE GUIDE ── */}
      <div className="py-3.5">
        <button
          type="button"
          onClick={() => toggle('sizeGuide')}
          className="w-full flex items-center justify-between text-left font-serif font-semibold text-[17px] text-[var(--ink)] cursor-pointer"
          aria-expanded={openSections.sizeGuide}
        >
          <span className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-[var(--cta)]" />
            <span>Size guide</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted)] transition-transform duration-260 ease-out ${
              openSections.sizeGuide ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-260 ease-out ${
            openSections.sizeGuide ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-3 pb-2 space-y-2 text-[var(--ink)]/85 text-[14px] leading-relaxed">
              {target === 'kids' ? (
                <>
                  <p>
                    • <strong>Kids Sizing:</strong> Garment numbers correspond to approximate age (e.g. Size 16 fits ~1.5 years, Size 20 fits ~3 years).
                  </p>
                  <p>
                    • <strong>Comfort Fit:</strong> If your child is between sizes or taller than average, we recommend selecting one size up for lasting comfort.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    • <strong>Women&apos;s Sizing:</strong> Fits true to standard Indian ready-to-wear sizing (XS/32 to 3XL/44).
                  </p>
                  <p>
                    • <strong>Relaxed Fit:</strong> For a more relaxed drape or if you fall between two sizes, choose the larger size.
                  </p>
                </>
              )}
              <p className="text-xs text-[var(--muted)] pt-1">
                Have questions regarding measurements? You can also request a quick WhatsApp video call to see the fit live.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCORDION 3: DELIVERY & RETURNS ── */}
      <div className="py-3.5">
        <button
          type="button"
          onClick={() => toggle('delivery')}
          className="w-full flex items-center justify-between text-left font-serif font-semibold text-[17px] text-[var(--ink)] cursor-pointer"
          aria-expanded={openSections.delivery}
        >
          <span className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[var(--cta)]" />
            <span>Delivery &amp; returns</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted)] transition-transform duration-260 ease-out ${
              openSections.delivery ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-260 ease-out ${
            openSections.delivery ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-3 pb-2 space-y-2 text-[var(--ink)]/85 text-[14px] leading-relaxed">
              <p>
                • <strong>Pan-India Dispatch:</strong> Orders dispatched within {siteConfig.dispatchDays}. Delivery within {siteConfig.deliveryDays}. Free shipping on orders above ₹{siteConfig.freeShippingThreshold.toLocaleString('en-IN')}.
              </p>
              <p>
                • <strong>Cash on Delivery (COD):</strong> Available across India with a ₹{siteConfig.codAdvance} advance confirmation.
              </p>
              <p>
                • <strong>Returns &amp; Exchange:</strong> We do NOT offer reverse pickup. To request a return or exchange, you must email{' '}
                <a href={`mailto:${siteConfig.email}`} className="underline text-[var(--ink)] font-medium">
                  {siteConfig.email}
                </a>{' '}
                or call{' '}
                <a href={`tel:${siteConfig.telLink}`} className="underline text-[var(--ink)] font-medium">
                  +91 {siteConfig.phone}
                </a>{' '}
                within {siteConfig.returnWindowDays} days of delivery.
              </p>
              <p>
                • <strong>Item Condition:</strong> Garment must be unused, unwashed, and in original packaging with tags intact. In-person exchanges are also welcome at our Gandhi Bazaar, Bengaluru boutique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAccordions;
