'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TruckIcon, ShieldCheckIcon, RefreshCwIcon } from '@/components/ui/BrandIcons';

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
    shipping: false,
    fit: false,
  });

  const toggle = (sec: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const specs = [
    { label: 'Category', value: subcategory },
    { label: 'Fabric Composition', value: fabric },
    ...(work_type ? [{ label: 'Work & Embroidery', value: work_type }] : [{ label: 'Work & Embroidery', value: 'Handwoven Gold Zari & Needlework' }]),
    ...(style_silhouette ? [{ label: 'Style & Silhouette', value: style_silhouette }] : []),
    ...(sleeve ? [{ label: 'Sleeve Styling', value: sleeve }] : []),
    ...(neckline ? [{ label: 'Neckline', value: neckline }] : []),
    ...(set_type ? [{ label: 'Set Includes', value: set_type }] : []),
    { label: 'Chest Pads', value: target === 'women' ? 'Included (Padded Blouse)' : 'Not Applicable (Kids Soft Cotton)' },
    { label: 'Bottom Type', value: target === 'women' ? 'Flared Lehenga Skirt / Elasticated Pants' : 'Pre-stitched Elasticated Dhoti / Frock' },
    { label: 'Care Instructions', value: careInstructions.length > 0 ? careInstructions.join(' • ') : 'Dry Clean Recommended' },
    { label: 'Country of Origin', value: 'Handcrafted in India' },
  ];

  return (
    <div className="divide-y divide-roseGold/20 border-y border-roseGold/20 font-sans text-xs text-navy my-8 select-none">
      {/* ACCORDION 1: PRODUCT DETAILS & SPECS */}
      <div className="py-4">
        <button
          onClick={() => toggle('details')}
          className="w-full flex items-center justify-between font-serif font-bold text-sm sm:text-base text-navy text-left cursor-pointer"
        >
          <span>Product Details &amp; Specifications</span>
          {openSections.details ? (
            <ChevronUp className="w-4 h-4 text-roseGold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-roseGold" />
          )}
        </button>

        {openSections.details && (
          <div className="mt-3 space-y-4">
            <p className="text-navy/80 leading-relaxed font-normal">
              {description}
            </p>

            {/* Clean Two-Column Key-Value Spec List with Fine Gold Hairline Dividers */}
            <div className="rounded-xl border border-roseGold/25 bg-white/70 overflow-hidden shadow-2xs divide-y divide-roseGold/15">
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 p-3 gap-1 sm:gap-4 text-xs">
                  <span className="font-semibold text-navy/70 uppercase tracking-wider text-[10.5px]">
                    {spec.label}
                  </span>
                  <span className="sm:col-span-2 font-medium text-navy">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 2: SHIPPING & RETURNS */}
      <div className="py-4">
        <button
          onClick={() => toggle('shipping')}
          className="w-full flex items-center justify-between font-serif font-bold text-sm sm:text-base text-navy text-left cursor-pointer"
        >
          <span>Shipping, COD &amp; Returns Policy</span>
          {openSections.shipping ? (
            <ChevronUp className="w-4 h-4 text-roseGold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-roseGold" />
          )}
        </button>

        {openSections.shipping && (
          <div className="mt-3 space-y-3 text-navy/80">
            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-sand/20 border border-roseGold/20">
              <TruckIcon className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
              <span>Complimentary Pan-India express shipping on orders above ₹1,999. Dispatch within 24-48 business hours.</span>
            </div>
            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-sand/20 border border-roseGold/20">
              <ShieldCheckIcon className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
              <span>Cash on Delivery (COD) available nationwide with secure OTP phone verification at checkout.</span>
            </div>
            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-sand/20 border border-roseGold/20">
              <RefreshCwIcon className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
              <span>Hassle-free 7-day doorstep return and size exchange policy for 100% fit assurance.</span>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 3: SIZE & FIT NOTES */}
      <div className="py-4">
        <button
          onClick={() => toggle('fit')}
          className="w-full flex items-center justify-between font-serif font-bold text-sm sm:text-base text-navy text-left cursor-pointer"
        >
          <span>Size &amp; Fit Notes</span>
          {openSections.fit ? (
            <ChevronUp className="w-4 h-4 text-roseGold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-roseGold" />
          )}
        </button>

        {openSections.fit && (
          <div className="mt-3 space-y-2 text-navy/80 leading-relaxed font-normal">
            <p>
              • <strong>Fit Recommendation:</strong> True to standard Indian size charts. If between sizes, we recommend selecting one size up for comfort.
            </p>
            <p>
              • <strong>Model Context:</strong> Model is 5&apos;8&quot; (173cm) wearing Size Small (S).
            </p>
            <p>
              • <strong>Alteration Support:</strong> 2-inch inner margin provided in all side seams for easy home/tailor alterations if required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAccordions;
