'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { useAuthSession } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlist, isSearchOpen, setIsSearchOpen } = useShop();
  const { isSignedIn, openAuthModal } = useAuthSession();

  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const lastScrollY = useRef(0);

  const isExcluded = pathname?.startsWith('/admin');

  // Detect scroll direction for hide/show behavior (220ms ease)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const diff = currentY - lastScrollY.current;

          // Always visible near top or on cart/checkout
          if (currentY < 50 || pathname === '/cart' || pathname === '/checkout') {
            setIsVisible(true);
          } else if (diff > 8) {
            // Scrolling down -> hide
            setIsVisible(false);
          } else if (diff < -8) {
            // Scrolling up -> show
            setIsVisible(true);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Hide when keyboard is active on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  if (isExcluded) return null;

  const wishlistCount = wishlist.length;

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/' && !isSearchOpen,
    },
    {
      id: 'shop',
      label: 'Shop',
      href: '/shop',
      icon: LayoutGrid,
      isActive: (pathname === '/shop' || pathname?.startsWith('/shop/')) && !isSearchOpen,
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      isActive: isSearchOpen,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSearchOpen(true);
      },
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      isActive: pathname === '/wishlist' && !isSearchOpen,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: isSignedIn ? '/account/orders' : undefined,
      icon: User,
      isActive: (pathname?.startsWith('/account') || pathname === '/sign-in') && !isSearchOpen,
      onClick: !isSignedIn
        ? (e: React.MouseEvent) => {
            e.preventDefault();
            openAuthModal('google');
          }
        : undefined,
    },
  ];

  // Hide nav when keyboard open or search overlay active
  const shouldHide = !isVisible || isKeyboardOpen || isSearchOpen;

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-[90] md:hidden bg-white border-t border-[#EFE7E2] select-none pb-[env(safe-area-inset-bottom)] transition-transform duration-[220ms] ease-out will-change-transform ${
        shouldHide ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{
        boxShadow: '0 -6px 24px rgba(28, 20, 23, 0.06)',
      }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="w-full h-16 flex items-center justify-around relative px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          const content = (
            <div className="relative w-full h-full flex flex-col items-center justify-center py-1 group min-h-[48px] touch-manipulation active:scale-[0.94] transition-transform duration-120">
              {/* Active Tab Top Indicator (2px Gold Hairline) */}
              {active && (
                <motion.div
                  layoutId="activeBottomTabLine"
                  className="absolute top-0 inset-x-3 h-[2px] bg-[#B08D57] rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Icon Container with Soft Blush Pill on Active */}
              <div className="relative flex items-center justify-center mb-0.5">
                {active && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute w-12 h-7 bg-[#F4E4E2] rounded-[14px] -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative z-10 p-1 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 stroke-[1.5] transition-colors duration-200 ${
                      active ? 'text-[#3B1230] stroke-[1.8]' : 'text-[#8A7F82]'
                    }`}
                  />

                  {/* Badge Counter (16px circle, Wine #3B1230, White 10px text) */}
                  {!!tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#3B1230] text-white text-[10px] font-bold flex items-center justify-center shadow-xs font-sans">
                      {tab.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Label (Always visible, Sentence Case, 11px, Jost/DM Sans 500) */}
              <span
                className={`text-[11px] font-medium tracking-[0.01em] transition-colors duration-200 leading-tight ${
                  active ? 'text-[#1C1417]' : 'text-[#8A7F82]'
                }`}
              >
                {tab.label}
              </span>
            </div>
          );

          if (tab.onClick) {
            return (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className="flex-1 h-full flex items-center justify-center cursor-pointer focus:outline-none min-w-[48px] min-h-[48px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label={tab.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href!}
              className="flex-1 h-full flex items-center justify-center focus:outline-none min-w-[48px] min-h-[48px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={tab.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
