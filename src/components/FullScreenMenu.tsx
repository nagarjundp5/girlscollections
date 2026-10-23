'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ArrowUpRight,
  User,
  Search,
  Sparkles,
  Zap,
  Flame,
  Tag,
  Layers,
  MessageCircle,
  Package,
  RefreshCw,
  MapPin,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { useAuthSession } from '@/context/AuthContext';
import {
  WOMEN_CATEGORIES,
  KIDS_CATEGORIES,
  getCategoryHref,
  CategoryItem,
} from '@/data/categoryTaxonomy';

interface FullScreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sub-category Definition
interface SubCategoryMeta {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  categories: CategoryItem[];
}

const silkEase = [0.16, 1, 0.3, 1] as const;

// Motion Variants
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: silkEase } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: silkEase } },
};

const menuPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: '15%', transformOrigin: 'bottom center' },
  visible: {
    opacity: 1,
    scale: 1,
    y: '0%',
    transformOrigin: 'bottom center',
    transition: { duration: 0.38, ease: silkEase },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: '15%',
    transformOrigin: 'bottom center',
    transition: { duration: 0.28, ease: silkEase },
  },
};

const sectionStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const sectionFadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: silkEase } },
};

const gridItemStagger: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.28,
      ease: silkEase,
    },
  }),
};

