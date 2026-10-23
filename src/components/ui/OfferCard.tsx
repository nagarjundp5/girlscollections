'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PercentageIcon, CheckIcon, CopyIcon } from '@/components/ui/BrandIcons';

interface OfferCardProps {
  code?: string;
  headline?: string;
  subtext?: string;
  className?: string;
  compact?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  code = 'TGC10',
  headline = 'New to TGC? Get 10% Off',
  subtext = 'Use code at checkout for instant 10% savings',
  className = '',
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-dashed border-zariGold/40 bg-ivory/95 p-3.5 sm:p-4 shadow-xs select-none transition-all hover:border-zariGold/60 ${className}`}
    >
      {/* Subtle single glint shine on mount */}
      <motion.div
        initial={{ x: '-100%', opacity: 0.6 }}
        animate={{ x: '200%', opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
        className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-zariGold/20 to-transparent skew-x-[-20deg]"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Soft-tinted Circle Icon Container (blush/gold tint) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blush/40 border border-zariGold/30 flex items-center justify-center text-zariGold shrink-0 shadow-2xs">
            <PercentageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-zariGold" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-sans font-bold text-inkNavy truncate leading-snug">
                {headline}
              </h4>
            </div>
            {!compact && (
              <p className="text-[11px] font-sans text-inkNavy/60 truncate mt-0.5">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Copy-able Code Chip with Tap Morphing Feedback */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative group">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wide transition-all active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                  : 'bg-white border-zariGold/40 text-inkNavy hover:border-zariGold hover:bg-sand/20 shadow-2xs'
              }`}
              title="Copy code"
            >
              <span className="font-semibold">{code}</span>
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CopyIcon className="w-3.5 h-3.5 text-zariGold" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
