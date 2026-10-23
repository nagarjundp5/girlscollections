'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft, MessageCircle, Package, User, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WOMEN_CATEGORIES, KIDS_CATEGORIES, getCategoryHref } from '@/data/categoryTaxonomy';
import { useAuthSession } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

interface SlideInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerScreen = 'divisions' | 'women' | 'kids';

export const SlideInDrawer: React.FC<SlideInDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isSignedIn, openAuthModal } = useAuthSession();
  const { wishlist } = useShop();
  const [currentScreen, setCurrentScreen] = useState<DrawerScreen>('divisions');

  const handleClose = () => {
    setCurrentScreen('divisions');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[140] bg-[#1A1E3A]/70 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-In Left Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 left-0 z-[150] w-[90vw] max-w-[390px] bg-[#FAF6EE] text-[#1A1A2E] border-r border-[#1A1E3A]/10 shadow-2xl flex flex-col justify-between overflow-hidden"
            role="dialog"
            aria-label="Navigation Menu"
          >
            {/* ── HEADER BAR ────────────────────────────────────── */}
            <div className="px-5 py-4 border-b border-[#1A1E3A]/10 flex items-center justify-between bg-[#FAF6EE] shrink-0 min-h-[58px]">
              {currentScreen === 'divisions' ? (
                <Link href="/" onClick={handleClose} className="flex items-center gap-2.5">
                  <span className="font-serif text-base tracking-[0.16em] uppercase text-[#1A1E3A] font-normal">
                    THE GIRLS COLLECTIONS
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setCurrentScreen('divisions')}
                  className="flex items-center gap-1.5 text-xs font-sans tracking-[0.12em] uppercase font-medium text-[#1A1E3A] hover:text-[#B8924A] transition-colors cursor-pointer py-1 -ml-1 min-h-[44px]"
                  aria-label="Back to divisions"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{currentScreen === 'women' ? 'WOMEN' : 'KIDS'}</span>
                </button>
              )}

              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#1A1A2E]/70 hover:text-[#1A1A2E] hover:bg-black/5 transition-colors cursor-pointer focus:outline-none min-w-[36px] min-h-[36px]"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* ── SCREENS WITH ANIMATED SLIDE TRANSITION ───────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <AnimatePresence mode="wait">
                {currentScreen === 'divisions' ? (
                  /* SCREEN 1: DIVISIONS & CURATED DISCOVERY */
                  <motion.div
                    key="divisions"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-6"
                  >
                    {/* Primary Division Cards */}
                    <div className="space-y-3">
                      {/* WOMEN CARD */}
                      <button
                        onClick={() => setCurrentScreen('women')}
                        className="w-full relative h-36 rounded-lg overflow-hidden group text-left cursor-pointer border border-[#1A1E3A]/10 shadow-xs focus:outline-none touch-manipulation block"
                      >
                        <Image
                          src="/categories/all-kurta-sets.webp"
                          alt="Women Collection"
                          fill
                          sizes="360px"
                          className="object-cover object-top brightness-[0.78] group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="font-serif text-2xl tracking-[0.14em] uppercase font-light text-white leading-tight">
                                WOMEN
                              </h2>
                              <p className="font-sans text-[11px] text-white/80 tracking-wider mt-0.5">
                                Kurta Sets, Anarkalis & Festive Wear
                              </p>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#B8924A] transition-colors shrink-0 ml-2">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* KIDS CARD */}
                      <button
                        onClick={() => setCurrentScreen('kids')}
                        className="w-full relative h-36 rounded-lg overflow-hidden group text-left cursor-pointer border border-[#1A1E3A]/10 shadow-xs focus:outline-none touch-manipulation block"
                      >
                        <Image
                          src="/categories/kids-lehenga-blouse-or-pattu-pavadai.webp"
                          alt="Kids Collection"
                          fill
                          sizes="360px"
                          className="object-cover object-top brightness-[0.78] group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="font-serif text-2xl tracking-[0.14em] uppercase font-light text-white leading-tight">
                                KIDS
                              </h2>
                              <p className="font-sans text-[11px] text-white/80 tracking-wider mt-0.5">
                                Pattu Pavadai, Frocks & Gowns
                              </p>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#B8924A] transition-colors shrink-0 ml-2">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Curated Quick Links */}
                    <div className="pt-2 border-t border-[#1A1E3A]/10 space-y-1">
                      <span className="block font-sans text-[10px] tracking-[0.18em] uppercase text-[#6B6B7B] mb-2 font-medium">
                        QUICK DISCOVERY
                      </span>
                      
                      <Link
                        href="/shop?isNew=true"
                        onClick={handleClose}
                        className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1A1A2E]"
                      >
                        <span className="flex items-center gap-2.5 font-normal">
                          <Sparkles className="w-4 h-4 text-[#B8924A]" />
                          New Drops
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                      </Link>

                      <Link
                        href="/shop?sort=popular"
                        onClick={handleClose}
                        className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1A1A2E]"
                      >
                        <span className="flex items-center gap-2.5 font-normal">
                          <TrendingUp className="w-4 h-4 text-[#B8924A]" />
                          Best Sellers
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                      </Link>

                      <Link
                        href="/track"
                        onClick={handleClose}
                        className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1A1A2E]"
                      >
                        <span className="flex items-center gap-2.5 font-normal">
                          <Package className="w-4 h-4 text-[#B8924A]" />
                          Track Order
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                      </Link>

                      <a
                        href="https://wa.me/917411644799?text=Hi%2C%20I%20would%20like%20assistance%20with%20The%20Girls%20Collections"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-black/5 transition-colors text-sm font-sans text-[#1A1A2E]"
                      >
                        <span className="flex items-center gap-2.5 font-normal">
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          WhatsApp Concierge
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  /* SCREEN 2: DIVISION SUBCATEGORIES LIST */
                  <motion.div
                    key={currentScreen}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-4"
                  >
                    {/* View All Button */}
                    <Link
                      href={currentScreen === 'women' ? '/shop?target=women' : '/shop?target=kids'}
                      onClick={handleClose}
                      className="w-full block py-2.5 text-center rounded-md bg-[#1A1E3A] text-white font-sans text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#14183A] transition-colors"
                    >
                      View All {currentScreen === 'women' ? "Women's Collection" : "Kids' Collection"}
                    </Link>

                    {/* Category List */}
                    <div className="divide-y divide-[#1A1E3A]/8 pt-1">
                      {(currentScreen === 'women' ? WOMEN_CATEGORIES : KIDS_CATEGORIES).map((cat) => (
                        <Link
                          key={cat.id}
                          href={getCategoryHref(cat)}
                          onClick={handleClose}
                          className="flex items-center justify-between py-3 px-1 hover:text-[#B8924A] transition-colors group"
                        >
                          <div>
                            <span className="block font-sans text-sm text-[#1A1A2E] group-hover:text-[#B8924A] transition-colors font-normal">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── FOOTER BAR ────────────────────────────────────── */}
            <div className="p-4 border-t border-[#1A1E3A]/10 bg-[#FAF6EE] shrink-0">
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                {isSignedIn ? (
                  <Link
                    href="/account/orders"
                    onClick={handleClose}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1A1A2E]"
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
                    className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1A1A2E] text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#6B6B7B]" />
                    <span>Sign In</span>
                  </button>
                )}

                <Link
                  href="/wishlist"
                  onClick={handleClose}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-sm hover:bg-black/5 text-[#1A1A2E]"
                >
                  <Heart className="w-4 h-4 text-[#6B6B7B]" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideInDrawer;
