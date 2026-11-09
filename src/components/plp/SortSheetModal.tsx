'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/useScrollLock';

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Best Sellers' },
  { value: 'discount', label: 'Discount %' },
];

interface SortSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: string;
  onSelectSort: (val: string) => void;
}

export const SortSheetModal: React.FC<SortSheetModalProps> = ({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
}) => {
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        unlockBodyScroll();
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sort options"
      className="fixed inset-0 z-[110] flex flex-col justify-end sm:justify-center sm:items-center font-sans select-none"
    >
      {/* Dim Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
      />

      {/* Modal / Sheet Container */}
      <div
        className="relative z-10 w-full sm:max-w-md bg-white border border-[#E8E2D9] shadow-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="text-[15px] font-medium tracking-[0.04em] uppercase text-[#1C1417]">
            Sort By
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close sort dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options list */}
        <div className="py-2">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelectSort(opt.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-6 py-3.5 text-left text-[14px] transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-semibold text-[#1C1417] bg-neutral-50'
                    : 'font-normal text-neutral-600 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#1C1417]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

