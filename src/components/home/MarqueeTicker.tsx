'use client';

import React from 'react';
import { MARQUEE_MESSAGES } from '@/data/shopData';
import { ButterflyMotif } from '../ui/Motifs';

export const MarqueeTicker: React.FC = () => {
  return (
    <div className="w-full bg-blush/25 border-y border-roseGold/30 py-3.5 overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-12 whitespace-nowrap">
        {[...MARQUEE_MESSAGES, ...MARQUEE_MESSAGES].map((msg, i) => (
          <div key={i} className="flex items-center space-x-4 text-xs font-sans font-semibold text-navy tracking-wider uppercase">
            <span>{msg}</span>
            <ButterflyMotif className="w-4 h-4 text-roseGold" />
          </div>
        ))}
      </div>
    </div>
  );
};
