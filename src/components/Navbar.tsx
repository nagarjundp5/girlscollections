'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useShop } from '@/context/ShopContext';
import { useAuthSession } from '@/context/AuthContext';

const SlideInDrawer = dynamic(() => import('./SlideInDrawer'), { ssr: false });

const SmallCircularLogoCrest: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative flex items-center justify-center select-none shrink-0 w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-[#FAF6EE] border border-[#B8924A]/25 overflow-hidden shadow-xs ${className}`}
  >
    <Image
      src="/logo-120.webp"
      alt="The Girls Collections"
      width={128}
      height={140}
      className="w-full h-full object-contain p-0.5 hover:scale-105 transition-transform duration-200 z-10"
      priority
    />
  </div>
);

interface NavbarProps {
  isFloating?: boolean;
}

export default function Navbar({ isFloating = false }: NavbarProps) {
  const { cartCount, wishlist, setIsCartOpen } = useShop();
  const { user, isSignedIn, openAuthModal, logout } = useAuthSession();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Throttled Scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    const handleOpenCategoryMenu = () => {
      setMobileMenuOpen(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('open-category-menu', handleOpenCategoryMenu);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-category-menu', handleOpenCategoryMenu);
    };
  }, []);

  const brandTextRef = useRef<HTMLHeadingElement>(null);
  const brandContainerRef = useRef<HTMLDivElement>(null);

  // Fit-text fallback to guarantee single-line brand name on all mobile widths
  useEffect(() => {
    const adjustFontSize = () => {
      const el = brandTextRef.current;
      const container = brandContainerRef.current;
      if (!el || !container) return;
      if (window.innerWidth >= 640) {
        el.style.fontSize = '';
        return;
      }
      let size = 13.5;
      el.style.fontSize = `${size}px`;
      while (el.scrollWidth > container.clientWidth && size > 9.5) {
        size -= 0.25;
        el.style.fontSize = `${size}px`;
      }
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    window.addEventListener('orientationchange', adjustFontSize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(adjustFontSize);
    }
    return () => {
      window.removeEventListener('resize', adjustFontSize);
      window.removeEventListener('orientationchange', adjustFontSize);
    };
  }, []);

  return (
    <>
      <nav
        style={{ backgroundColor: '#FBF7F1' }}
        className={`w-full select-none text-[#1C1417] border-b border-[#EFE7E2] transition-shadow duration-200 ease-out z-40 h-[68px] md:h-[80px] ${
          isScrolled ? 'shadow-[0_2px_12px_rgba(28,20,23,0.06)]' : 'shadow-[0_1px_4px_rgba(28,20,23,0.03)]'
        }`}
        aria-label="Main Navigation"
      >
        <div className="max-w-[1440px] mx-auto h-full px-3 xs:px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-2 relative">
          
          {/* COLUMN 1 (LEFT): HAMBURGER ICON [40px] + LOGO [48px] */}
          <div className="flex items-center gap-2 sm:gap-3 justify-start shrink-0 z-20">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-controls="navigation-drawer"
              className="w-10 h-10 -ml-1 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer focus:outline-none touch-manipulation text-[#1C1417]"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <div className="w-5 h-3 flex flex-col justify-between">
                <span className="w-full h-[1.75px] rounded-full bg-[#1C1417] transition-all" />
                <span className="w-full h-[1.75px] rounded-full bg-[#1C1417] transition-all" />
                <span className="w-full h-[1.75px] rounded-full bg-[#1C1417] transition-all" />
              </div>
            </button>

            <Link href="/" className="hover:opacity-90 transition-opacity flex items-center shrink-0" title="The Girls Collections">
              <SmallCircularLogoCrest />
            </Link>
          </div>

          {/* COLUMN 2 (CENTER): BRAND NAME, FLEX: 1, MIN-WIDTH: 0, ZERO CLIPPING */}
          <div ref={brandContainerRef} className="flex-1 min-w-0 flex items-center justify-center pointer-events-auto z-10 px-1">
            <Link
              href="/"
              className="group focus:outline-none select-none text-center block max-w-full"
              aria-label="The Girls Collections Home"
            >
              <h1
                ref={brandTextRef}
                className="font-serif font-semibold text-[#1C1417] text-[clamp(11px,3.1vw,15px)] sm:text-[21px] md:text-[23px] tracking-[0.08em] sm:tracking-[0.22em] uppercase whitespace-nowrap transition-colors duration-200 group-hover:text-[#B8924A] m-0"
              >
                THE GIRLS COLLECTIONS
              </h1>
            </Link>
          </div>

          {/* COLUMN 3 (RIGHT): ACCOUNT (DESKTOP ONLY) + SHOPPING BAG */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 z-20 text-[#1C1417]">
            
            {/* Account Icon — Hidden on mobile as requested, kept on desktop */}
            <div className="relative hidden md:block">
              {isSignedIn ? (
                <div ref={userDropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-10 h-10 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer focus:outline-none touch-manipulation"
                    title="Account Options"
                    aria-label="Account Options"
                  >
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-[#FAF6EE] border border-stone-200 py-2 z-50 shadow-lg text-[#1A1A2E] rounded-sm"
                      >
                        <div className="px-4 py-2 border-b border-stone-200">
                          <p className="text-xs font-serif font-semibold truncate">
                            {user?.name || user?.email || user?.phone || 'Valued Member'}
                          </p>
                          <p className="text-[10px] font-sans text-stone-500 truncate">
                            {user?.email || user?.phone || 'Account Member'}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-1.5 text-xs font-sans hover:bg-stone-100 transition-colors"
                          >
                            My Profile
                          </Link>

                          <Link
                            href="/account/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-1.5 text-xs font-sans hover:bg-stone-100 transition-colors"
                          >
                            My Orders
                          </Link>

                          <Link
                            href="/track"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-1.5 text-xs font-sans hover:bg-stone-100 transition-colors"
                          >
                            Track Order
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-1.5 text-xs font-sans hover:bg-stone-100 transition-colors"
                          >
                            My Wishlist ({wishlist.length})
                          </Link>
                        </div>

                        <div className="border-t border-stone-200 my-1" />

                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full text-left px-4 py-1.5 text-xs font-sans text-red-700 hover:bg-red-50 transition-colors font-medium"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('google')}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer focus:outline-none touch-manipulation"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </button>
              )}
            </div>

            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 flex items-center justify-center hover:opacity-75 transition-opacity relative cursor-pointer focus:outline-none touch-manipulation"
              title="Shopping Bag"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-sans bg-[#B8924A] text-white">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </nav>

      {/* Slide-In Navigation Drawer */}
      <SlideInDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