// Custom Temple Arch Expand Icon (Top-Right Floating Glassmorphic Overlay)
const TempleArchExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => {
  return (
    <div
      className={`relative flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
        expanded
          ? 'border-zariGold bg-zariGold text-black shadow-lg shadow-zariGold/40 scale-105'
          : 'border-white/30 bg-black/40 text-white hover:border-white/60 hover:bg-black/60'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 stroke-[2.2] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
      >
        <path d="M6 14 L12 8 L18 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 18 A 6 6 0 0 1 18 18" strokeLinecap="round" strokeDasharray="2 2" opacity="0.6" />
      </svg>
    </div>
  );
};

// Quick Links Data
const QUICK_JUMP_LINKS = [
  { id: 'festive', label: 'Festive Edit', href: '/shop?occasion=Festive', icon: Sparkles, badge: 'HOT' },
  { id: 'new', label: 'New Arrivals', href: '/shop?isNew=true', icon: Zap, badge: 'NEW' },
  { id: 'bestsellers', label: 'Bestsellers', href: '/shop?sort=popular', icon: Flame, badge: 'POPULAR' },
  { id: 'budget', label: 'Under ₹1999', href: '/shop?maxPrice=1999', icon: Tag },
  { id: 'coords', label: 'Co-ord Sets', href: '/shop?category=co-ord-set', icon: Layers },
];

// Customer Care & Services Links
const CUSTOMER_CARE_LINKS = [
  { id: 'chat', label: 'WhatsApp Support', href: '/contact', icon: MessageCircle, subtitle: 'Instant 10am - 8pm IST' },
  { id: 'track', label: 'Track Order Status', href: '/account/orders', icon: Package, subtitle: 'Real-time courier updates' },
  { id: 'returns', label: 'Returns & Exchanges', href: '/policies/terms-and-conditions', icon: RefreshCw, subtitle: 'Easy 7-day doorstep pickup' },
  { id: 'stores', label: 'Store Locator', href: '/contact#stores', icon: MapPin, subtitle: 'Bengaluru flagship boutiquery' },
  { id: 'faq', label: 'About & FAQ', href: '/about', icon: HelpCircle, subtitle: 'Brand story & questions' },
];

export const FullScreenMenu: React.FC<FullScreenMenuProps> = ({ isOpen, onClose }) => {
  const prefersReducedMotion = useReducedMotion();
  const { user, isSignedIn, openAuthModal } = useAuthSession();
  const [activeAudience, setActiveAudience] = useState<'women' | 'kids'>('women');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle Menu Close
  const handleCloseMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-category-menu'));
    }
    onClose();
  };

  // Listen for external open-category-menu trigger
  useEffect(() => {
    const handleOpenCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ group?: 'women' | 'kids' }>;
      if (customEvent.detail?.group) {
        setActiveAudience(customEvent.detail.group);
      }
    };
    window.addEventListener('open-category-menu', handleOpenCategory);
    return () => window.removeEventListener('open-category-menu', handleOpenCategory);
  }, []);

  // Categorize Women's Sub-Groups
  const womenSubCategories: SubCategoryMeta[] = useMemo(() => {
    return [
      {
        id: 'ethnic-wear',
        title: 'Ethnic Wear',
        subtitle: 'Anarkalis, Sarees & Suit Sets',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
        categories: WOMEN_CATEGORIES.filter((c) =>
          [
            'all-kurta-sets',
            'anarkali-kurta-suit-sets',
            'straight-cut-kurta-suit-sets',
            'palazzo-kurta-suit-sets',
            'a-line-kurta-sets',
            '2-pc-kurta-set',
            'only-kurta',
            'long-jacket-kurta',
            'lehenga-blouse-or-pattu-pavadai',
          ].includes(c.id)
        ),
      },
      {
        id: 'western-wear',
        title: 'Western Wear',
        subtitle: 'Co-ords, Skirts & Tops',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
        categories: WOMEN_CATEGORIES.filter((c) =>
          ['co-ord-set', 'skirt-and-top', 'western-short-tops-or-short-kurtis', 'bottom-wear'].includes(c.id)
        ),
      },
      {
        id: 'party-wear',
        title: 'Party Wear',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600',
        subtitle: 'Gowns & Sequin Statement Edits',
        categories: WOMEN_CATEGORIES.filter((c) =>
          ['single-pc-long-anarkali', 'lehenga-blouse-or-pattu-pavadai', 'anarkali-kurta-suit-sets', 'co-ord-set'].includes(c.id)
        ),
      },
      {
        id: 'casual-wear',
        title: 'Casual Wear',
        subtitle: 'Daily Kurtis & Tunics',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600',
        categories: WOMEN_CATEGORIES.filter((c) =>
          ['plus-size-kurta-sets', 'plus-size-only-kurta', 'plus-size-short-kurta', 'only-kurta'].includes(c.id)
        ),
      },
    ];
  }, []);

  // Categorize Kids' Sub-Groups
  const kidsSubCategories: SubCategoryMeta[] = useMemo(() => {
    return [
      {
        id: 'kids-ethnic',
        title: 'Ethnic Wear',
        subtitle: 'Pure Silk Pattu Pavadai',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=600',
        categories: KIDS_CATEGORIES.filter((c) =>
          [
            'kids-lehenga-blouse-or-pattu-pavadai',
            'kids-traditional-gown-1-pc',
            'kids-cotton-lehenga-blouse-or-cotton-pattu-pavadai',
            'kids-lehenga-davani-or-lehengas',
            'children-anarkali-suit',
            'children-kurta-sets',
            'dothi-set',
          ].includes(c.id)
        ),
      },
      {
        id: 'kids-western',
        title: 'Western Wear',
        subtitle: 'Dresses, Skirts & Tops',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=600',
        categories: KIDS_CATEGORIES.filter((c) =>
          ['children-co-ord-set', 'crop-top-with-palazzo-3-pc-set', 'bodycon-dresses-for-kids', 'denim-dresses-for-kids', 'kids-western-skirt-and-top'].includes(c.id)
        ),
      },
      {
        id: 'kids-party',
        title: 'Party Wear',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=600',
        subtitle: 'Birthday Frocks & Gowns',
        categories: KIDS_CATEGORIES.filter((c) =>
          ['party-wear-frocks', 'party-wear-gowns', 'traditional-frocks', 'kids-sharara-set', 'ghagra-choli'].includes(c.id)
        ),
      },
      {
        id: 'kids-casual',
        title: 'Casual Wear',
        subtitle: 'Daily Cotton Frocks & Leggings',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=600',
        categories: KIDS_CATEGORIES.filter((c) =>
          ['children-only-kurta', 'children-leggings', 'cotton-frocks-or-daily-wear-frocks', 'casual-frocks', 'casual-palazzo-set'].includes(c.id)
        ),
      },
    ];
  }, []);

  const activeSubCategoryList = activeAudience === 'women' ? womenSubCategories : kidsSubCategories;

  // Filtered Categories based on Search Query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const all = activeAudience === 'women' ? WOMEN_CATEGORIES : KIDS_CATEGORIES;
    return all.filter((cat) => cat.name.toLowerCase().includes(q) || cat.displayLabel?.toLowerCase().includes(q));
  }, [searchQuery, activeAudience]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleCloseMenu}
          className="fixed inset-0 z-[110] bg-[#1C1F3B]/75 backdrop-blur-md flex flex-col justify-end select-none"
        >
          {/* MAIN MENU TAKEOVER PANEL */}
          <motion.div
            variants={menuPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                handleCloseMenu();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[94vh] sm:h-[90vh] bg-ivory text-inkNavy rounded-t-[36px] border-t border-zariGold/40 shadow-2xl flex flex-col justify-between overflow-hidden relative touch-pan-y"
          >
            {/* Swipe Down Handle */}
            <div className="w-full flex justify-center py-2 bg-ivory cursor-grab active:cursor-grabbing z-30 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-zariGold/40 hover:bg-zariGold transition-colors" />
            </div>

            {/* Background Temple Arch Motif Silhouette */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.025] z-0">
              <svg viewBox="0 0 400 600" className="w-[120%] max-w-[900px] h-auto text-zariGold" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M 50 600 V 220 A 150 150 0 0 1 350 220 V 600 Z" />
                <path d="M 70 600 V 230 A 130 130 0 0 1 330 230 V 600 Z" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* SECTION A: HEADER */}
            <div className="w-full px-5 sm:px-10 py-3 border-b border-zariGold/20 flex items-center justify-between shrink-0 bg-ivory/95 backdrop-blur-md z-20">
              <Link href="/" onClick={handleCloseMenu} className="flex items-center gap-3 focus:outline-none">
                <Image
                  src="/logo.png"
                  alt="The Girls Collections Logo"
                  width={322}
                  height={353}
                  className="h-9 sm:h-10 w-auto object-contain"
                />
                <div className="flex flex-col text-left">
                  <span className="font-serif text-[11px] sm:text-[12px] font-bold text-inkNavy tracking-[0.18em]">
                    THE GIRLS
                  </span>
                  <span className="font-serif text-[10px] sm:text-[11px] font-bold text-zariGold tracking-[0.20em]">
                    COLLECTIONS
                  </span>
                </div>
              </Link>

              {/* Close Button with Press Animation */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleCloseMenu}
                className="w-9 h-9 rounded-full bg-inkNavy/5 border border-zariGold/40 flex items-center justify-center text-inkNavy hover:bg-zariGold hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
                aria-label="Close menu"
              >
                <X className="w-4.5 h-4.5 stroke-[2]" />
              </motion.button>
            </div>

            {/* MAIN SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-4 sm:px-10 py-4 sm:py-6 space-y-6 relative z-10">
              <motion.div
                variants={prefersReducedMotion ? {} : sectionStaggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* SECTION B: SEARCH BAR */}
                <motion.div variants={sectionFadeUp} className="sticky top-0 z-30 pt-1">
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: isSearchFocused || searchQuery ? 1.1 : 1,
                        color: isSearchFocused ? '#B8860B' : '#71717A',
                      }}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    >
                      <Search className="w-4 h-4 text-zariGold" />
                    </motion.div>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="Search garments, dresses, kurtis..."
                      className={`w-full pl-10 pr-12 py-3 rounded-2xl bg-ivory border text-inkNavy placeholder:text-inkNavy/40 text-xs sm:text-sm font-sans focus:outline-none transition-all shadow-xs ${
                        isSearchFocused
                          ? 'border-zariGold ring-2 ring-zariGold/30 shadow-md shadow-zariGold/10'
                          : 'border-zariGold/40 hover:border-zariGold/70'
                      }`}
                    />

                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-sans font-bold text-zariGold hover:text-inkNavy"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* SEARCH RESULTS OVERLAY */}
                {searchResults && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white border border-zariGold/30 shadow-lg space-y-2">
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-zariGold block border-b border-zariGold/20 pb-1">
                      Search Results ({searchResults.length})
                    </span>
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-inkNavy/60 py-2 italic">No categories found matching &quot;{searchQuery}&quot;</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {searchResults.map((cat) => (
                          <Link
                            key={cat.id}
                            href={getCategoryHref(cat)}
                            onClick={handleCloseMenu}
                            className="flex items-center justify-between p-2 rounded-lg bg-ivory hover:bg-zariGold/10 text-xs font-medium text-inkNavy"
                          >
                            <span>{cat.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-zariGold" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* SECTION C: AUDIENCE SWITCHER & SUB-CATEGORY GRID */}
                <motion.div variants={sectionFadeUp} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zariGold/20 pb-2">
                    <span className="font-sans font-bold text-[11px] text-zariGold tracking-[0.25em] uppercase">
                      Explore by Audience &amp; Style
                    </span>
                    <span className="text-[11px] font-serif italic text-zariGold/80">
                      * Curated Lookbook Edit
                    </span>
                  </div>

                  {/* 2-CARD AUDIENCE SWITCHER — FULL-BLEED 3:4 PORTRAIT PHOTO CARDS */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* WOMEN CARD */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setActiveAudience('women');
                        setActiveSubCategory(null);
                      }}
                      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer shadow-md ${
                        activeAudience === 'women'
                          ? 'border-zariGold ring-2 ring-zariGold/50 shadow-zariGold/20'
                          : 'border-zariGold/30 opacity-90 hover:opacity-100 hover:border-zariGold/70'
                      }`}
                    >
                      <Image
                        src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
                        alt="Women Fashion"
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                      {/* Dark Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-between">
                        <div className="flex justify-end">
                          <TempleArchExpandIcon expanded={activeAudience === 'women'} />
                        </div>

                        <div>
                          <h3 className="font-serif text-2xl font-bold text-white tracking-tight leading-none mb-1">
                            WOMEN
                          </h3>
                          <span className="text-[10.5px] font-serif italic text-amber-200 block">
                            {WOMEN_CATEGORIES.length} Curated Categories
                          </span>
                        </div>
                      </div>
                    </motion.button>

                    {/* KIDS CARD */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setActiveAudience('kids');
                        setActiveSubCategory(null);
                      }}
                      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer shadow-md ${
                        activeAudience === 'kids'
                          ? 'border-zariGold ring-2 ring-zariGold/50 shadow-zariGold/20'
                          : 'border-zariGold/30 opacity-90 hover:opacity-100 hover:border-zariGold/70'
                      }`}
                    >
                      <Image
                        src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=600"
                        alt="Kids Fashion"
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                      {/* Dark Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-between">
                        <div className="flex justify-end">
                          <TempleArchExpandIcon expanded={activeAudience === 'kids'} />
                        </div>

                        <div>
                          <h3 className="font-serif text-2xl font-bold text-white tracking-tight leading-none mb-1">
                            KIDS
                          </h3>
                          <span className="text-[10.5px] font-serif italic text-amber-200 block">
                            {KIDS_CATEGORIES.length} Curated Categories
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  {/* SUB-CATEGORY GRID — FULL-BLEED PORTRAIT LOOKBOOK CARDS (2 PER ROW) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAudience}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: silkEase }}
                      className="overflow-hidden space-y-3 pt-2"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {activeSubCategoryList.map((sub, idx) => {
                          const isExpanded = activeSubCategory === sub.id;
                          return (
                            <div key={sub.id} className="col-span-1">
                              <motion.button
                                custom={idx}
                                variants={gridItemStagger}
                                initial="hidden"
                                animate="visible"
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setActiveSubCategory((prev) => (prev === sub.id ? null : sub.id))}
                                className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer shadow-md ${
                                  isExpanded
                                    ? 'border-zariGold ring-2 ring-zariGold/60 shadow-zariGold/25 scale-[1.01]'
                                    : 'border-zariGold/30 hover:border-zariGold/60 hover:shadow-lg'
                                }`}
                              >
                                <Image
                                  src={sub.image}
                                  alt={sub.title}
                                  fill
                                  className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                                />

                                {/* Dark Gradient Overlay Scrim */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-3 flex flex-col justify-between">
                                  <div className="flex justify-end">
                                    <div className={`rounded-full p-1 border backdrop-blur-xs transition-transform duration-300 ${isExpanded ? 'bg-zariGold border-zariGold text-black rotate-180' : 'bg-black/40 border-white/30 text-white'}`}>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </div>
                                  </div>

                                  <div>
                                    <span className="font-serif italic text-xs text-amber-200 block mb-0.5">
                                      {sub.subtitle}
                                    </span>
                                    <h4 className="font-serif font-bold text-base text-white tracking-wide leading-tight">
                                      {sub.title}
                                    </h4>
                                    <span className="mt-1 inline-block rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono text-white uppercase tracking-wider">
                                      {sub.categories.length} STYLES
                                    </span>
                                  </div>
                                </div>
                              </motion.button>

                              {/* EXPANDABLE CATEGORY LIST UNDER SUB-CATEGORY */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.28, ease: silkEase }}
                                    className="overflow-hidden mt-2 p-2.5 rounded-xl bg-ivory border border-zariGold/35 shadow-md space-y-1"
                                  >
                                    {sub.categories.map((cat) => (
                                      <Link
                                        key={cat.id}
                                        href={getCategoryHref(cat)}
                                        onClick={handleCloseMenu}
                                        className="flex items-center justify-between p-1.5 rounded-lg text-xs font-sans font-medium text-inkNavy hover:bg-zariGold/15 hover:text-zariGold transition-colors"
                                      >
                                        <span className="truncate">{cat.name}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-zariGold shrink-0 ml-1" />
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* SECTION D: QUICK LINKS ROW (HORIZONTAL SCROLLABLE CHIP BAR) */}
                <motion.div variants={sectionFadeUp} className="space-y-2.5">
                  <span className="font-sans font-bold text-[11px] text-zariGold tracking-[0.25em] uppercase block border-b border-zariGold/20 pb-1">
                    Quick Jump Collections
                  </span>

                  <div className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar pt-1">
                    {QUICK_JUMP_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.id}
                          href={link.href}
                          onClick={handleCloseMenu}
                          className="shrink-0 snap-start flex items-center gap-2 rounded-full border border-zariGold/40 bg-ivory/90 hover:bg-zariGold hover:border-zariGold px-4 py-2 text-xs font-sans font-bold text-inkNavy hover:text-white shadow-xs transition-all duration-200 cursor-pointer group"
                        >
                          <Icon className="w-3.5 h-3.5 text-zariGold group-hover:text-white transition-colors" />
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className="rounded-full bg-zariGold/20 group-hover:bg-white/20 text-zariGold group-hover:text-white text-[9px] font-mono px-1.5 py-0.2 uppercase tracking-wider">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                {/* SECTION E: CUSTOMER CARE & SERVICES (FOOTER SECTION) */}
                <motion.div variants={sectionFadeUp} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-zariGold/20 pb-1.5">
                    <span className="font-sans font-bold text-[11px] text-zariGold tracking-[0.25em] uppercase">
                      Customer Care &amp; Services
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Support Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CUSTOMER_CARE_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={handleCloseMenu}
                          className="flex items-center justify-between p-3 rounded-xl border border-zariGold/20 bg-white/60 hover:bg-zariGold/10 hover:border-zariGold/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-zariGold/10 p-2 text-zariGold group-hover:bg-zariGold group-hover:text-white transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-sans font-bold text-inkNavy">{item.label}</p>
                              <p className="text-[10px] font-sans text-inkNavy/60">{item.subtitle}</p>
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zariGold opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>

                  {/* ACCOUNT STATUS CARD */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-inkNavy to-navy text-ivory border border-zariGold/40 shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-zariGold/20 p-2 text-zariGold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-serif font-bold text-ivory">
                          {isSignedIn ? (user?.name || user?.email || user?.phone || 'Valued Guest') : 'Customer Account'}
                        </p>
                        <p className="text-[10px] font-sans text-zariGold tracking-wider uppercase">
                          {isSignedIn ? 'Logged In' : 'Sign in for orders & rewards'}
                        </p>
                      </div>
                    </div>

                    {isSignedIn ? (
                      <Link
                        href="/account/orders"
                        onClick={handleCloseMenu}
                        className="px-3.5 py-1.5 rounded-full bg-zariGold text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-zariGoldDark transition-colors"
                      >
                        Orders
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleCloseMenu();
                          openAuthModal('google');
                        }}
                        className="px-3 py-1.5 rounded-full bg-zariGold text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-amber-500 shadow-sm transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* FOOTER BAR */}
            <div className="w-full px-5 sm:px-10 py-3 border-t border-zariGold/20 flex items-center justify-between shrink-0 bg-ivory text-[10.5px] font-sans text-inkNavy/60 z-20">
              <span>© 2026 THE GIRLS COLLECTIONS · LUXURY FASHION</span>
              <span className="hidden sm:inline">COUTURE &amp; FESTIVE WEAR</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenMenu;
