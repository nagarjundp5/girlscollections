'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '@/lib/animationStore';
import Image from 'next/image';

export default function AddToCartAnimation() {
  const { flyingItems, removeFlyingItem, triggerCartPulse } = useAnimationStore();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (reducedMotion || flyingItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {flyingItems.map((item) => {
          // Determine curve apex by picking the higher point and adding offset
          const apexY = Math.min(item.start.y, item.end.y) - 120;
          const yKeyframes = [item.start.y, apexY, item.end.y];

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.start.x - 24, // Offset to center on source position
                y: item.start.y - 32,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: item.end.x - 12,
                y: yKeyframes,
                scale: [1, 0.6, 0.15],
                opacity: [1, 0.9, 0],
              }}
              transition={{
                x: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.65, ease: [0.25, 1, 0.5, 1] }, // Arc curve
                scale: { duration: 0.65, ease: 'easeIn' },
                opacity: { duration: 0.65, ease: 'easeIn' },
              }}
              onAnimationComplete={() => {
                triggerCartPulse();
                removeFlyingItem(item.id);
              }}
              className="absolute w-12 h-16 border border-brand-offwhite/30 bg-brand-charcoal overflow-hidden pointer-events-none shadow-2xl"
            >
              <Image
                src={item.imageUrl}
                alt="Flying item"
                fill
                sizes="48px"
                className="object-cover"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
