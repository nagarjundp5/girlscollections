'use client';

import React from 'react';

const MARQUEE_ITEMS = [
  "HANDCRAFTED ROYAL WEAVES",
  "LIMITED EDITION FROCKS",
  "PURE KANJEEVARAM SILKS",
  "100% COTTON LINED KIDS ETHNIC",
  "SILK MARK CERTIFIED",
  "DESIGNED IN INDIA",
  "COMPLIMENTARY GIFT PACKAGING",
];

export const SlowPremiumMarquee: React.FC = () => {
  return (
    <div className="w-full bg-[#F5F0EB] text-navy border-y border-navy/10 py-2.5 overflow-hidden select-none relative">
      <div className="flex w-max motion-reduce:transform-none animate-marquee space-x-8 text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-navy/80">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-8 shrink-0">
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-roseGold inline-block shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlowPremiumMarquee;
