'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

// ─── PLACEHOLDER CONSTANTS (User can customize these) ────────────────────────
export const STORE_IMAGE_PATH = '/store.jpg';
export const STORE_HEADING = 'Visit Our Store';
export const STORE_TAGLINE = 'Experience our collection in person.';
export const STORE_ADDRESS_HERE = 'Shop No. 12, Ground Floor, Royal Heritage Walk, Commercial Street';
export const STORE_CITY_HERE = 'Bengaluru, Karnataka 560001';
export const STORE_HOURS_HERE = 'Mon - Sat: 10:30 AM - 9:00 PM | Sun: 11:00 AM - 8:30 PM';
export const STORE_DIRECTIONS_URL = '#';

export const VisitOurStore: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="w-full bg-[#FAF8F5] py-10 md:py-16 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white shadow-xs border border-[#EFEAE2]">
          {/* Left Column: Full-height store photo with next/image object-fit: cover */}
          <div className="relative w-full h-[340px] sm:h-[400px] md:h-auto md:min-h-[460px] bg-[#F7F2EB] flex items-center justify-center">
            {!imgError ? (
              <Image
                src={STORE_IMAGE_PATH}
                alt="The Girls Collections Store"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="text-center p-8 text-[#1C1417]/60">
                <MapPin className="w-10 h-10 mx-auto mb-2 text-[#C5A059]" />
                <p className="font-serif text-lg font-medium text-[#1C1417]">Storefront View</p>
                <p className="text-xs font-sans mt-1">Image at {STORE_IMAGE_PATH}</p>
              </div>
            )}
          </div>

          {/* Right Column: Soft blush background, heading, tagline, pin icon + address, navy button */}
          <div className="bg-[#FCF5F5] p-8 sm:p-12 md:p-14 lg:p-16 flex flex-col justify-center items-start">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-2">
              Physical Boutique
            </span>
            <h2 className="text-[26px] sm:text-[30px] md:text-[36px] font-serif font-semibold text-[#1C1417] tracking-[0.03em] leading-tight mb-3">
              {STORE_HEADING}
            </h2>
            <p className="text-sm sm:text-base font-sans text-[#1C1417]/75 mb-6">
              {STORE_TAGLINE}
            </p>

            <div className="flex items-start gap-3.5 mb-8">
              <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#F3DDE0]">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div className="space-y-1">
                <p className="font-sans text-sm sm:text-[15px] font-medium text-[#1C1417] leading-relaxed">
                  {STORE_ADDRESS_HERE}
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#1C1417]/70">
                  {STORE_CITY_HERE}
                </p>
                {STORE_HOURS_HERE && (
                  <p className="font-sans text-xs text-[#1C1417]/60 pt-1">
                    {STORE_HOURS_HERE}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={STORE_DIRECTIONS_URL}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1E3A] text-white hover:bg-[#121528] text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors rounded-none shadow-sm"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitOurStore;

