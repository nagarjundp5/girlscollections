'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const SecondaryCampaignBanner: React.FC = () => {
  return (
    <section className="w-full relative py-10 sm:py-16 bg-ivory overflow-hidden border-b border-zariGold/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] min-h-[420px] w-full rounded-[2px] overflow-hidden border border-zariGold/30 shadow-2xl bg-inkNavy text-ivory flex items-center">
          {/* Background Campaign Image with Slow Ken Burns Zoom */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=90&w=1800"
              alt="Festive Edit Campaign"
              fill
              className="object-cover object-center opacity-85"
              sizes="100vw"
            />
          </motion.div>

          {/* Dark Scrim Overlay to ensure text & CTA never touch edges or clip */}
          <div className="absolute inset-0 bg-gradient-to-r from-inkNavy/95 via-inkNavy/75 to-transparent sm:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-inkNavy/90 via-transparent to-transparent sm:hidden" />

          {/* Campaign Content Block */}
          <div className="relative z-10 max-w-xl p-6 sm:p-12 md:p-16 text-left space-y-4">
            <span className="eyebrow-text text-zariGold font-semibold text-xs tracking-[0.25em]">
              SEASONAL SPOTLIGHT
            </span>

            <div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory tracking-tight leading-tight">
                Festive Edit &apos;26
              </h2>
              <div className="w-16 h-[2px] bg-gold-gradient mt-3" />
            </div>

            <p className="text-xs sm:text-base font-sans font-semibold text-ivory/90 max-w-md">
              Opulent zari handwork and fluid silk drapes designed for celebratory radiance.
            </p>

            <div className="pt-2">
              <Link
                href="/shop?occasion=Festive"
                className="px-8 py-3.5 bg-zariGold hover:bg-zariGold-dark text-inkNavy font-sans font-bold text-xs uppercase tracking-[0.2em] inline-block shadow-xl active:scale-95 transition-all duration-300 rounded-none"
              >
                Discover the Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecondaryCampaignBanner;
