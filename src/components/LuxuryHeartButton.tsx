'use client';

import React, { useState, useRef, useEffect } from 'react';
import { haptic } from '@/lib/haptics';

interface LuxuryHeartButtonProps {
  isLiked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LuxuryHeartButton: React.FC<LuxuryHeartButtonProps> = ({
  isLiked,
  onToggle,
  className = '',
  size = 'md',
}) => {
  const [burstKey, setBurstKey] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLiked) {
      haptic('heart');
      setIsPopping(true);
      setBurstKey((k) => k + 1);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsPopping(false), 300);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tgc-wishlist-pop'));
      }
    } else {
      haptic('tap');
      setIsPopping(false);
    }
    onToggle(e);
  };

  const containerSizes = {
    sm: 'w-[36px] h-[36px]',
    md: 'w-[44px] h-[44px]',
    lg: 'w-[48px] h-[48px]',
  };

  const iconSizes = {
    sm: 'w-[18px] h-[18px]',
    md: 'w-[24px] h-[24px]',
    lg: 'w-[26px] h-[26px]',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* 6 CSS-only particles burst outward on like */}
      {isPopping && (
        <span
          key={burstKey}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-30"
        >
          <span className="heart-particle p1" />
          <span className="heart-particle p2" />
          <span className="heart-particle p3" />
          <span className="heart-particle p4" />
          <span className="heart-particle p5" />
          <span className="heart-particle p6" />
        </span>
      )}

      <button
        type="button"
        onClick={handleClick}
        className={`relative z-20 ${containerSizes[size]} rounded-full bg-white border border-[#EADFD6]/80 shadow-[0_3px_12px_rgba(26,30,58,0.08)] flex items-center justify-center transition-transform duration-150 active:scale-95 select-none focus:outline-none cursor-pointer ${
          isPopping ? 'animate-heart-pop-spring' : ''
        }`}
        aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          className={`${iconSizes[size]} transition-all duration-200 ${
            isLiked
              ? 'fill-[var(--cta)] text-[var(--cta)]'
              : 'fill-none text-[var(--ink)] hover:text-[var(--cta)]'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
};

export default LuxuryHeartButton;
