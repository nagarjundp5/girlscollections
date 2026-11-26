'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const WA_URL =
  'https://wa.me/919844371705?text=Hi%2C%20I%20need%20help%20with%20The%20Girls%20Collections';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStickyBarOpen, setIsStickyBarOpen] = useState(false);

  const isExcluded =
    pathname?.startsWith('/admin') || pathname === '/checkout';

  useEffect(() => {
    setMounted(true);

    const checkDrawer = () => {
      const open =
        document.body.getAttribute('data-drawer-open') === 'true' ||
        document.body.getAttribute('data-menu-open') === 'true';
      setIsDrawerOpen(open);
    };

    checkDrawer();

    const observer = new MutationObserver(() => {
      checkDrawer();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-drawer-open', 'data-menu-open', 'style'],
    });

    const handleDrawerOpen = () => setIsDrawerOpen(true);
    const handleDrawerClose = () => setIsDrawerOpen(false);
    const handleStickyPdp = (e: Event) => {
      const custom = e as CustomEvent<{ isVisible: boolean }>;
      setIsStickyBarOpen(!!custom.detail?.isVisible);
    };

    window.addEventListener('tgc-drawer-open', handleDrawerOpen);
    window.addEventListener('tgc-drawer-close', handleDrawerClose);
    window.addEventListener('tgc-pdp-sticky', handleStickyPdp);

    return () => {
      observer.disconnect();
      window.removeEventListener('tgc-drawer-open', handleDrawerOpen);
      window.removeEventListener('tgc-drawer-close', handleDrawerClose);
      window.removeEventListener('tgc-pdp-sticky', handleStickyPdp);
    };
  }, []);

  if (!mounted || isExcluded) return null;

  const isHidden = isDrawerOpen || isStickyBarOpen;

  return (
    <div
      id="whatsapp-floating-button"
      className={`fixed z-[70] items-center group select-none pointer-events-auto right-4 md:right-6 bottom-[calc(64px+env(safe-area-inset-bottom,0px)+16px)] md:bottom-6 transition-opacity duration-200 ${
        isHidden ? 'opacity-0 pointer-events-none invisible' : 'opacity-100'
      }`}
    >
      {/* Desktop hover label */}
      <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-sans font-semibold uppercase tracking-[0.08em] text-[#1C1417] bg-white/95 px-3 py-1.5 shadow-md border border-black/10 mr-2.5 pointer-events-none rounded-lg select-none">
        Chat with us
      </span>

      {/* Button container with gentle pulse ring on load */}
      <div className="relative inline-flex items-center justify-center">
        {/* Single gentle pulse ring on load */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] -z-10 animate-whatsapp-ring pointer-events-none"
          aria-hidden="true"
        />

        {/* WhatsApp button — solid #25D366 circle, 56px, soft shadow, active:scale-[0.94] */}
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener"
          aria-label="Chat on WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(37,211,102,0.35)] active:scale-[0.94] transition-transform duration-150 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        >
          {/* Official WhatsApp glyph inline SVG (white phone-in-bubble logo) */}
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="currentColor"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.925-7.062A9.925 9.925 0 0 0 12.012 2zm0 18.314h-.003a8.318 8.318 0 0 1-4.241-1.157l-.304-.18-3.155.746.757-3.078-.198-.315a8.272 8.272 0 0 1-1.267-4.346c.001-4.577 3.731-8.303 8.313-8.303 2.217 0 4.302.863 5.869 2.428a8.248 8.248 0 0 1 2.43 5.867c-.002 4.578-3.732 8.304-8.311 8.304zm4.556-6.223c-.25-.125-1.477-.728-1.706-.811-.228-.083-.395-.125-.562.125-.166.25-.645.811-.79 1-.146.187-.291.208-.541.083-.25-.125-1.054-.388-2.008-1.238-.742-.662-1.243-1.48-1.389-1.73-.146-.25-.016-.385.109-.509.113-.112.25-.291.375-.437.125-.146.166-.25.25-.416.083-.167.042-.313-.021-.438-.063-.125-.562-1.354-.77-1.854-.203-.487-.41-.421-.562-.429-.146-.007-.312-.009-.479-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.417 1.02 2.583c.125.167 1.761 2.689 4.267 3.771.596.257 1.061.411 1.424.526.598.19 1.143.163 1.573.099.48-.071 1.477-.604 1.686-1.187.208-.583.208-1.083.146-1.187-.063-.105-.229-.167-.479-.292z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
