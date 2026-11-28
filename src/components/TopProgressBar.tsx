'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    trickleRef.current = null;
    hideRef.current = null;
    safetyRef.current = null;
  };

  const start = () => {
    clearTimers();
    setVisible(true);
    setProgress(0.22);

    trickleRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.84) return prev;
        return Math.min(0.84, prev + (0.84 - prev) * 0.28);
      });
    }, 120);

    // Safety finish in case navigation errors or aborts
    safetyRef.current = setTimeout(() => {
      done();
    }, 8000);
  };

  const done = () => {
    clearTimers();
    setProgress(1);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Complete when route changes
  useEffect(() => {
    if (visible) done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Document-level anchor click + programmatic pushState listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download')) return;

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;
        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) return;
        start();
      } catch {}
    };

    const origPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (...args: Parameters<typeof window.history.pushState>) {
      try {
        const nextUrl = args[2] ? new URL(String(args[2]), window.location.origin) : null;
        if (nextUrl && (nextUrl.pathname !== window.location.pathname || nextUrl.search !== window.location.search)) {
          start();
        }
      } catch {}
      return origPushState(...args);
    };

    const handleError = () => done();

    document.addEventListener('click', handleClick, true);
    window.addEventListener('error', handleError);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('error', handleError);
      window.history.pushState = origPushState;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      <div
        className="h-full origin-left rounded-r-full"
        style={{
          background: 'linear-gradient(90deg, #D94F7E 0%, #C9A15D 100%)',
          boxShadow: '0 0 8px rgba(217, 79, 126, 0.55)',
          transform: reducedMotion ? 'scaleX(1)' : `scaleX(${progress})`,
          transition: reducedMotion ? 'opacity 180ms ease' : 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
}
