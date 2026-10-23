'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryHeartButtonProps {
  isLiked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/* Scaled-down particle burst offsets for 32px circle target */
const PARTICLE_ANGLES = [
  { x: -11, y: -12, delay: 0 },
  { x: 11, y: -12, delay: 0.03 },
  { x: -13, y: 6, delay: 0.02 },
  { x: 13, y: 6, delay: 0.05 },
];

export const LuxuryHeartButton: React.FC<LuxuryHeartButtonProps> = ({
  isLiked,
  onToggle,
  className = '',
  size = 'md',
}) => {
  const [showBurst, setShowBurst] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 550);
    }
    onToggle(e);
  };

  // Proportionate sizes: default 'md' is 28px diameter circle (1.8x ratio with 15.5px icon)
  const containerSizes = {
    sm: 'w-[24px] h-[24px]',
    md: 'w-[28px] h-[28px]',
    lg: 'w-[32px] h-[32px]',
  };

  const iconSizes = {
    sm: 'w-[13px] h-[13px]',
    md: 'w-[15.5px] h-[15.5px]',
    lg: 'w-[18px] h-[18px]',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px] p-1.5 ${className}`}>
      {/* 4 Tiny Heart Particles Burst Outward on Wishlist Save */}
      <AnimatePresence>
        {showBurst &&
          PARTICLE_ANGLES.map((pt, idx) => (
            <motion.span
              key={idx}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.95 }}
              animate={{ x: pt.x, y: pt.y, scale: 0.75, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: pt.delay, ease: 'easeOut' }}
              className="absolute z-30 text-[#FF5A78] pointer-events-none select-none"
            >
              <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.span>
          ))}
      </AnimatePresence>

      {/* Primary Frosted-Glass 32px Circle Button */}
      <motion.button
        whileTap={{ scale: 0.90 }}
        whileHover={{ y: -1.5, scale: 1.05 }}
        onClick={handleClick}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
        className={`relative z-20 ${containerSizes[size]} rounded-full flex items-center justify-center transition-all duration-300 select-none focus:outline-none group/heartBtn ${
          isLiked
            ? 'shadow-[0_0_16px_rgba(255,90,120,0.45),0_6px_18px_rgba(0,0,0,0.12)] text-[#E53E3E]'
            : 'shadow-[0_6px_18px_rgba(0,0,0,0.12)] text-navy/80 hover:text-[#E53E3E]'
        }`}
        aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLiked ? 'liked' : 'unliked'}
            initial={{ scale: 1 }}
            animate={
              showBurst || isLiked
                ? { scale: [1, 1.35, 0.9, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-center"
          >
            {/* Iconic Organic Heart SVG with Rose-Gold Fill Transition */}
            <svg
              className={`${iconSizes[size]} transition-colors duration-300 ${
                isLiked
                  ? 'fill-[#B4863C] text-[#B4863C] drop-shadow-xs'
                  : 'fill-none text-inkNavy/70 group-hover/heartBtn:text-[#B4863C] group-hover/heartBtn:fill-[#B4863C]/15'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isLiked ? "0" : "1.85"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Glow Pulse Overlay on Wishlist Transition */}
        {showBurst && (
          <motion.span
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full shadow-[0_0_16px_rgba(255,90,120,0.6)] pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
};

export default LuxuryHeartButton;
