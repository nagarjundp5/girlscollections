'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const CraftsmanshipStatementSection: React.FC = () => {
  return (
    <section className="w-full py-12 sm:py-20 md:py-24 bg-ivory border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Side: Large Display Serif Quote & Emblem */}
        <div className="lg:col-span-7 space-y-6 text-left relative">
          {/* Oversized Decorative Rose-Gold Opening Quotation Mark Glyph */}
          <span
            className="absolute -top-12 -left-4 sm:-top-16 sm:-left-8 text-[140px] sm:text-[200px] font-serif font-bold text-zariGold/15 leading-none select-none pointer-events-none z-0"
            aria-hidden="true"
          >
            “
          </span>

          <div className="relative z-10 space-y-6">
            <span className="eyebrow-text text-zariGold font-semibold text-xs tracking-[0.25em]">
              HERITAGE PHILOSOPHY
            </span>

            {/* Scroll-triggered fade + rise on quote text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-inkNavy leading-[1.08] tracking-[-0.02em]">
                &ldquo;Crafted for women who appreciate timeless elegance.&rdquo;
              </h2>
              <div className="w-[60px] h-[2px] bg-gold-gradient mt-4" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-base sm:text-xl font-serif italic font-medium text-inkNavy/85 leading-relaxed max-w-xl"
            >
              Every thread tells a story of royal South Indian heritage, hand-woven with precision and passed down through master artisans.
            </motion.p>

            {/* Authentic Handloom Seal with Rotate-In Stamp Animation on Scroll */}
            <motion.div
              initial={{ opacity: 0, rotate: -15, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
              className="pt-4 flex items-center gap-4"
            >
              <div className="relative w-20 h-20 flex items-center justify-center select-none shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-zariGold animate-spin-slow">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[8.5px] font-sans uppercase font-bold tracking-[0.2em] fill-zariGold">
                    <textPath href="#circlePath">
                      THE GIRLS COLLECTIONS • EST. 2024 •
                    </textPath>
                  </text>
                </svg>
                <div className="absolute w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-md font-serif text-xs font-bold">
                  TGC
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-sans font-bold tracking-[0.18em] text-inkNavy">
                  Authentic Handloom Seal
                </p>
                <p className="text-xs font-sans font-semibold text-inkNavy/70">
                  Guaranteed Pure Silk &amp; Zari Authenticity
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Temple Arch Framed Detail Photo */}
        <div className="lg:col-span-5 relative">
          <div className="arch-frame aspect-[4/5] w-full shadow-2xl group block">
            <div className="arch-inner relative w-full h-full overflow-hidden bg-woven-texture">
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800"
                alt="Silk Texture Detail"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inkNavy/85 via-transparent to-transparent p-6 flex items-end">
                <p className="text-xs font-sans text-ivory/95 uppercase tracking-[0.15em] font-bold">
                  Detail: 24k Brushed Zari &amp; Hand-Loomed Motif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipStatementSection;
