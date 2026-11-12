'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import TopBanner from '@/components/TopBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import ToastContainer from '@/components/ToastContainer';
import MobileBottomNav from '@/components/MobileBottomNav';

// Dynamic lazy imports for interactive overlays to remove heavy JS from initial critical path
const CartDrawer = dynamic(() => import('@/components/CartDrawer').then((m) => m.CartDrawer), {
  ssr: false,
});
const QuickViewModal = dynamic(() => import('@/components/QuickViewModal'), {
  ssr: false,
});
const SearchOverlay = dynamic(() => import('@/components/SearchOverlay').then((m) => m.SearchOverlay), {
  ssr: false,
});
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), {
  ssr: false,
});
const LoginIncentivePopup = dynamic(() => import('@/components/LoginIncentivePopup'), {
  ssr: false,
});
const PushPrompt = dynamic(() => import('@/components/PushPrompt'), {
  ssr: false,
});

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  // Defer interactive marketing/chat overlays until after page paint & idle
  useEffect(() => {
    const timer = setTimeout(() => setIsIdle(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Single passive, rAF-throttled scroll listener to smoothly hide/show announcement bar via translateY
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY <= 20) {
            setHideAnnouncement(false);
          } else if (currentY > 40 && currentY > lastScrollY) {
            setHideAnnouncement(true);
          } else if (currentY < lastScrollY - 10) {
            setHideAnnouncement(false);
          }
          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminRoute) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {/* 
        Fixed Header Wrapper:
        - Constant reserved height via CSS variable (--header-h)
        - NO transform or filter on <header> itself, so it never creates a containing block.
        - Translates children up by 36px on scroll to hide announcement bar without layout shift.
      */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-auto">
        <div
          className="w-full bg-[#3B1230] pt-[env(safe-area-inset-top,0px)]"
          style={{
            transform: hideAnnouncement ? 'translateY(-36px)' : 'translateY(0)',
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <TopBanner />
        </div>
        <div
          style={{
            transform: hideAnnouncement ? 'translateY(-36px)' : 'translateY(0)',
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Navbar />
        </div>
      </header>

      {/* 
        Constant Reserved Height Spacer:
        Prevents layout shift (CLS < 0.05), so hero starts at exactly that offset
        with no gap and no overlap across all viewports.
      */}
      <div
        style={{
          height: 'var(--header-h)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
        aria-hidden="true"
        className="w-full shrink-0 select-none pointer-events-none"
      />

      {/* Main Storefront Body */}
      <main className="flex-1 flex flex-col relative w-full p-0 m-0 pb-24 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Global Storefront Footer */}
      <Footer />

      {/* Interactive Drawers, Toast & Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <SearchOverlay />
      <ToastContainer />
      <MobileBottomNav />

      {/* Deferred third-party and popup overlays (loaded after idle) */}
      {isIdle && (
        <>
          <WhatsAppButton />
          <LoginIncentivePopup />
          <PushPrompt />
        </>
      )}
    </>
  );
}
