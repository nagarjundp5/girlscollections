'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WOMEN_BUCKETS, KIDS_BUCKETS, getCategoryHref } from '@/data/categoryTaxonomy';

interface MegaMenuProps {
  activeCategory: string | null;
  onClose: () => void;
}

export const DesktopMegaMenu: React.FC<MegaMenuProps> = ({ activeCategory, onClose }) => {
  if (!activeCategory) return null;

  const renderContent = () => {
    if (activeCategory === 'women') {
      return (
        <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 px-8 py-6">
          {WOMEN_BUCKETS.map((bucket, index) => (
            <div
              key={bucket.id}
              className={`space-y-3 border-r border-sand/80 pr-6 ${
                index === 0 ? 'col-span-3' : index === 1 ? 'col-span-2' : index === 2 ? 'col-span-2' : 'col-span-2'
              }`}
            >
              <div className="space-y-1">
                <span className="eyebrow-text text-[10px] text-zariGold uppercase tracking-widest">
                  {bucket.slug === 'plus-size' ? 'Attribute' : 'Occasion'}
                </span>
                <h4 className="text-base font-serif font-semibold text-inkNavy">{bucket.title}</h4>
                <div className="w-8 h-[1.5px] bg-gold-gradient rounded-full" />
              </div>
              <ul className="space-y-0.5 pt-1">
                {bucket.items.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={getCategoryHref(sub)}
                      onClick={onClose}
                      className="group flex items-center justify-between py-1.5 text-xs sm:text-sm font-sans font-medium text-inkNavy/85 hover:text-zariGold transition-colors"
                    >
                      <span>{sub.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zariGold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: Editorial Lookbook Card */}
          <div className="col-span-3 pl-2 flex flex-col justify-between">
            <div className="relative h-60 w-full rounded-[2px] overflow-hidden group bg-sand/50 shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=600"
                alt="Women Royal Edit"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/30 to-transparent p-5 flex flex-col justify-end">
                <span className="eyebrow-text text-zariGoldLight mb-1 text-[10px]">Editorial Lookbook</span>
                <p className="text-base font-serif font-semibold text-ivory leading-snug">
                  The Royal Heritage Pallu Edit
                </p>
                <p className="text-[11px] text-ivory/75 font-sans mt-1">
                  Intricate zari weaves &amp; festive ensembles.
                </p>
              </div>
            </div>
            <Link
              href="/shop?target=women"
              onClick={onClose}
              className="mt-3 text-center py-2.5 rounded-[2px] btn-gold-gradient text-[11px] uppercase tracking-[0.2em] font-semibold"
            >
              Explore Women Collection
            </Link>
          </div>
        </div>
      );
    }

    if (activeCategory === 'kids') {
      return (
        <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 px-8 py-6">
          {/* Column 1: Ethnic Wear */}
          <div className="col-span-3 space-y-3 border-r border-sand/80 pr-6">
            <div className="space-y-1">
              <span className="eyebrow-text text-[10px] text-zariGold uppercase tracking-widest">Occasion</span>
              <h4 className="text-base font-serif font-semibold text-inkNavy">{KIDS_BUCKETS[0].title}</h4>
              <div className="w-8 h-[1.5px] bg-gold-gradient rounded-full" />
            </div>
            <ul className="space-y-0.5 pt-1">
              {KIDS_BUCKETS[0].items.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={getCategoryHref(sub)}
                    onClick={onClose}
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm font-sans font-medium text-inkNavy/85 hover:text-zariGold transition-colors"
                  >
                    <span>{sub.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zariGold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Party Wear */}
          <div className="col-span-2 space-y-3 border-r border-sand/80 pr-6">
            <div className="space-y-1">
              <span className="eyebrow-text text-[10px] text-zariGold uppercase tracking-widest">Occasion</span>
              <h4 className="text-base font-serif font-semibold text-inkNavy">{KIDS_BUCKETS[1].title}</h4>
              <div className="w-8 h-[1.5px] bg-gold-gradient rounded-full" />
            </div>
            <ul className="space-y-0.5 pt-1">
              {KIDS_BUCKETS[1].items.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={getCategoryHref(sub)}
                    onClick={onClose}
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm font-sans font-medium text-inkNavy/85 hover:text-zariGold transition-colors"
                  >
                    <span>{sub.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zariGold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Casual / Western */}
          <div className="col-span-4 space-y-3 border-r border-sand/80 pr-6">
            <div className="space-y-1">
              <span className="eyebrow-text text-[10px] text-zariGold uppercase tracking-widest">Occasion</span>
              <h4 className="text-base font-serif font-semibold text-inkNavy">{KIDS_BUCKETS[2].title}</h4>
              <div className="w-8 h-[1.5px] bg-gold-gradient rounded-full" />
            </div>
            <ul className="space-y-0.5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {KIDS_BUCKETS[2].items.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={getCategoryHref(sub)}
                    onClick={onClose}
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm font-sans font-medium text-inkNavy/85 hover:text-zariGold transition-colors"
                  >
                    <span>{sub.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zariGold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Kids Lookbook */}
          <div className="col-span-3 pl-2 flex flex-col justify-between">
            <div className="relative h-60 w-full rounded-[2px] overflow-hidden group bg-sand/50 shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800"
                alt="Kids Pattu Frocks"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nearBlack/85 via-nearBlack/30 to-transparent p-5 flex flex-col justify-end">
                <span className="eyebrow-text text-zariGoldLight mb-1 text-[10px]">Signature Craft</span>
                <p className="text-base font-serif font-semibold text-ivory leading-snug">
                  Pure Kanjeevaram Silk Pattu Frocks
                </p>
                <p className="text-[11px] text-ivory/75 font-sans mt-1">
                  Gentle non-scratchy pure cotton lining for delicate skin.
                </p>
              </div>
            </div>
            <Link
              href="/shop?target=kids"
              onClick={onClose}
              className="mt-3 text-center py-2.5 rounded-[2px] btn-gold-gradient text-[11px] uppercase tracking-[0.2em] font-semibold"
            >
              Explore Kids Collection
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-ivory border-b border-zariGold/20 shadow-[0_20px_50px_rgba(28,31,59,0.12)] z-[60] text-inkNavy"
    >
      {renderContent()}
    </div>
  );
};

export const MobileMegaMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedMain, setSelectedMain] = React.useState<'women' | 'kids' | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[75] bg-nearBlack/70 backdrop-blur-xs"
          />

          {/* Full-Screen Drawer Navigation */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 left-0 w-full max-w-[380px] z-[80] bg-inkNavy text-ivory flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-zariGold/20 flex items-center justify-between bg-inkNavy shrink-0">
              {selectedMain ? (
                <button
                  onClick={() => setSelectedMain(null)}
                  className="flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-zariGold hover:text-ivory transition-colors min-h-[48px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              ) : (
                <span className="eyebrow-text text-zariGold">
                  THE GIRLS COLLECTIONS
                </span>
              )}

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-zariGold hover:text-inkNavy text-ivory flex items-center justify-center transition-all focus:outline-none"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {!selectedMain ? (
                <div className="space-y-4">
                  <span className="eyebrow-text text-zariGoldLight">COLLECTIONS</span>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setSelectedMain('women')}
                      className="w-full py-4 border-b border-zariGold/15 flex items-center justify-between text-left group min-h-[48px]"
                    >
                      <span className="text-2xl font-serif font-bold text-ivory group-hover:text-zariGold transition-colors">
                        Ladies Wear
                      </span>
                      <ChevronRight className="w-5 h-5 text-zariGold" />
                    </button>

                    <button
                      onClick={() => setSelectedMain('kids')}
                      className="w-full py-4 border-b border-zariGold/15 flex items-center justify-between text-left group min-h-[48px]"
                    >
                      <span className="text-2xl font-serif font-bold text-ivory group-hover:text-zariGold transition-colors">
                        Kids Wear
                      </span>
                      <ChevronRight className="w-5 h-5 text-zariGold" />
                    </button>

                    <Link
                      href="/shop?isNew=true"
                      onClick={onClose}
                      className="block py-4 border-b border-zariGold/15 text-2xl font-serif font-bold text-ivory hover:text-zariGold transition-colors min-h-[48px]"
                    >
                      New Arrivals
                    </Link>

                    <Link
                      href="/shop?occasion=Festive"
                      onClick={onClose}
                      className="block py-4 border-b border-zariGold/15 text-2xl font-serif font-bold text-ivory hover:text-zariGold transition-colors min-h-[48px]"
                    >
                      Festive Edit
                    </Link>

                    <Link
                      href="/shop?isSale=true"
                      onClick={onClose}
                      className="block py-4 border-b border-zariGold/15 text-2xl font-serif font-bold text-oxblood hover:text-zariGold transition-colors min-h-[48px]"
                    >
                      Sale Spotlight
                    </Link>
                  </div>
                </div>
              ) : selectedMain === 'women' ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-ivory">Ladies Collection</h3>
                  {WOMEN_BUCKETS.map((bucket) => (
                    <div key={bucket.id} className="space-y-2">
                      <span className="eyebrow-text text-zariGold">{bucket.title}</span>
                      <div className="space-y-1 pl-2">
                        {bucket.items.map((sub) => (
                          <Link
                            key={sub.id}
                            href={getCategoryHref(sub)}
                            onClick={onClose}
                            className="block py-2.5 text-base font-serif text-ivory/90 hover:text-zariGold border-b border-zariGold/10 min-h-[44px]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-ivory">Kids Collection</h3>
                  {KIDS_BUCKETS.map((bucket) => (
                    <div key={bucket.id} className="space-y-2">
                      <span className="eyebrow-text text-zariGold">{bucket.title}</span>
                      <div className="space-y-1 pl-2">
                        {bucket.items.map((sub) => (
                          <Link
                            key={sub.id}
                            href={getCategoryHref(sub)}
                            onClick={onClose}
                            className="block py-2.5 text-base font-serif text-ivory/90 hover:text-zariGold border-b border-zariGold/10 min-h-[44px]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
