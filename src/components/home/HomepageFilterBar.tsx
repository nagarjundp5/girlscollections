'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type HomepageFilterOption = 'all' | 'women' | 'kids';

interface HomepageFilterBarProps {
  activeFilter: HomepageFilterOption;
  onFilterChange: (filter: HomepageFilterOption) => void;
  isFloating?: boolean;
}

export const HomepageFilterBar: React.FC<HomepageFilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const options: { id: HomepageFilterOption; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'women', label: 'Women' },
    { id: 'kids', label: 'Kids' },
  ];

  return (
    <nav
      aria-label="Homepage Category Filter"
      className="w-full h-[44px] bg-[#FBF7F1] border-b border-[#EFE7E2] select-none flex items-center justify-center px-4"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-center gap-6 sm:gap-10 h-full">
        {options.map((opt, idx) => {
          const isActive = activeFilter === opt.id;
          return (
            <React.Fragment key={opt.id}>
              {idx > 0 && (
                <span
                  className="w-[1px] h-3.5 shrink-0 bg-[#EFE7E2]"
                  aria-hidden="true"
                />
              )}
              <button
                onClick={() => onFilterChange(opt.id)}
                className={`relative h-full flex items-center justify-center px-2 text-[13px] font-sans font-medium tracking-[0.06em] transition-colors duration-150 cursor-pointer focus:outline-none ${
                  isActive ? 'text-[#1A1A2E]' : 'text-[#6B6B7B] hover:text-[#1A1A2E]'
                }`}
                aria-pressed={isActive}
              >
                <span>{opt.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeFilterUnderline"
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B08D57] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default HomepageFilterBar;
