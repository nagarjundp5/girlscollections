'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface BannerSectionDividerProps {
  filter?: 'all' | 'women' | 'kids';
  className?: string;
}

export const BannerSectionDivider: React.FC<BannerSectionDividerProps> = ({
  filter = 'all',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(target);
        }
      },
      { threshold: 0.1, rootMargin: '40px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const isKids = filter === 'kids';
  const activeBannerSrc = isKids ? '/divforkids.png' : '/divforwomen.png';
  const activeBannerAlt = isKids ? 'Kids Ethnic Collection Banner' : 'Women Ethnic Collection Banner';

  return (
    <section
      ref={containerRef}
      className={`w-full relative select-none overflow-hidden bg-ivory ${className}`}
      aria-label="Collection Feature Banner"
    >
      <div
        className={`w-full transition-all duration-700 ease-out transform-gpu ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'
        }`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="w-full relative aspect-[2700/866] overflow-hidden">
          <Image
            key={activeBannerSrc}
            src={activeBannerSrc}
            alt={activeBannerAlt}
            fill
            sizes="100vw"
            priority={false}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default BannerSectionDivider;
