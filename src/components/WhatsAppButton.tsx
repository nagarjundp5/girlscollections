'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isPDP, setIsPDP] = useState(false);
  const isExcluded = pathname?.startsWith('/admin') || pathname === '/checkout';

  useEffect(() => {
    setIsPDP(pathname?.startsWith('/shop/') ?? false);
  }, [pathname]);

  if (isExcluded) return null;

  return (
    <div
      className="fixed right-4 sm:right-6 z-[75] flex items-center group select-none pointer-events-auto transition-all duration-300 ease-out bottom-[calc(64px+env(safe-area-inset-bottom,0px)+16px)] sm:bottom-8"
    >
      {/* Desktop Hover Label Badge */}
      <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-inkNavy bg-ivory/95 backdrop-blur-md px-3 py-1.5 shadow-md border border-inkNavy/15 mr-2.5 pointer-events-none">
        Stylist Assistance
      </span>

      {/* Floating WhatsApp Action Button (52px, never covers hero dots/CTA) */}
      <a
        href="https://wa.me/917483848505?text=Hello%20The%20Girls%20Collections!%20I%20have%20a%20question%20about%20your%20couture%20and%20festive%20wear."
        target="_blank"
        rel="noopener noreferrer"
        className="w-[50px] h-[50px] sm:w-[52px] sm:h-[52px] active:scale-95 transition-transform duration-150 ease-out flex items-center justify-center shrink-0 shadow-lg rounded-full bg-[#25D366] p-2.5 hover:shadow-xl"
        aria-label="Contact via WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <img
          src="https://media.limechat.in/lcmedia/assets/images/whatsapp/LC_WA.png"
          alt="WhatsApp Chat"
          className="w-full h-full object-contain"
        />
      </a>
    </div>
  );
}

