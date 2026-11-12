'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft, MessageCircle, Package, User, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { WOMEN_CATEGORIES, KIDS_CATEGORIES, getCategoryHref } from '@/data/categoryTaxonomy';
import { useAuthSession } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

interface SlideInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerScreen = 'divisions' | 'women' | 'kids';

export const SlideInDrawer: React.FC<SlideInDrawerProps> = ({ isOpen, onClose }) => {
  const { isSignedIn, openAuthModal } = useAuthSession();
  const { wishlist } = useShop();
  const [currentScreen, setCurrentScreen] = useState<DrawerScreen>('divisions');
  const [mounted, setMounted] = useState(false);
  const [publishedCategorySlugs, setPublishedCategorySlugs] = useState<Set<string> | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (publishedCategorySlugs) return;

    fetch('/api/search/index')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) {
          const set = new Set<string>();
          data.items.forEach((item: any) => {
            if (item.cat) {
              set.add(`${item.div || 'women'}:${item.cat.toLowerCase()}`);
            }
          });
          setPublishedCategorySlugs(set);
        }
      })
      .catch(() => {});
  }, [isOpen, publishedCategorySlugs]);

  const handleClose = React.useCallback(() => {
    setCurrentScreen('divisions');
    onClose();
  }, [onClose]);

  // iOS-safe scroll lock on body while drawer is open:
  // Sets position: fixed with saved scrollY, and restores original scrollY on close.
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

    return () => {
      body.style.position = originalPosition;
      body.style.top = originalTop;
      body.style.left = originalLeft;
      body.style.right = originalRight;
      body.style.overflow = originalOverflow;
      body.style.width = originalWidth;
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
  }, [isOpen, currentScreen]);

  if (!mounted || !isOpen) return null;

  const content = (
    <>
      {/* 
        OVERLAY:
        - Fixed, inset 0, full viewport coverage
        - z-index: 990 (above announcement bar, header, pill, WhatsApp, bottom nav)
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
        - slide in 250ms ease-out (transform translateX)
      */}
      <aside
        id="navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        style={{
          width: 'min(88vw, 380px)',
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          overscrollBehavior: 'contain',
          animation: 'drawerSlideIn 250ms ease-out forwards',
        }}
        className="fixed top-0 left-0 bottom-0 z-[1000] bg-[#FBF7F1] text-[#1C1417] border-r border-[#EFE7E2] shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        {/* ── HEADER BAR ────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-[#EFE7E2] flex items-center justify-between bg-[#FBF7F1] shrink-0 min-h-[58px]">
          {currentScreen === 'divisions' ? (
            <Link href="/" onClick={handleClose} className="flex items-center gap-2.5">
              <span className="font-serif text-base tracking-[0.16em] uppercase text-[#1C1417] font-semibold">
                THE GIRLS COLLECTIONS
              </span>
            </Link>
          ) : (
            <button
              onClick={() => setCurrentScreen('divisions')}
              className="flex items-center gap-1.5 text-xs font-sans tracking-[0.12em] uppercase font-semibold text-[#1C1417] hover:text-[#B8924A] transition-colors cursor-pointer py-1 -ml-1 min-h-[44px]"
              aria-label="Back to divisions"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
              <span>{currentScreen === 'women' ? 'WOMEN' : 'KIDS'}</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1C1417]/75 hover:text-[#1C1417] hover:bg-black/5 transition-colors cursor-pointer focus:outline-none min-w-[36px] min-h-[36px]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* ── SCREENS WITH INTERNAL ONLY SCROLLER & OVERSCROLL CONTAINMENT ───────────── */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar relative"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {currentScreen === 'divisions' ? (
            /* SCREEN 1: DIVISIONS & CURATED DISCOVERY */
            <div className="p-5 space-y-6">
              {/* Primary Division Cards */}
              <div className="space-y-3">
                {/* WOMEN CARD */}
                <button
                  onClick={() => setCurrentScreen('women')}
                  className="w-full relative h-36 rounded-lg overflow-hidden group text-left cursor-pointer border border-[#EFE7E2] shadow-xs focus:outline-none touch-manipulation block"
                >
                  <Image
                    src="/categories/all-kurta-sets.webp"
                    alt="Women Collection"
                    fill
                    sizes="360px"
                    className="object-cover object-top brightness-[0.82] group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-2xl tracking-[0.14em] uppercase font-light text-white leading-tight">
                          WOMEN
                        </h2>
                        <p className="font-sans text-[11px] text-white/90 tracking-wider mt-0.5">
                          Kurta Sets, Anarkalis & Festive Wear
                        </p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#B8924A] transition-colors shrink-0 ml-2">
                        <ChevronRight className="w-4 h-4 stroke-[2]" />
                      </span>
                    </div>
                  </div>
                </button>

                {/* KIDS CARD */}
                <button
                  onClick={() => setCurrentScreen('kids')}
                  className="w-full relative h-36 rounded-lg overflow-hidden group text-left cursor-pointer border border-[#EFE7E2] shadow-xs focus:outline-none touch-manipulation block"
                >
                  <Image
                    src="/categories/kids-lehenga-blouse-or-pattu-pavadai.webp"
                    alt="Kids Collection"
                    fill
                    sizes="360px"
                    className="object-cover object-top brightness-[0.82] group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-2xl tracking-[0.14em] uppercase font-light text-white leading-tight">
                          KIDS
                        </h2>
                        <p className="font-sans text-[11px] text-white/90 tracking-wider mt-0.5">
                          Pattu Pavadai, Frocks & Gowns
                        </p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#B8924A] transition-colors shrink-0 ml-2">
                        <ChevronRight className="w-4 h-4 stroke-[2]" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Curated Quick Links */}
              <div className="pt-2 border-t border-[#EFE7E2] space-y-1">
                <span className="block font-sans text-[10px] tracking-[0.18em] uppercase text-[#6B6B7B] mb-2 font-semibold">
                  QUICK DISCOVERY
                </span>
                
                <Link
                  href="/shop?isNew=true"
                  onClick={handleClose}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1C1417]"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Sparkles className="w-4 h-4 text-[#B8924A]" />
                    New Drops
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                </Link>

                <Link
                  href="/shop?sort=popular"
                  onClick={handleClose}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1C1417]"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-[#B8924A]" />
                    Best Sellers
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                </Link>

                <Link
                  href="/track"
                  onClick={handleClose}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1C1417]"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Package className="w-4 h-4 text-[#B8924A]" />
                    Track Order
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                </Link>

                <a
                  href="https://wa.me/917411644799?text=Hi%2C%20I%20would%20like%20assistance%20with%20The%20Girls%20Collections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1C1417]"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    WhatsApp Concierge
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                </a>
              </div>
            </div>
          ) : (
            /* SCREEN 2: DIVISION SUBCATEGORIES LIST */
            <div className="p-5 space-y-4">
              {/* View All Button */}
              <Link
                href={currentScreen === 'women' ? '/shop?target=women' : '/shop?target=kids'}
                onClick={handleClose}
                className="w-full block py-2.5 text-center rounded-md bg-[#1C1417] text-white font-sans text-xs uppercase tracking-[0.16em] font-medium hover:bg-black transition-colors"
              >
                View All {currentScreen === 'women' ? "Women's Collection" : "Kids' Collection"}
              </Link>

              {/* Category List */}
              <div className="divide-y divide-[#EFE7E2] pt-1">
                {(currentScreen === 'women' ? WOMEN_CATEGORIES : KIDS_CATEGORIES)
                  .filter((cat) => {
                    if (!publishedCategorySlugs) return true;
                    return (
                      publishedCategorySlugs.has(`${currentScreen}:${cat.slug.toLowerCase()}`) ||
                      publishedCategorySlugs.has(`${currentScreen}:${cat.id.toLowerCase()}`)
                    );
                  })
                  .map((cat) => (
                  <Link
                    key={cat.id}
                    href={getCategoryHref(cat)}
                    onClick={handleClose}
                    className="flex items-center justify-between py-3 px-1 hover:text-[#B8924A] transition-colors group"
                  >
                    <div>
                      <span className="block font-sans text-sm text-[#1C1417] group-hover:text-[#B8924A] transition-colors font-medium">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="block font-sans text-[11px] text-[#6B6B7B] mt-0.5 line-clamp-1">
                          {cat.description}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B6B7B]/60 group-hover:text-[#B8924A] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER BAR ────────────────────────────────────── */}
        <div className="p-4 border-t border-[#EFE7E2] bg-[#FBF7F1] shrink-0">
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            {isSignedIn ? (
              <Link
                href="/account/orders"
                onClick={handleClose}
                className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1C1417] font-medium"
              >
                <User className="w-4 h-4 text-[#6B6B7B]" />
                <span>My Account</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  handleClose();
                  openAuthModal('google');
                }}
                className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1C1417] text-left cursor-pointer font-medium"
              >
                <User className="w-4 h-4 text-[#6B6B7B]" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="/wishlist"
              onClick={handleClose}
              className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1C1417] font-medium"
            >
              <Heart className="w-4 h-4 text-[#6B6B7B]" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );

  return createPortal(content, document.body);
};

export default SlideInDrawer;
