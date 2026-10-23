import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'horizontal' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const logoHeights = {
    sm: 'h-[52px] sm:h-[62px] lg:h-[68px]',
    md: 'h-[54px] sm:h-[64px] lg:h-[72px]',
    lg: 'h-[62px] sm:h-[74px] lg:h-[82px]',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 sm:gap-3 group shrink-0 relative py-1 focus:outline-none ${className}`}
      aria-label="The Girls Collections Home"
    >
      <span className="sr-only">The Girls Collections</span>

      <div className={`relative ${logoHeights[size]} w-auto shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 overflow-hidden rounded-xs`}>
        <span className="animate-logo-shimmer" />

        <Image
          src="/logo.webp"
          alt="The Girls Collections Emblem"
          width={160}
          height={175}
          style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
          className="h-full w-auto max-h-full object-contain filter drop-shadow-xs relative z-0"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center text-left leading-none shrink-0 py-0.5 relative">
          <span className="font-serif text-[16px] sm:text-[18px] lg:text-[20px] font-bold tracking-[0.12em] uppercase text-inkNavy group-hover:text-zariGold transition-colors">
            The Girls
          </span>
          <span className="font-sans text-[8.5px] sm:text-[9.5px] lg:text-[10px] font-bold tracking-[0.26em] uppercase text-zariGold pt-0.5">
            Collections
          </span>
          {/* Temple Arch Hairline Curve Accent */}
          <svg
            viewBox="0 0 100 8"
            fill="none"
            className="w-full h-[5px] text-zariGold/70 group-hover:text-zariGold mt-0.5 transition-colors"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 0 7 Q 50 -2 100 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </Link>
  );
};

export default BrandLogo;
