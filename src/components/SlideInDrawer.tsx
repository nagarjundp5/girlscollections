'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ChevronRight,
  Package,
  User,
  Heart,
  Sparkles,
  TrendingUp,
  FileText,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  WOMEN_CIRCLE_CATEGORIES,
  KIDS_CIRCLE_CATEGORIES,
} from '@/components/home/CircularCategoryScroller';
import { useAuthSession } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

interface SlideInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlideInDrawer: React.FC<SlideInDrawerProps> = ({ isOpen, onClose }) => {
  const { isSignedIn, openAuthModal } = useAuthSession();
  const { wishlist } = useShop();
  const [selectedDivision, setSelectedDivision] = useState<'women' | 'kids'>('women');
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // iOS-safe scroll lock on body while drawer is open + set data attributes for child components
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const body = document.body;
    const originalPosition = body.style.position;
    const originalTop = body.style.top;
    const originalLeft = body.style.left;
    const originalRight = body.style.right;
    const originalOverflow = body.style.overflow;
    const originalWidth = body.style.width;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
    body.style.width = '100%';
    body.setAttribute('data-drawer-open', 'true');
    body.setAttribute('data-menu-open', 'true');
    window.dispatchEvent(new CustomEvent('tgc-drawer-open'));

    return () => {
      body.style.position = originalPosition;
      body.style.top = originalTop;
      body.style.left = originalLeft;
      body.style.right = originalRight;
      body.style.overflow = originalOverflow;
      body.style.width = originalWidth;
      body.removeAttribute('data-drawer-open');
      body.removeAttribute('data-menu-open');
      window.dispatchEvent(new CustomEvent('tgc-drawer-close'));
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus trap inside the drawer
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusTimer = setTimeout(() => {
      if (!drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 50);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const elements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (elements.length === 0) return;

      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleTabKey);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Swipe-left gesture to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleClose();
    }
    touchStartX.current = null;
  };

  if (!mounted || !isOpen) return null;

  const currentCategories =
    selectedDivision === 'women' ? WOMEN_CIRCLE_CATEGORIES : KIDS_CIRCLE_CATEGORIES;

