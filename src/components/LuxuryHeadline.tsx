'use client';

import React from 'react';

interface LuxuryHeadlineProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';
}

/**
 * Systemic Global Luxury Headline Component:
 * Automatically parses any display headline string containing '&' and formats the ampersand
 * with delicate italic serif styling (`font-serif italic font-normal text-roseGold px-0.5`).
 * This prevents Fraunces calligraphic font mismatch across all headlines in the application.
 */
export const LuxuryHeadline: React.FC<LuxuryHeadlineProps> = ({
  text,
  className = '',
  as: Component = 'h2',
}) => {
  if (!text.includes('&')) {
    return <Component className={className}>{text}</Component>;
  }

  const parts = text.split('&');

  return (
    <Component className={className}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="font-serif italic font-normal text-roseGold px-1 inline-block select-none">
              &
            </span>
          )}
        </React.Fragment>
      ))}
    </Component>
  );
};

export default LuxuryHeadline;
