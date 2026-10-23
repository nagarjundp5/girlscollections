'use client';

import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSidebar, FilterState } from './FilterSidebar';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  resultsCount: number;
  productCounts?: Record<string, number>;
}

const silkEase = [0.16, 1, 0.3, 1] as const;

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  resultsCount,
  productCounts,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden lg:hidden flex flex-col justify-end select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-inkNavy/70 backdrop-blur-md"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative z-10 w-full max-h-[88vh] bg-ivory text-inkNavy rounded-t-[32px] shadow-2xl flex flex-col justify-between border-t border-zariGold/40 overflow-hidden touch-pan-y"
          >
            {/* Header Bar */}
            <div className="p-4 sm:p-5 border-b border-zariGold/20 flex items-center justify-between sticky top-0 bg-ivory/95 backdrop-blur-md z-20 rounded-t-[32px]">
              <div className="w-12 h-1.5 rounded-full bg-zariGold/35 mx-auto absolute inset-x-0 top-2.5" />
              <div className="mt-2">
                <span className="font-sans font-extrabold text-[9.5px] text-zariGold tracking-[0.22em] uppercase block">
                  REFINE CATALOGUE
                </span>
                <h3 className="text-xl font-serif font-bold text-inkNavy">Filter Products</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onReset}
                  className="p-2 text-zariGold hover:text-inkNavy transition-colors text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  aria-label="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-inkNavy/5 border border-zariGold/35 flex items-center justify-center text-inkNavy hover:bg-zariGold hover:text-white transition-colors cursor-pointer"
                  aria-label="Close filter drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-ivory overscroll-contain">
              <FilterSidebar filters={filters} onChange={onChange} onReset={onReset} productCounts={productCounts} />
            </div>

            {/* Apply CTA Footer with Live Result Count */}
            <div className="p-4 pb-[calc(1.2rem+env(safe-area-inset-bottom,0px))] border-t border-zariGold/20 bg-ivory/95 backdrop-blur-md flex items-center gap-3 shrink-0">
              <button
                onClick={onReset}
                className="w-1/3 py-3.5 rounded-xl border border-zariGold/40 text-xs font-sans font-bold uppercase tracking-widest text-inkNavy hover:bg-sand/30 transition-colors text-center cursor-pointer"
              >
                RESET
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-navy hover:bg-navy-dark text-white text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-zariGold/40"
              >
                <Check className="w-4 h-4 text-zariGold" />
                <span>SHOW {resultsCount} PIECES</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

