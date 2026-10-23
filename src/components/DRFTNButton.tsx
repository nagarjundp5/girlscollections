'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface DRFTNButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function DRFTNButton({
  children,
  href,
  onClick,
  variant = 'primary',
  fullWidth = false,
  className = '',
  icon = (
    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5 flex-shrink-0" />
  ),
  type = 'button',
  disabled = false,
}: DRFTNButtonProps) {
  const baseClasses = `
    relative group inline-flex items-center justify-center gap-2.5 sm:gap-3
    min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 sm:py-3.5 rounded-[2px]
    font-sans font-bold text-[11.5px] sm:text-[12.5px] tracking-[0.18em] uppercase
    select-none overflow-hidden transition-all duration-200 ease-out
    active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
    ${fullWidth ? 'w-full' : 'w-full sm:w-auto'}
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-gold-gradient text-inkNavy border border-zariGold/40
      shadow-[0_4px_16px_rgba(180,134,60,0.25)]
      hover:shadow-[0_6px_22px_rgba(180,134,60,0.35)]
    `,
    secondary: `
      bg-inkNavy text-ivory border border-zariGold/30
      hover:bg-inkNavy/90 hover:border-zariGold
      shadow-md
    `,
    outline: `
      bg-transparent text-inkNavy border border-inkNavy/60
      hover:border-inkNavy hover:bg-inkNavy hover:text-ivory
    `,
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]}`;

  const content = (
    <>
      {/* Gold Foil Shimmer Sweep on Hover */}
      <span
        className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none"
        aria-hidden="true"
      />

      {/* Button label */}
      <span className="relative z-10 font-bold whitespace-nowrap">{children}</span>

      {/* Icon */}
      {icon && <span className="relative z-10">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={combinedClasses} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
