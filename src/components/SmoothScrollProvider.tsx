'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if primary pointer is coarse (mobile touch) — skip heavy GSAP/Lenis entirely on mobile
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    let lenisInstance: any = null;
    let cleanupClick: (() => void) | null = null;

    Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      lenisInstance = new Lenis({
        autoRaf: true,
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.0,
        wheelMultiplier: 1.0,
        infinite: false,
      });

      lenisInstance.on('scroll', () => {
        ScrollTrigger.update();
        window.dispatchEvent(
          new CustomEvent('drftn-scroll', {
            detail: { scrollY: lenisInstance.scroll, direction: lenisInstance.direction },
          })
        );
      });

      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
          const targetEl = document.querySelector(anchor.hash);
          if (targetEl) {
            e.preventDefault();
            lenisInstance.scrollTo(targetEl as HTMLElement, { offset: 0, duration: 1.0 });
          }
        }
      };
      document.addEventListener('click', handleAnchorClick);
      cleanupClick = () => document.removeEventListener('click', handleAnchorClick);
    }).catch(() => {});

    return () => {
      if (cleanupClick) cleanupClick();
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}
