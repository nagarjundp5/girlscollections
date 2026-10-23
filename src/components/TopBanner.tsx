'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANNOUNCEMENTS = [
  { text: 'USE CODE "GIRLS100" FOR ₹100 OFF FIRST ORDER', badge: 'WELCOME OFFER' },
  { text: 'COMPLIMENTARY SHIPPING ON ORDERS OVER ₹1,999', badge: 'FREE EXPRESS' },
  { text: 'CASH ON DELIVERY AVAILABLE ACROSS INDIA', badge: 'COD AVAILABLE' },
  { text: 'NEW FESTIVE COUTURE EDIT \u201926 NOW LIVE', badge: 'JUST DROPPED' },
  { text: 'HANDCRAFTED PURE SILK & ZARI WEAVES', badge: 'HERITAGE' },
];

interface TopBannerProps {
  isFloating?: boolean;
}

export const TopBanner: React.FC<TopBannerProps> = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const nextMessage = useCallback(() => {
    setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextMessage();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextMessage]);

  // Hide on scroll down, show on scroll up without layout jump
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const diff = currentY - lastScrollY.current;
          if (currentY < 30) {
            setIsVisible(true);
          } else if (diff > 6) {
            setIsVisible(false);
          } else if (diff < -6) {
            setIsVisible(true);
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentAnnouncement = ANNOUNCEMENTS[index];

  return (
    <div
      aria-label="Announcement Bar"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{
        backgroundColor: 'var(--header-bg, #3B1230)',
        maxHeight: isVisible ? '30px' : '0px',
        opacity: isVisible ? 1 : 0,
        transition: 'max-height 240ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease',
      }}
      className="relative w-full select-none z-40 overflow-hidden border-b border-white/[0.08]"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-center relative px-3 h-[30px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { y: 6, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { y: -6, opacity: 0 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center justify-center gap-2 text-center cursor-default max-w-full overflow-hidden"
          >
            {/* Badge */}
            <span className="hidden xs:inline-block font-sans text-[8px] font-semibold tracking-[0.14em] text-[#FAF6EE] bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-xs uppercase shrink-0">
              {currentAnnouncement.badge}
            </span>

            {/* Main text — 10.5px, letter-spacing 0.06em, no wrapping */}
            <span className="font-sans text-[10.5px] font-normal tracking-[0.06em] text-[#FAF6EE] uppercase whitespace-nowrap">
              {currentAnnouncement.text}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Desktop dot indicators */}
        <div className="hidden md:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-3 bg-white' : 'w-1 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to announcement ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
