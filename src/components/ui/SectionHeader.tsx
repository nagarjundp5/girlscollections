'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  subtitle,
  actionLabel,
  actionHref,
  align = 'left',
  className = '',
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={`mb-8 md:mb-12 pb-4 border-b border-zariGold/20 ${
        isCentered ? 'text-center flex flex-col items-center' : 'flex flex-col sm:flex-row sm:items-end justify-between gap-4'
      } ${className}`}
    >
      <div className={isCentered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {/* Kicker label with thin gold line */}
        <div className={`flex items-center gap-3 mb-2 ${isCentered ? 'justify-center' : ''}`}>
          <span className="font-sans font-semibold text-[10.5px] sm:text-xs text-zariGold tracking-[0.25em] uppercase">
            {kicker}
          </span>
          <div className="h-[1px] w-8 bg-zariGold/40" />
        </div>

        {/* Primary Fraunces Serif Title */}
        <h2 className="text-2.5xl sm:text-4xl lg:text-5xl font-serif font-bold text-inkNavy tracking-tight leading-[1.1]">
          {title}
        </h2>

        {/* Subtitle / Description */}
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-inkNavy/70 font-sans font-normal max-w-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Link (e.g. VIEW ALL →) */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-sans font-semibold text-zariGold hover:text-inkNavy tracking-widest uppercase transition-colors shrink-0 group self-start sm:self-end pb-1"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
