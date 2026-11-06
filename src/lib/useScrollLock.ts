import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let originalStyles = {
  position: '',
  top: '',
  left: '',
  right: '',
  width: '',
  overflowY: '',
  paddingRight: '',
};

export function lockBodyScroll() {
  if (typeof window === 'undefined') return;

  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflowY: document.body.style.overflowY,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflowY = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount++;
}

export function unlockBodyScroll() {
  if (typeof window === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.body.style.position = originalStyles.position;
    document.body.style.top = originalStyles.top;
    document.body.style.left = originalStyles.left;
    document.body.style.right = originalStyles.right;
    document.body.style.width = originalStyles.width;
    document.body.style.overflowY = originalStyles.overflowY;
    document.body.style.paddingRight = originalStyles.paddingRight;

    window.scrollTo(0, savedScrollY);
  }
}

/**
 * React hook to lock body scrolling when a modal/drawer is open on mobile (iOS-safe) & desktop.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isLocked]);
}
