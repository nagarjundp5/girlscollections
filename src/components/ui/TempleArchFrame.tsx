'use client';

import React, { useId } from 'react';

export interface TempleArchFrameProps {
  children: React.ReactNode;
  variant?: 'semicircular' | 'pointed';
  className?: string;
  showGoldBorder?: boolean;
  borderWidth?: number;
}

/**
 * Reusable TempleArchFrame Component
 * Uses SVG clipPath for precise architectural temple doorway silhouettes (semicircular or pointed ogee arch)
 * Photo bleeds 100% edge-to-edge directly to the gold border.
 */
export const TempleArchFrame: React.FC<TempleArchFrameProps> = ({
  children,
  variant = 'semicircular',
  className = '',
  showGoldBorder = true,
  borderWidth = 2,
}) => {
  const rawId = useId();
  const clipId = `temple-arch-clip-${rawId.replace(/:/g, '')}`;

  // SVG path definitions in objectBoundingBox coordinates (scale 0..1)
  const isPointed = variant === 'pointed';

  // Semicircular: Straight sides bottom 60%, smooth rounded top 40%
  const semicircularPath = 'M 0 1 L 0 0.38 C 0 0.08 0.2 0 0.5 0 C 0.8 0 1 0.08 1 0.38 L 1 1 Z';

  // Pointed Ogee Arch: Straight sides bottom 55%, gentle mandir peak top 45%
  const pointedPath = 'M 0 1 L 0 0.45 C 0 0.22 0.28 0.08 0.5 0 C 0.72 0.08 1 0.22 1 0.45 L 1 1 Z';

  const pathD = isPointed ? pointedPath : semicircularPath;

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* Hidden SVG Definition for clipPath */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathD} />
          </clipPath>
        </defs>
      </svg>

      {/* Clipped Container: Photo bleeds 100% edge-to-edge */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{ clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})` }}
      >
        {children}
      </div>

      {/* Gold Arch Border directly sitting on the clipped edge */}
      {showGoldBorder && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Outer Gold Line */}
          <path
            d={isPointed ? 'M 0 100 L 0 45 C 0 22 28 8 50 0 C 72 8 100 22 100 45 L 100 100 Z' : 'M 0 100 L 0 38 C 0 8 20 0 50 0 C 80 0 100 8 100 38 L 100 100 Z'}
            fill="none"
            stroke="#B4863C"
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
          {/* Inset Hairline Inner Accent */}
          <path
            d={isPointed ? 'M 2 100 L 2 45.5 C 2 23 29 9.5 50 2 C 71 9.5 98 23 98 45.5 L 98 100 Z' : 'M 2 100 L 2 39 C 2 10 21 2 50 2 C 79 2 98 10 98 39 L 98 100 Z'}
            fill="none"
            stroke="#D8BC82"
            strokeWidth={1}
            strokeOpacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
};

export default TempleArchFrame;
