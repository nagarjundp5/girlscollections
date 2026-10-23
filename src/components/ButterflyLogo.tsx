'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ButterflyLogoProps {
  className?: string;
  isScrolled?: boolean;
  isEntranceAnimating?: boolean;
}

export const ButterflyLogo: React.FC<ButterflyLogoProps> = ({
  className = '',
  isScrolled = false,
  isEntranceAnimating = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Control flutter loop: disabled during entrance or reduced motion
  const shouldFlutter = !isEntranceAnimating && !shouldReduceMotion;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-all duration-300 ${
        isScrolled
          ? 'h-[42px] xs:h-[46px] sm:h-[52px] lg:h-[58px]'
          : 'h-[52px] xs:h-[60px] sm:h-[70px] lg:h-[78px]'
      } ${className}`}
    >
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto filter drop-shadow-[0_2px_8px_rgba(28,31,59,0.12)]"
        aria-hidden="true"
      >
        <defs>
          {/* Royal Zari Gold Gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2C686" />
            <stop offset="35%" stopColor="#C9A24B" />
            <stop offset="70%" stopColor="#D8BC82" />
            <stop offset="100%" stopColor="#8B6A2E" />
          </linearGradient>

          {/* Scalloped Navy Background Gradient */}
          <radialGradient id="navyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A2F54" />
            <stop offset="100%" stopColor="#14172E" />
          </radialGradient>

          {/* Wing Shimmer Filter */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Scalloped Royal Crest Shield */}
        <g id="shield-base">
          {/* Main Shield Oval Body */}
          <path
            d="M 100 12 C 145 12 178 36 178 88 C 178 145 145 196 100 208 C 55 196 22 145 22 88 C 22 36 55 12 100 12 Z"
            fill="url(#navyGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
          />

          {/* Inner Scalloped Gold Filigree Border */}
          <path
            d="M 100 20 C 138 20 168 40 168 88 C 168 138 138 186 100 198 C 62 186 32 138 32 88 C 32 40 62 20 100 20 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity="0.85"
          />

          {/* Royal Crown Arch Motif Top */}
          <path
            d="M 85 24 Q 100 16 115 24 Q 100 20 85 24 Z"
            fill="url(#goldGradient)"
          />
        </g>

        {/* --- LAYERED BUTTERFLY EMBLEM WITH MIRRORED WING FLUTTER --- */}
        <g id="butterfly-emblem" transform="translate(100, 100)">
          
          {/* LEFT WINGS GROUP (Rotation Pivot at Right Base) */}
          <motion.g
            id="left-wing-group"
            style={{ transformOrigin: '0px 0px' }}
            animate={
              shouldFlutter
                ? { rotate: [-4, 1.5, -4] }
                : { rotate: 0 }
            }
            transition={{
              duration: 3.2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            {/* Upper Left Wing */}
            <path
              d="M 0 -8 C -22 -38 -58 -32 -48 -2 C -42 16 -18 12 0 4 Z"
              fill="url(#goldGradient)"
              opacity="0.95"
            />
            <path
              d="M -6 -12 C -24 -30 -44 -24 -36 -4 C -30 8 -16 6 -4 0 Z"
              fill="none"
              stroke="#FFF"
              strokeWidth="0.8"
              opacity="0.4"
            />
            {/* Lower Left Wing */}
            <path
              d="M 0 6 C -28 14 -42 42 -22 46 C -6 48 -2 24 0 8 Z"
              fill="url(#goldGradient)"
              opacity="0.85"
            />
          </motion.g>

          {/* RIGHT WINGS GROUP (Rotation Pivot at Left Base) */}
          <motion.g
            id="right-wing-group"
            style={{ transformOrigin: '0px 0px' }}
            animate={
              shouldFlutter
                ? { rotate: [4, -1.5, 4] }
                : { rotate: 0 }
            }
            transition={{
              duration: 3.2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            {/* Upper Right Wing */}
            <path
              d="M 0 -8 C 22 -38 58 -32 48 -2 C 42 16 18 12 0 4 Z"
              fill="url(#goldGradient)"
              opacity="0.95"
            />
            <path
              d="M 6 -12 C 24 -30 44 -24 36 -4 C 30 8 16 6 4 0 Z"
              fill="none"
              stroke="#FFF"
              strokeWidth="0.8"
              opacity="0.4"
            />
            {/* Lower Right Wing */}
            <path
              d="M 0 6 C 28 14 42 42 22 46 C 6 48 2 24 0 8 Z"
              fill="url(#goldGradient)"
              opacity="0.85"
            />
          </motion.g>

          {/* CENTRAL BUTTERFLY BODY & ANTENNAE (STATIC ANCHOR) */}
          <g id="butterfly-body">
            {/* Antennae */}
            <path
              d="M -1 -12 Q -8 -22 -14 -24 M 1 -12 Q 8 -22 14 -24"
              stroke="url(#goldGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="-14" cy="-24" r="1.5" fill="url(#goldGradient)" />
            <circle cx="14" cy="-24" r="1.5" fill="url(#goldGradient)" />

            {/* Abdomen & Head */}
            <ellipse cx="0" cy="-10" rx="3.2" ry="4" fill="url(#goldGradient)" />
            <path
              d="M 0 -6 C -3.5 4 -3.5 18 0 28 C 3.5 18 3.5 4 0 -6 Z"
              fill="url(#goldGradient)"
              stroke="#14172E"
              strokeWidth="0.6"
            />
            
            {/* Center Royal Gem Accent */}
            <circle cx="0" cy="4" r="2.2" fill="#FFF" opacity="0.8" />
          </g>

        </g>

        {/* Base Star / Heritage Monogram Seal Bottom Accent */}
        <g transform="translate(100, 172)">
          <path
            d="M 0 -6 L 2 -2 L 6 0 L 2 2 L 0 6 L -2 2 L -6 0 L -2 -2 Z"
            fill="url(#goldGradient)"
          />
        </g>
      </svg>
    </div>
  );
};

export default ButterflyLogo;
