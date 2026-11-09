'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FirstOrderOfferPopup() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const checkEligibility = async () => {
      // 1. Check local storage first
      const localDismissed = localStorage.getItem('tgc_first_offer_dismissed');
      if (localDismissed === 'true') return;

      // 2. If logged in, check server dismissal status
      if (user) {
        try {
          const res = await fetch('/api/user/dismiss-offer');
          if (res.ok) {
            const data = await res.json();
            if (data.dismissed) {
              localStorage.setItem('tgc_first_offer_dismissed', 'true');
              return;
            }
          }
        } catch (err) {
          console.error('Failed to check offer status:', err);
        }
      }

      // Small delay to prevent layout pop on initial render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);

      return () => clearTimeout(timer);
    };

    checkEligibility();
  }, [user, isLoaded]);

  const handleDismiss = async () => {
    setIsOpen(false);
    localStorage.setItem('tgc_first_offer_dismissed', 'true');

    if (user) {
      try {
        await fetch('/api/user/dismiss-offer', { method: 'POST' });
      } catch (err) {
        console.error('Failed to persist offer dismissal:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0F172A] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close offer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome Gift
        </div>

        {/* Headline */}
        <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-wide font-normal mb-2">
          10% OFF + FREE DELIVERY
        </h3>
        
        <p className="text-rose-100/80 text-sm sm:text-base mb-6 leading-relaxed">
          Enjoy flat 10% off plus complimentary shipping automatically on your very first order with us.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          {user ? (
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F172A] font-semibold text-sm uppercase tracking-wider hover:opacity-95 transition-opacity"
            >
              Claim & Shop Now
            </button>
          ) : (
            <Link
              href="/sign-in"
              onClick={handleDismiss}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F172A] font-semibold text-sm uppercase tracking-wider hover:opacity-95 transition-opacity inline-block"
            >
              Sign In to Claim
            </Link>
          )}

          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors uppercase tracking-wider py-1"
          >
            No thanks, I&apos;ll browse full price
          </button>
        </div>
      </div>
    </div>
  );
}

