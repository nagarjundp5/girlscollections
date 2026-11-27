'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface PushConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function PushConsentCheckbox({ checked, onChange, className = '' }: PushConsentCheckboxProps) {
  return (
    <label
      className={`flex items-start gap-2.5 cursor-pointer select-none rounded-xl border border-[#EADFD6] bg-[#FBF8F4] px-3.5 py-2.5 text-left ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-[#D4AF37] text-[#D94F7E] focus:ring-[#D94F7E] accent-[#D94F7E] shrink-0 cursor-pointer"
      />
      <span className="text-xs sm:text-[13px] text-[#1A1E3A] leading-snug font-sans flex items-center gap-1.5">
        <Bell className="w-3.5 h-3.5 text-[#D94F7E] shrink-0 hidden sm:inline" />
        Send me order updates, new arrivals and offers
      </span>
    </label>
  );
}
