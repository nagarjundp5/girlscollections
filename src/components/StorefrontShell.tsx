'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBanner from '@/components/TopBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { CartDrawer } from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import { SearchOverlay } from '@/components/SearchOverlay';
import ToastContainer from '@/components/ToastContainer';
import WhatsAppButton from '@/components/WhatsAppButton';
import MobileBottomNav from '@/components/MobileBottomNav';
import LoginIncentivePopup from '@/components/LoginIncentivePopup';
import PushPrompt from '@/components/PushPrompt';

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isHomePage = pathname === '/';

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
      {/* Header Container (Fixed floating on Homepage over Hero so navbar stays pinned when scrolled, sticky on subpages) */}
      <header className={isHomePage ? 'fixed top-0 inset-x-0 z-50 w-full' : 'sticky top-0 z-50 w-full'}>
        <TopBanner isFloating={isHomePage} />
        <Navbar isFloating={isHomePage} />
      </header>

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
      <WhatsAppButton />
      <MobileBottomNav />
      <LoginIncentivePopup />
      <PushPrompt />
    </>
  );
}

