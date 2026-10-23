'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ButterflyMotif } from '../ui/Motifs';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      id="newsletter"
      className="py-20 sm:py-28 bg-blush/20 border-y border-roseGold/30 text-navy relative overflow-hidden scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-roseGold/15 border border-roseGold/30 text-xs font-medium text-roseGold-dark uppercase tracking-[0.22em]">
          <ButterflyMotif className="w-4 h-4 text-roseGold" />
          <span>Privé VIP Club</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-navy leading-[0.98] tracking-tight">
          Be The First To Experience Our New Drops
        </h2>

        <p className="text-sm text-charcoal-muted max-w-lg mx-auto font-sans font-light leading-relaxed">
          Receive exclusive early access to handloom suits, bespoke kids ethnic releases, 
          and complimentary styling consultations.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-ivory border border-roseGold text-roseGold font-serif text-base max-w-md mx-auto shadow-md">
            ✨ Welcome! You are now subscribed to The Girls Collection royal updates.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your personal email address..."
              required
              className="flex-1 px-6 py-4 rounded-full bg-ivory border border-roseGold/40 text-navy placeholder-charcoal-muted/50 focus:outline-none focus:border-roseGold text-sm font-sans shadow-sm"
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-full bg-navy text-ivory text-xs font-bold uppercase tracking-widest hover:bg-roseGold hover:text-navy transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shrink-0"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
