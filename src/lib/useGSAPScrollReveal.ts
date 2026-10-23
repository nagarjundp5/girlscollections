'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealOptions {
  stagger?: number;
  yOffset?: number;
  duration?: number;
  selector?: string;
}

export function useGSAPScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const containerRef = useRef<T | null>(null);
  const { stagger = 0.08, yOffset = 25, duration = 0.6, selector } = options;

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const targetElements = selector
        ? containerRef.current!.querySelectorAll(selector)
        : [containerRef.current!];

      if (targetElements.length === 0) return;

      // Accessibility: Respect user prefers-reduced-motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        gsap.set(targetElements, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targetElements,
        {
          opacity: 0,
          y: yOffset,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: targetElements.length > 1 ? stagger : 0,
          ease: 'power2.out',
          force3D: true,
          onComplete: () => {
            // Ensure elements are locked in final clean state without active inline transform listeners
            gsap.set(targetElements, { clearProps: 'transform,willChange' });
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [stagger, yOffset, duration, selector]);

  return containerRef;
}
