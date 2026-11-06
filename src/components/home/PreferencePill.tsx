'use client';

import React from 'react';
import { DivisionPreference } from '@/lib/preference';

interface PreferencePillProps {
  preference: DivisionPreference;
  onPreferenceChange: (pref: DivisionPreference) => void;
}

export const PreferencePill: React.FC<PreferencePillProps> = ({
  preference,
  onPreferenceChange,
}) => {
  const handleToggle = (target: 'women' | 'kids') => {
    if (preference === target) {
      onPreferenceChange('all');
    } else {
      onPreferenceChange(target);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Filter by Women or Kids Collection"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 flex items-center bg-white rounded-full p-1 shadow-[0_4px_20px_rgba(28,20,23,0.14)] border border-[#EFE7E2] select-none h-[44px] w-[216px]"
    >
      {/* Sliding Dark Thumb (Transform & Opacity only, 250ms) */}
      <div
        aria-hidden="true"
        style={{
          width: 'calc(50% - 4px)',
          left: '4px',
          transform:
            preference === 'women'
              ? 'translateX(0)'
              : preference === 'kids'
                ? 'translateX(100%)'
                : preference === 'all'
                  ? 'scale(0.8)'
                  : 'translateX(0)',
          opacity: preference === 'all' ? 0 : 1,
          transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease',
        }}
        className="absolute top-1 bottom-1 rounded-full bg-[#1C1417] pointer-events-none z-0"
      />

      {/* Segment 1: Women */}
      <button
        role="tab"
        type="button"
        aria-selected={preference === 'women'}
        onClick={() => handleToggle('women')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center text-[12.5px] font-sans font-semibold tracking-[0.06em] uppercase rounded-full transition-colors duration-200 cursor-pointer focus:outline-none min-h-[44px] ${
          preference === 'women'
            ? 'text-white'
            : 'text-[#1C1417] hover:text-black'
        }`}
      >
        Women
      </button>

      {/* Segment 2: Kids */}
      <button
        role="tab"
        type="button"
        aria-selected={preference === 'kids'}
        onClick={() => handleToggle('kids')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center text-[12.5px] font-sans font-semibold tracking-[0.06em] uppercase rounded-full transition-colors duration-200 cursor-pointer focus:outline-none min-h-[44px] ${
          preference === 'kids'
            ? 'text-white'
            : 'text-[#1C1417] hover:text-black'
        }`}
      >
        Kids
      </button>
    </div>
  );
};

export default PreferencePill;

