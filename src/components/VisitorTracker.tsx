'use client';

import { useEffect, useRef } from 'react';

function getOrSetVisitorId(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'tgc_vid';
  let vid = '';

  // 1. Try reading from cookie
  const cookieMatch = document.cookie.match(new RegExp('(?:^|; )' + STORAGE_KEY + '=([^;]*)'));
  if (cookieMatch && cookieMatch[1]) {
    vid = decodeURIComponent(cookieMatch[1]);
  }

  // 2. Try reading from localStorage if cookie absent
  if (!vid) {
    try {
      vid = localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      // Storage access blocked
    }
  }

  // 3. Generate new persistent Visitor ID if not found
  if (!vid) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      vid = 'vid_' + crypto.randomUUID().replace(/-/g, '');
    } else {
      vid = 'vid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  }

  // 4. Save across cookie (1 year max-age) and localStorage for persistence
  try {
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(vid)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem(STORAGE_KEY, vid);
  } catch {
    // Ignore cookie write errors
  }

  return vid;
}

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function VisitorTracker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const vid = getOrSetVisitorId();
    if (!vid) return;

    const sendHeartbeat = () => {
      // Do not send if tab is hidden
      if (document.visibilityState === 'hidden') return;

      fetch('/api/visitors/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid }),
        keepalive: true,
      }).catch(() => {});
    };

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Initial heartbeat after 5s idle delay (zero impact on initial LCP)
    const initialTimer = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 5000);

    // Start 5-min interval if page is currently visible
    if (document.visibilityState === 'visible') {
      startInterval();
    }

    // Stop when tab is hidden, resume when tab is visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
        startInterval();
      } else {
        stopInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
