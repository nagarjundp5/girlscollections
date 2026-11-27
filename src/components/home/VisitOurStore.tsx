'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export const STORE_IMAGE_PATH = '/store.jpg';
export const STORE_HEADING = 'Visit Our Flagship Boutique';
export const STORE_TAGLINE = 'Experience our handcrafted ethnic couture, lehengas, and children’s festive collections in person.';

export const VisitOurStore: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="w-full bg-[#FAF8F5] py-10 md:py-16 select-none border-t border-[#EAE5DE]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white shadow-xs border border-[#EFEAE2] rounded-3xl">
          {/* Left Column: Full-height store photo with next/image object-fit: cover */}
          <div className="relative w-full h-[320px] sm:h-[380px] md:h-auto md:min-h-[460px] bg-[#F7F2EB] flex items-center justify-center">
            {!imgError ? (
              <Image
                src={STORE_IMAGE_PATH}
                alt="The Girls Collections Flagship Boutique in Gandhi Bazaar, Bengaluru"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="text-center p-8 text-[#1C1417]/60">
                <MapPin className="w-10 h-10 mx-auto mb-2 text-[#C5A059]" />
                <p className="font-serif text-lg font-medium text-[#1C1417]">Gandhi Bazaar Boutique</p>
                <p className="text-xs font-sans mt-1">Basavanagudi, Bengaluru</p>
              </div>
            )}
          </div>

          {/* Right Column: Soft blush background, heading, tagline, pin icon + address, buttons */}
          <div className="bg-[#FCF5F5] p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center items-start">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-2">
              Physical Shop • Gandhi Bazaar
            </span>
            <h2 className="text-[24px] sm:text-[28px] md:text-[34px] font-serif font-bold text-[#1A1E3A] tracking-[0.02em] leading-tight mb-3">
              {STORE_HEADING}
            </h2>
            <p className="text-xs sm:text-sm font-sans text-[#1C1417]/75 mb-6 leading-relaxed">
              {STORE_TAGLINE}
            </p>

            <div className="space-y-4 mb-8 w-full">
              <a
                href={siteConfig.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#F3DDE0] group-hover:border-[#C5A059] transition-colors">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-sans text-xs sm:text-[14px] font-medium text-[#1C1417] leading-relaxed group-hover:text-[#C5A059] transition-colors">
                    {siteConfig.address}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3.5 text-xs text-[#1C1417]/75">
                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 border border-[#F3DDE0]">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                </div>
                <p className="font-sans">{siteConfig.hours}</p>
              </div>

              <div className="flex items-center gap-3.5 text-xs text-[#1C1417]/75">
                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 border border-[#F3DDE0]">
                  <Phone className="w-4 h-4 text-[#C5A059]" />
                </div>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="font-sans font-medium text-[#1A1E3A] hover:text-[#C5A059] transition-colors"
                >
                  +91 {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <a
                href={siteConfig.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3.5 bg-[#1A1E3A] text-white hover:bg-[#121528] text-xs font-sans font-semibold uppercase tracking-[0.14em] transition-colors rounded-xl shadow-xs"
              >
                Get Directions
              </a>
              <a
                href={`tel:${siteConfig.telLink}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3.5 bg-white border border-[#EAE5DE] text-[#1A1E3A] hover:border-[#C5A059] text-xs font-sans font-semibold uppercase tracking-[0.14em] transition-colors rounded-xl"
              >
                Call Boutique
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitOurStore;
