'use client';

import React from 'react';

export const ButterflyMotif: React.FC<{ className?: string; color?: string }> = ({
  className = "w-6 h-6",
  color = "#C9A66B",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 19V5M12 5C10 2.5 5 2 3 5C1 8 3 13 6 14C9 15 11 12 12 11M12 5C14 2.5 19 2 21 5C23 8 21 13 18 14C15 15 13 12 12 11M12 19C9.5 21 5 21.5 3.5 19C2 16.5 4.5 14.5 6.5 15.5C8.5 16.5 10.5 17.5 12 19ZM12 19C14.5 21 19 21.5 20.5 19C22 16.5 19.5 14.5 17.5 15.5C15.5 16.5 13.5 17.5 12 19Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="5" r="1" fill={color} />
  </svg>
);

export const FloralDivider: React.FC<{ className?: string }> = ({ className = "my-8" }) => (
  <div className={`flex items-center justify-center space-x-4 ${className}`}>
    <div className="h-[1px] bg-gradient-to-r from-transparent via-roseGold/40 to-roseGold w-24 sm:w-40" />
    <ButterflyMotif className="w-5 h-5 opacity-90" />
    <div className="h-[1px] bg-gradient-to-l from-transparent via-roseGold/40 to-roseGold w-24 sm:w-40" />
  </div>
);

export const RoseGoldBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-roseGold/15 text-roseGold-dark border border-roseGold/30 uppercase tracking-wider ${className}`}
  >
    {children}
  </span>
);

export const SageStockBadge: React.FC<{ inStock: boolean; className?: string }> = ({
  inStock,
  className = "",
}) => (
  <span
    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      inStock
        ? 'bg-sage/15 text-sage-dark border border-sage/30'
        : 'bg-charcoal/10 text-charcoal-muted border border-charcoal/20'
    } ${className}`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-sage animate-pulse' : 'bg-charcoal-muted'}`}
    />
    <span>{inStock ? 'In Stock — Ships Today' : 'Pre-Order / Out of Stock'}</span>
  </span>
);
