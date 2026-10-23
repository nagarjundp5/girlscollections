'use client';

import React, { useEffect, useState } from 'react';

interface ZariThreadProps {
  variant?: 'hero' | 'scrollRail' | 'sectionAccent' | 'cardBorder' | 'footerWeave';
  className?: string;
  isHovered?: boolean;
}

export const ZariThread: React.FC<ZariThreadProps> = ({
  variant = 'sectionAccent',
  className = '',
  isHovered = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Variant 1: Hero Draw-In Thread with Knot
  if (variant === 'hero') {
    return (
      <div className={`relative w-full overflow-hidden pointer-events-none ${className}`}>
        <svg
          viewBox="0 0 1200 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 sm:h-10 text-zariGold drop-shadow-[0_0_8px_rgba(180,134,60,0.4)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="zariGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A24B" />
              <stop offset="50%" stopColor="#D8BC82" />
              <stop offset="100%" stopColor="#8B6A2E" />
            </linearGradient>
          </defs>
          <path
            d="M 0,20 L 980,20 C 1010,20 1020,5 1030,20 C 1040,35 1050,20 1060,20 C 1070,20 1080,8 1075,28 C 1070,40 1055,20 1080,20 L 1200,20"
            stroke="url(#zariGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="zari-hero-path"
          />
        </svg>

        <style jsx>{`
          .zari-hero-path {
            stroke-dasharray: 1400;
            stroke-dashoffset: 1400;
            animation: drawHeroThread 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.2s;
          }
          @keyframes drawHeroThread {
            to {
              stroke-dashoffset: 0;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .zari-hero-path {
              animation: none !important;
              stroke-dashoffset: 0 !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Variant 2: Scroll Rail (Desktop side spine)
  if (variant === 'scrollRail') {
    return (
      <div className={`hidden lg:block fixed top-0 bottom-0 right-6 w-1 pointer-events-none z-30 ${className}`}>
        <svg
          viewBox="0 0 4 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-zariGold opacity-70"
          preserveAspectRatio="none"
        >
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="1000"
            stroke="url(#zariGradientRail)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <defs>
            <linearGradient id="zariGradientRail" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#D8BC82" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B6A2E" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Variant 3: Section Accent Divider
  if (variant === 'sectionAccent') {
    return (
      <div className={`flex items-center justify-center my-4 w-full opacity-90 ${className}`}>
        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent via-zariGold to-zariGoldLight" />
        <div className="mx-2 w-2 h-2 rotate-45 border border-zariGold bg-ivory" />
        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent via-zariGold to-zariGoldLight" />
      </div>
    );
  }

  // Variant 4: Card Border Trace Animation
  if (variant === 'cardBorder') {
    return (
      <div aria-hidden="true" className={`absolute inset-0 pointer-events-none rounded-[2px] overflow-hidden ${className}`}>
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.75"
            y="0.75"
            width="calc(100% - 1.5px)"
            height="calc(100% - 1.5px)"
            fill="none"
            stroke="url(#cardThreadGrad)"
            strokeWidth="1.5"
            rx="2"
            className={`transition-all duration-700 ease-out ${
              isHovered ? 'zari-border-active' : 'opacity-0'
            }`}
            style={{
              strokeDasharray: '1200',
              strokeDashoffset: isHovered ? '0' : '1200',
            }}
          />
          <defs>
            <linearGradient id="cardThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A24B" />
              <stop offset="50%" stopColor="#D8BC82" />
              <stop offset="100%" stopColor="#8B6A2E" />
            </linearGradient>
          </defs>
        </svg>
        <style jsx>{`
          .zari-border-active {
            opacity: 1;
          }
          @media (prefers-reduced-motion: reduce) {
            .zari-border-active {
              stroke-dashoffset: 0 !important;
              transition: opacity 0.2s !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Variant 5: Footer Temple/Kolam Woven Border Pattern
  if (variant === 'footerWeave') {
    return (
      <div className={`w-full overflow-hidden leading-none select-none ${className}`}>
        <svg
          viewBox="0 0 1200 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-5 text-zariGold opacity-85"
          preserveAspectRatio="none"
        >
          <pattern
            id="kolamPattern"
            x="0"
            y="0"
            width="40"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0,12 L 10,2 L 20,12 L 30,22 L 40,12 M 0,12 L 10,22 L 20,12 L 30,2 L 40,12"
              stroke="#B4863C"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="20" cy="12" r="1.5" fill="#D8BC82" />
          </pattern>
          <rect width="1200" height="24" fill="url(#kolamPattern)" />
        </svg>
      </div>
    );
  }

  return null;
};

export default ZariThread;
