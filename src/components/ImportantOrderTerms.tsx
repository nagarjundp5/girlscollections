'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Info } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface ImportantOrderTermsProps {
  className?: string;
}

export default function ImportantOrderTerms({ className = '' }: ImportantOrderTermsProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`rounded-2xl border border-[#E8DCC8] bg-[#FAF6EE] text-[#1A1A2E] overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer focus:outline-none min-h-[44px]"
      >
        <span className="flex items-center gap-2 text-sm font-sans font-bold text-[#1A1E3A]">
          <Info className="w-4 h-4 text-[#B8924A] shrink-0" />
          <span>Important Order Terms</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#1A1E3A]/70 transition-transform duration-200 sm:hidden ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div className={`${isOpen ? 'block' : 'hidden sm:block'} px-4 pb-3.5 pt-0.5 text-[13px] leading-relaxed text-[#1A1A2E]/85 space-y-1.5`}>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong>Cash on Delivery (COD):</strong> ₹{siteConfig.codAdvance} advance paid online now, remaining balance to the delivery agent at delivery.
          </li>
          <li>
            <strong>No reverse pickup:</strong> Returns &amp; exchanges are accepted only after you email{' '}
            <a href={`mailto:${siteConfig.email}`} className="underline font-semibold text-[#1A1E3A]">
              {siteConfig.email}
            </a>{' '}
            or call{' '}
            <a href={`tel:${siteConfig.telLink}`} className="underline font-semibold text-[#1A1E3A]">
              +91 {siteConfig.phone}
            </a>.
          </li>
          <li>
            <strong>Refunds:</strong> Issued manually after the returned item passes quality check.
          </li>
        </ul>
        <p className="pt-1">
          <Link
            href="/terms-and-conditions"
            target="_blank"
            className="text-xs font-bold underline text-[#1A1E3A] hover:text-[#B8924A]"
          >
            Read full Terms &amp; Conditions →
          </Link>
        </p>
      </div>
    </div>
  );
}
