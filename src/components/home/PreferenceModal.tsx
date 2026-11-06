'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { DivisionPreference, hasStoredPreference, setStoredPreference } from '@/lib/preference';

interface PreferenceModalProps {
  onSelect?: (pref: DivisionPreference) => void;
}

export const PreferenceModal: React.FC<PreferenceModalProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only open about 1s after load if no preference is stored
    if (hasStoredPreference()) return;

    const timer = setTimeout(() => {
      if (!hasStoredPreference()) {
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        setIsOpen(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChoice = React.useCallback((pref: DivisionPreference) => {
    setStoredPreference(pref);
    if (onSelect) onSelect(pref);
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, [onSelect]);

  // iOS-safe scroll lock and ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleChoice('all');
      } else if (e.key === 'Tab') {
        // Focus trap
        if (!modalRef.current) return;
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus into modal
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const firstBtn = modalRef.current.querySelector<HTMLElement>('button');
        firstBtn?.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, handleChoice]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preference-modal-title"
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={() => handleChoice('all')}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Container */}
      <div
        ref={modalRef}
        className={`relative w-full sm:max-w-xl md:max-w-2xl bg-[#FAF6EE] text-[#1C1417] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden z-10 transition-transform duration-200 max-h-[92vh] flex flex-col pt-5 px-5 sm:px-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] ${
          isClosing ? 'translate-y-4 sm:scale-95' : 'translate-y-0 sm:scale-100'
        }`}
      >
        {/* Close Button (X in top right) */}
        <button
          onClick={() => handleChoice('all')}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1C1417] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1417]"
          aria-label="Close and browse everything"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6 pr-8 sm:pr-0">
          <h2
            id="preference-modal-title"
            className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1417]"
          >
            Who are we dressing today?
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-sans text-[#6B6B7B]">
            Select a collection to personalize your experience
          </p>
        </div>

        {/* Two Large Portrait Cards */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 flex-1">
          {/* Card 1: Women */}
          <button
            onClick={() => handleChoice('women')}
            className="group relative flex flex-col items-center overflow-hidden rounded-lg bg-[#EFECE8] border border-[#E2D8CC] hover:border-[#1C1417] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1C1417] cursor-pointer text-left aspect-[3/4]"
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/bgimage1ladies.webp"
                alt="Women's Ethnic Wear"
                fill
                sizes="(max-width: 640px) 45vw, 300px"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
                <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white/80">
                  Couture
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                  Women
                </span>
                <span className="mt-2 inline-flex items-center text-[10px] sm:text-xs font-medium font-sans underline underline-offset-4 text-white/90 group-hover:text-white">
                  Shop Collection &rarr;
                </span>
              </div>
            </div>
          </button>

          {/* Card 2: Kids */}
          <button
            onClick={() => handleChoice('kids')}
            className="group relative flex flex-col items-center overflow-hidden rounded-lg bg-[#EFECE8] border border-[#E2D8CC] hover:border-[#1C1417] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1C1417] cursor-pointer text-left aspect-[3/4]"
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/bgimage1kids.webp"
                alt="Kids Ethnic Wear"
                fill
                sizes="(max-width: 640px) 45vw, 300px"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
                <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white/80">
                  Pure Silk & Frocks
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                  Kids
                </span>
                <span className="mt-2 inline-flex items-center text-[10px] sm:text-xs font-medium font-sans underline underline-offset-4 text-white/90 group-hover:text-white">
                  Shop Collection &rarr;
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Small "Browse everything" text link */}
        <div className="mt-5 text-center">
          <button
            onClick={() => handleChoice('all')}
            className="text-xs sm:text-sm font-sans font-medium text-[#6B6B7B] hover:text-[#1C1417] underline underline-offset-4 transition-colors cursor-pointer py-1 px-3 focus:outline-none"
          >
            Browse everything
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceModal;
