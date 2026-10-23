'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  initials: string;
  quote: string;
  product: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ananya Rao',
    location: 'Bengaluru',
    initials: 'AR',
    quote: 'The Kanjeevaram silk anarkali ensemble was pure perfection for my sister’s wedding. The zari finish felt custom-tailored and truly regal.',
    product: 'Champagne Gold Zari Anarkali',
  },
  {
    id: '2',
    name: 'Meera Krishnan',
    location: 'Chennai',
    initials: 'MK',
    quote: 'Finding kids ethnic wear with itch-free cotton lining was a game changer. My daughter wore her pattu frock all evening without a complaint.',
    product: 'Pure Silk Kids Pattu Frock',
  },
  {
    id: '3',
    name: 'Pooja Reddy',
    location: 'Hyderabad',
    initials: 'PR',
    quote: 'The Girls Collections delivers couture-level craftsmanship at a fraction of boutique prices. The packaging and custom fitting were outstanding.',
    product: 'Bridal Zari Lehenga Edit',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="w-full py-12 sm:py-20 md:py-24 bg-sand/30 border-b border-zariGold/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="eyebrow-text text-zariGold font-semibold text-xs tracking-[0.25em] block mb-1">
            PATRON STORIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-inkNavy">
            Voices of Elegance
          </h2>
          <div className="w-12 h-[2px] bg-gold-gradient mx-auto mt-3" />
        </div>

        {/* 3-Up Desktop Grid / Horizontal Scroll-Snap Rail on Mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar md:overflow-visible snap-x snap-mandatory pb-4 px-1 -mx-1">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
              className="snap-start shrink-0 w-[85vw] sm:w-[360px] md:w-auto bg-ivory rounded-[2px] p-6 sm:p-8 border border-zariGold/25 shadow-md flex flex-col justify-between space-y-6"
            >
              {/* Initials Mark - Larger Rose-Gold Filled Circle */}
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-full bg-gold-gradient text-white flex items-center justify-center font-serif font-bold text-base shadow-md shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-inkNavy">{t.name}</h3>
                  <p className="text-xs font-sans font-semibold text-inkNavy/60">{t.location}</p>
                </div>
              </div>

              {/* Display Serif Pull Quote */}
              <p className="text-base sm:text-lg font-serif italic font-medium text-inkNavy/90 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Thin Gold Divider */}
              <div className="w-full h-[1px] bg-zariGold/25" />

              <p className="text-[11px] font-sans uppercase tracking-[0.18em] text-zariGold font-bold">
                Purchased: {t.product}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
