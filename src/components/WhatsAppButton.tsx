'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isExcluded = pathname?.startsWith('/admin') || pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isExcluded) return null;

  return (
    <div
      className="fixed z-40 flex items-center group select-none pointer-events-auto transition-all duration-300 ease-out right-4 sm:right-6 bottom-[calc(64px+env(safe-area-inset-bottom,0px)+16px)] sm:bottom-8"
    >
      {/* Desktop Hover Label Badge */}
      <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#1C1417] bg-[#FAF6EE]/95 backdrop-blur-md px-3 py-1.5 shadow-md border border-[#1C1417]/10 mr-2.5 pointer-events-none rounded-xs">
        Stylist Assistance
      </span>

      {/* Floating WhatsApp Action Button: 52px Green Circle with crisp inline SVG */}
      <a
        href="https://wa.me/917483848505?text=Hello%20The%20Girls%20Collections!%20I%20have%20a%20question%20about%20your%20couture%20and%20festive%20wear."
        target="_blank"
        rel="noopener noreferrer"
        className="w-[52px] h-[52px] active:scale-95 transition-transform duration-150 ease-out flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl rounded-full bg-[#25D366] text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        aria-label="Contact us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.186 8.186 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.17-.31.2-.58.06-.26-.13-1.11-.41-2.12-1.31-.79-.7-1.32-1.57-1.48-1.83-.15-.26-.02-.4.11-.53.12-.12.26-.31.4-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.6-1.45-.83-1.99-.22-.52-.44-.45-.6-.46-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.31s.99 2.68 1.13 2.86c.13.19 1.95 2.97 4.72 4.17.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.56-.64 1.78-1.25.22-.61.22-1.14.16-1.25-.07-.11-.25-.18-.51-.31z" />
        </svg>
      </a>
    </div>
  );
}