  const content = (
    <>
      {/* 
        OVERLAY:
        - Fixed, inset 0, full viewport coverage
        - z-index: 990
        - Background: rgba(28,20,23,0.5)
        - Fade in 200ms (opacity only)
      */}
      <div
        onClick={handleClose}
        style={{
          backgroundColor: 'rgba(28, 20, 23, 0.5)',
          animation: 'drawerOverlayFadeIn 200ms ease-out forwards',
        }}
        className="fixed inset-0 z-[990] cursor-pointer"
        aria-hidden="true"
      />

      {/* 
        DRAWER PANEL:
        - Fixed, top 0, left 0, bottom 0
        - z-index: 1000
        - width: min(88vw, 380px)
        - height: 100dvh
        - safe-area padding top and bottom
        - overflow-y: auto with overscroll-behavior: contain
        - slide in 260ms ease-out (transform translateX)
      */}
      <aside
        id="navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: 'min(88vw, 380px)',
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          overscrollBehavior: 'contain',
          animation: 'drawerSlideIn 260ms ease-out forwards',
        }}
        className="fixed top-0 left-0 bottom-0 z-[1000] bg-[#FAF8F5] text-[#1A1E3A] border-r border-[#EFE7E2] shadow-2xl flex flex-col justify-between overflow-hidden font-sans"
      >
        {/* ── HEADER BAR ──────────────────────────────────────
            - Brand LOGO image (no uppercase letter-spaced serif wordmark text)
            - Close button 44px
        */}
        <div className="px-5 py-3 border-b border-[#EAE5DE] flex items-center justify-between bg-[#FAF8F5] shrink-0 min-h-[58px]">
          <Link href="/" onClick={handleClose} className="flex items-center gap-2">
            <Image
              src="/logo-120.webp"
              alt="The Girls Collections"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <button
            onClick={handleClose}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#1A1E3A] hover:bg-black/5 active:scale-95 transition-all cursor-pointer focus:outline-none"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {/* Segmented toggle "Women | Kids" (pill, sliding indicator with transform, rose-pink active) */}
          <div className="relative flex rounded-full bg-[#EFE7E2] p-1 border border-[#E8DFD8]">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#C44D6C] shadow-xs transition-transform duration-260 ease-out"
              style={{
                transform: selectedDivision === 'women' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
            <button
              type="button"
              onClick={() => setSelectedDivision('women')}
              className={`relative z-10 flex-1 py-2 text-center text-sm font-semibold rounded-full transition-colors duration-200 select-none cursor-pointer ${
                selectedDivision === 'women'
                  ? 'text-white'
                  : 'text-[#1A1E3A]/80 hover:text-[#1A1E3A]'
              }`}
            >
              Women
            </button>
            <button
              type="button"
              onClick={() => setSelectedDivision('kids')}
              className={`relative z-10 flex-1 py-2 text-center text-sm font-semibold rounded-full transition-colors duration-200 select-none cursor-pointer ${
                selectedDivision === 'kids'
                  ? 'text-white'
                  : 'text-[#1A1E3A]/80 hover:text-[#1A1E3A]'
              }`}
            >
              Kids
            </button>
          </div>

          {/* 2-Column Grid of Category Tiles (Rounded white cards with circular images) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. First Tile: New Arrivals */}
            <Link
              href={`/shop?isNew=true&target=${selectedDivision}`}
              onClick={handleClose}
              className="bg-white rounded-xl border border-[#EFE7E2] p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#C44D6C]/50 active:scale-[0.97] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#FFF0F3] border border-[#F3DDE0] flex items-center justify-center mb-2 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#C44D6C]" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#1A1E3A] leading-tight">
                New Arrivals
              </span>
            </Link>

            {/* Category tiles */}
            {currentCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.slug)}&target=${selectedDivision}`}
                onClick={handleClose}
                className="bg-white rounded-xl border border-[#EFE7E2] p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#B8903A]/50 active:scale-[0.97] transition-all cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#FAF6EE] border border-[#B8903A]/20 flex items-center justify-center mb-2 shrink-0 group-hover:scale-105 transition-transform">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="48px"
                    className="object-contain p-0.5"
                    loading="lazy"
                  />
                </div>
                <span className="text-[13px] sm:text-[14px] font-semibold text-[#1A1E3A] line-clamp-1 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}

            {/* Last Tile: View All */}
            <Link
              href={`/shop?target=${selectedDivision}`}
              onClick={handleClose}
              className="bg-white rounded-xl border border-[#EFE7E2] p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#1A1E3A]/50 active:scale-[0.97] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#B8903A]/20 flex items-center justify-center mb-2 shrink-0 group-hover:scale-105 transition-transform">
                <ArrowRight className="w-5 h-5 text-[#1A1E3A]" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#1A1E3A] leading-tight">
                View All
              </span>
            </Link>
          </div>

          {/* Quick links list */}
          <div className="pt-2 border-t border-[#EAE5DE] space-y-1">
            <h3 className="text-[18px] font-bold text-[#1A1E3A] mb-2 px-1">
              Quick Links
            </h3>
            <div className="space-y-0.5">
              {[
                { href: '/shop?isNew=true', label: 'New Drops', icon: Sparkles },
                { href: '/shop?sort=popular', label: 'Best Sellers', icon: TrendingUp },
                { href: '/track', label: 'Track Order', icon: Package },
                { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: FileText },
                { href: '/faqs', label: 'Help & FAQs', icon: HelpCircle },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={handleClose}
                  className="flex items-center justify-between min-h-[44px] py-2 px-2.5 rounded-lg text-[16px] sm:text-[17px] font-semibold text-[#1A1E3A] hover:bg-black/5 active:scale-[0.99] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#C44D6C] shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span>{label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#1A1E3A]/40" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR (Sign In and Wishlist count) ──────────── */}
        <div className="p-4 border-t border-[#EAE5DE] bg-white flex items-center justify-between text-sm font-semibold shrink-0">
          {isSignedIn ? (
            <Link
              href="/account/orders"
              onClick={handleClose}
              className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-black/5 text-[#1A1E3A]"
            >
              <User className="w-4 h-4 text-[#C44D6C]" />
              <span>My Account</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleClose();
                openAuthModal('google');
              }}
              className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-black/5 text-[#1A1E3A] cursor-pointer"
            >
              <User className="w-4 h-4 text-[#C44D6C]" />
              <span>Sign In</span>
            </button>
          )}

          <Link
            href="/wishlist"
            onClick={handleClose}
            className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-black/5 text-[#1A1E3A]"
          >
            <Heart className="w-4 h-4 text-[#C44D6C]" />
            <span>Wishlist ({wishlist.length})</span>
          </Link>
        </div>
      </aside>
    </>
  );

  return createPortal(content, document.body);
};

export default SlideInDrawer;
