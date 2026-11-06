'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface AnnouncementItem {
  text: string;
  link?: string;
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  { text: 'USE CODE "GIRLS100" FOR ₹100 OFF FIRST ORDER', link: '/shop' },
  { text: 'COMPLIMENTARY SHIPPING ON ORDERS OVER ₹1,999', link: '/shop' },
  { text: 'CASH ON DELIVERY AVAILABLE ACROSS INDIA' },
  { text: 'NEW FESTIVE COUTURE EDIT \u201926 NOW LIVE', link: '/shop?sort=newest' },
  { text: 'HANDCRAFTED PURE SILK & ZARI WEAVES', link: '/shop' },
];

export const TopBanner: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Listen to visibilitychange: pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const changeSlide = useCallback((newIdx: number, dir: 'next' | 'prev') => {
    setDirection(dir);
    setAnimating(true);
    setIndex(newIdx);
    const t = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(t);
  }, []);

  const nextMessage = useCallback(() => {
    changeSlide((index + 1) % ANNOUNCEMENTS.length, 'next');
  }, [index, changeSlide]);

  const prevMessage = useCallback(() => {
    changeSlide((index - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length, 'prev');
  }, [index, changeSlide]);

  // Autoplay every 4s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextMessage();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextMessage]);

  // Touch swipe support (both horizontal swipe and vertical swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 35) {
      if (diffX > 0) nextMessage();
      else prevMessage();
    } else if (Math.abs(diffY) > 25) {
      if (diffY > 0) nextMessage();
      else prevMessage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const current = ANNOUNCEMENTS[index];

  const content = (
    <div
      key={index}
      style={{
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
        transform: prefersReducedMotion
          ? 'none'
          : animating
            ? direction === 'next'
              ? 'translateY(0)'
              : 'translateY(0)'
            : 'translateY(0)',
      }}
      className="flex items-center justify-center text-center px-2 w-full h-full"
    >
      <span
        className="font-medium tracking-[0.06em] text-white uppercase leading-none"
        style={{
          fontSize: 'clamp(10.5px, 3vw, 12px)',
          whiteSpace: current.text.length < 40 ? 'nowrap' : 'normal',
          overflow: 'hidden',
          textOverflow: current.text.length < 40 ? 'clip' : 'ellipsis',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {current.text}
      </span>
    </div>
  );

  return (
    <div
      role="region"
      aria-label="Announcement Bar"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: '#3B1230',
        height: '36px',
        lineHeight: '36px',
      }}
      className="relative w-full select-none z-40 overflow-hidden flex items-center justify-center shrink-0"
    >
      <div className="max-w-[1440px] mx-auto w-full h-[36px] flex items-center justify-center relative">
        {/* Slide Content — text area leaves room for dots on the right */}
        {current.link ? (
          <Link
            href={current.link}
            className="flex items-center justify-center h-full w-full pr-[52px] pl-2 hover:opacity-90 transition-opacity focus:outline-none focus:underline"
            title={current.text}
          >
            {content}
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full w-full pr-[52px] pl-2">
            {content}
          </div>
        )}

        {/* Small 6px dots indicator — fixed at right edge */}
        <div className="flex items-center gap-1.5 absolute right-[6px] top-1/2 -translate-y-1/2">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i, i > index ? 'next' : 'prev')}
              className={`h-[6px] rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                i === index
                  ? 'w-[14px] bg-white'
                  : 'w-[6px] bg-white/40 hover:bg-white/75'
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
