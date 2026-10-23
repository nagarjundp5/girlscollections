'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface EditorialFeatureProps {
  kicker: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaText?: string;
  ctaHref?: string;
  reversed?: boolean;
}

export const EditorialFeature: React.FC<EditorialFeatureProps> = ({
  kicker,
  title,
  description,
  image,
  imageAlt,
  ctaText = 'DISCOVER THE CRAFT',
  ctaHref = '/shop',
  reversed = false,
}) => {
  return (
    <section className="w-full py-16 sm:py-20 md:py-28 bg-ivory text-inkNavy border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center ${reversed ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Editorial Large Feature Image */}
          <div className={`md:col-span-7 relative h-[420px] sm:h-[500px] md:h-[600px] w-full rounded-2xl overflow-hidden border border-zariGold/25 shadow-lg ${reversed ? 'md:order-2' : 'md:order-1'}`}>
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inkNavy/40 via-transparent to-transparent" />
          </div>

          {/* Editorial Content Block */}
          <div className={`md:col-span-5 flex flex-col justify-center ${reversed ? 'md:order-1' : 'md:order-2'}`}>
            {/* Kicker with thin gold line */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans font-semibold text-xs text-zariGold tracking-[0.25em] uppercase">
                {kicker}
              </span>
              <div className="h-[1px] w-8 bg-zariGold/40" />
            </div>

            {/* Serif Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-inkNavy leading-[1.15] tracking-tight mb-4">
              {title}
            </h2>

            {/* Narrative Copy */}
            <p className="text-sm sm:text-base font-sans text-inkNavy/80 font-normal leading-relaxed mb-6">
              {description}
            </p>

            {/* Action CTA */}
            {ctaText && ctaHref && (
              <div>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-inkNavy text-white hover:bg-zariGold hover:text-white border border-zariGold/30 rounded-md text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md group"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default EditorialFeature;
