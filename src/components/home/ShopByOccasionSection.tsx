'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface OccasionCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  image: string;
  isHero?: boolean;
}

const OCCASIONS: OccasionCard[] = [
  {
    id: 'festive',
    title: 'Festive Splendor',
    subtitle: 'Handcrafted Anarkalis & Zari Suit Ensembles for Diwali & Pujas',
    tag: 'FESTIVE EDIT',
    href: '/shop?occasion=Festive',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1000',
    isHero: true,
  },
  {
    id: 'wedding',
    title: 'Wedding Guest Couture',
    subtitle: 'Sangeet, Reception & Ceremony Outfits',
    tag: 'WEDDING COUTURE',
    href: '/shop?occasion=Wedding+Guest',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'everyday',
    title: 'Everyday Silk Elegance',
    subtitle: 'Breezy Cotton-Silks & Casual Tunics',
    tag: 'CASUAL LUXURY',
    href: '/shop?occasion=Everyday',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
  },
  {
    id: 'party',
    title: 'Celebration & Party Wear',
    subtitle: 'Indo-Western Fusion & Tulle Frocks',
    tag: 'PARTY GLAMOUR',
    href: '/shop?occasion=Festive',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  },
];

export const ShopByOccasionSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-12 sm:py-20 bg-ivory border-b border-zariGold/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* SECTION HEADER — UPRIGHT EDITORIAL TYPOGRAPHY */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 pb-4 border-b border-zariGold/20 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zariGold shrink-0" />
              <span className="font-sans font-bold text-[11px] sm:text-xs text-zariGold tracking-[0.2em] uppercase">
                SHOP BY INTENT
              </span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-inkNavy tracking-tight leading-[1.15]">
              Shop By Occasion
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-inkNavy/70 leading-relaxed max-w-md">
            Curated ensembles categorized by your celebration — from high-glamour wedding guest attire to comfortable everyday silk kurtas.
          </p>
        </div>

        {/* EDITORIAL OCCASION GRID — ASYMMETRIC HIERARCHY (NO ARCH CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* HERO OCCASION CARD (Spans 12 cols on mobile, 7 cols / 2 rows on desktop) */}
          {OCCASIONS.filter((o) => o.isHero).map((occ) => (
            <motion.div
              key={occ.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-2xl overflow-hidden bg-navy border border-zariGold/25 shadow-md hover:border-zariGold/60 transition-all duration-400 group select-none flex flex-col justify-end p-6 sm:p-8 lg:p-10"
            >
              <Link href={occ.href} className="absolute inset-0 z-20">
                <span className="sr-only">Explore {occ.title}</span>
              </Link>

              {/* Background Image */}
              <Image
                src={occ.image}
                alt={occ.title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-85 group-hover:opacity-95"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/50 to-transparent pointer-events-none z-10" />

              {/* Card Content */}
              <div className="relative z-10 space-y-2.5">
                <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zariGold bg-zariGold/15 backdrop-blur-md px-3 py-1 rounded-md border border-zariGold/30">
                  {occ.tag}
                </span>

                <h3 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-ivory tracking-tight leading-snug group-hover:text-zariGold-light transition-colors">
                  {occ.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-ivory/80 font-light max-w-lg leading-relaxed line-clamp-2">
                  {occ.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-sans font-bold text-zariGold group-hover:text-ivory transition-colors">
                  <span className="uppercase tracking-widest">Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* SECONDARY OCCASION CARDS (3-column grid beside/below hero card) */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
            {OCCASIONS.filter((o) => !o.isHero).map((occ, idx) => (
              <motion.div
                key={occ.id}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className="relative min-h-[220px] sm:min-h-[240px] rounded-2xl overflow-hidden bg-navy border border-zariGold/25 shadow-md hover:border-zariGold/60 transition-all duration-400 group select-none flex flex-col justify-end p-5 sm:p-6"
              >
                <Link href={occ.href} className="absolute inset-0 z-20">
                  <span className="sr-only">Explore {occ.title}</span>
                </Link>

                {/* Background Image */}
                <Image
                  src={occ.image}
                  alt={occ.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-85 group-hover:opacity-95"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/45 to-transparent pointer-events-none z-10" />

                {/* Content */}
                <div className="relative z-10 space-y-1.5">
                  <span className="inline-block text-[9.5px] font-sans font-bold uppercase tracking-[0.2em] text-zariGold bg-zariGold/15 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-zariGold/30">
                    {occ.tag}
                  </span>

                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-ivory tracking-tight leading-snug group-hover:text-zariGold-light transition-colors">
                    {occ.title}
                  </h3>

                  <p className="font-sans text-xs text-ivory/75 font-light line-clamp-1">
                    {occ.subtitle}
                  </p>

                  <div className="pt-1 flex items-center gap-1.5 text-xs font-sans font-bold text-zariGold group-hover:text-ivory transition-colors">
                    <span className="uppercase tracking-widest text-[11px]">Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasionSection;
