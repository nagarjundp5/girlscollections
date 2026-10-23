'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthSession } from '@/context/AuthContext';
import { X, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default function LoginIncentivePopup() {
  const { isSignedIn, isLoaded, openAuthModal } = useAuthSession();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [offerText, setOfferText] = useState('GET 10% OFF YOUR FIRST ORDER');
  const [isPushPromptOpen, setIsPushPromptOpen] = useState(false);
  const [phoneNum, setPhoneNum] = useState('');

  const isAllowedPage = pathname === '/' || pathname === '/shop';

  useEffect(() => { setMounted(true); }, []);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-close when user signs in
  useEffect(() => {
    if (isSignedIn && isOpen) setIsOpen(false);
  }, [isSignedIn, isOpen]);

  // Fetch active promo discount
  useEffect(() => {
    if (!isAllowedPage || isSignedIn) return;
    const fetchDiscount = async () => {
      try {
        const res = await fetch('/api/auth/signup-discount');
        if (res.ok) {
          const data = await res.json();
          if (data.type === 'percent') setOfferText(`GET ${data.value}% OFF YOUR FIRST ORDER`);
          else setOfferText(`GET ₹${(data.value / 100).toFixed(0)} OFF YOUR FIRST ORDER`);
        }
      } catch { /* ignore */ }
    };
    fetchDiscount();
  }, [pathname, isSignedIn, isAllowedPage]);

  // Detect if push notification prompt is open (avoid stacking popups)
  useEffect(() => {
    if (!isAllowedPage || isSignedIn) return;
    const checkPushPrompt = () => {
      const elements = document.getElementsByTagName('h4');
      let found = false;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent === 'Get Notified') { found = true; break; }
      }
      setIsPushPromptOpen(found);
    };
    checkPushPrompt();
    const timer = setTimeout(checkPushPrompt, 1000);
    return () => clearTimeout(timer);
  }, [isAllowedPage, isSignedIn]);

  // Frequency check & show trigger
  useEffect(() => {
    if (!isAllowedPage || !isLoaded || isSignedIn) return;

    // Check frequency capping (3 days) and session dismiss
    try {
      const dismissedUntil = localStorage.getItem('login_incentive_dismissed_until');
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;
      if (sessionStorage.getItem('login_incentive_dismissed') === 'true') return;
    } catch { /* fallback */ }

    let timer: NodeJS.Timeout;
    let shown = false;

    const showPopup = () => {
      if (shown || isPushPromptOpen) return;
      shown = true;
      setIsOpen(true);
      clearTimeout(timer);
    };

    // Show after 3.5s landing delay for guest visitors
    timer = setTimeout(showPopup, 3500);

    // Scroll depth trigger (sentinel on page scroll)
    let observer: IntersectionObserver | null = null;
    const targetEl = document.getElementById('hero-scene') || document.querySelector('main') || document.body;

    if (typeof IntersectionObserver !== 'undefined' && targetEl) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.7) {
              showPopup();
            }
          });
        },
        { threshold: [0, 0.7] }
      );
      observer.observe(targetEl);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [isAllowedPage, isLoaded, isSignedIn, isPushPromptOpen]);

  // Escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) handleDismiss(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('login_incentive_dismissed_until', String(Date.now() + THREE_DAYS_MS));
      sessionStorage.setItem('login_incentive_dismissed', 'true');
    } catch { /* ignore */ }
    setIsOpen(false);
  };

  const handleGoogleContinue = () => {
    handleDismiss();
    openAuthModal('google');
  };

  const handlePhoneContinue = () => {
    handleDismiss();
    openAuthModal('phone');
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNum.length === 10) {
      handleDismiss();
      openAuthModal('phone');
    }
  };

  return (
    <>
      {isOpen && (
        <style dangerouslySetInnerHTML={{
          __html: `div.fixed.bottom-24.left-4.right-4.md\\:left-1\\/2 { display: none !important; }`
        }} />
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleDismiss}
              style={{ zIndex: 99990 }}
              className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[420px] bg-zinc-950 border border-white/15 rounded-2xl flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh]"
              >
                {/* High-Visibility Top Right Close (X) Button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 text-white bg-black/75 hover:bg-black p-2 rounded-full border border-white/20 hover:border-white/50 shadow-xl transition-all cursor-pointer z-50 flex items-center justify-center"
                  aria-label="Close pop up"
                >
                  <X className="w-4 h-4 text-white stroke-[2.5]" />
                </button>

                {/* Top Banner Image (login.webp) */}
                <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-zinc-900 select-none">
                  <img
                    src="/signinnotification.webp"
                    alt="The Girls Collections Member Login"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
                  
                  {/* Floating Brand Badge */}
                  <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white font-mono">
                      Exclusive Perks
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="w-full p-6 sm:p-7 flex flex-col items-center text-center gap-5 -mt-4 relative z-10">
                  {/* Offer copy */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-blue-400 font-mono">
                      Welcome Reward
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-widest leading-tight">
                      {offerText}
                    </h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider leading-relaxed font-light">
                      Unlock instant member discount, restock priority &amp; early drop access.
                    </p>
                  </div>

                  {/* Action Overlay Controls */}
                  <div className="w-full space-y-3 pt-1">
                    {/* 1. Primary Blue Overlay Button - Google OAuth */}
                    <button
                      onClick={handleGoogleContinue}
                      className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3 cursor-pointer border border-blue-400/30"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative text-center py-0.5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <span className="relative bg-zinc-950 px-3 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
                        Or
                      </span>
                    </div>

                    {/* 2. Inline Phone Number Input Overlay Form */}
                    <form onSubmit={handlePhoneSubmit} className="w-full space-y-2">
                      <div className="relative flex items-center bg-white/5 border border-white/20 focus-within:border-blue-400 rounded-xl overflow-hidden backdrop-blur-md transition-colors">
                        <span className="px-3 py-3 text-xs font-mono text-zinc-400 font-bold bg-white/5 border-r border-white/10 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneNum}
                          onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit Phone"
                          className="w-full bg-transparent px-3 py-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={phoneNum.length !== 10}
                          className="mr-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          OTP
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 3. Direct Phone Sign-In Trigger Overlay Button */}
                      <button
                        type="button"
                        onClick={handlePhoneContinue}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/15 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
                      >
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        Sign In with Phone Number
                      </button>
                    </form>
                  </div>

                  <p className="text-center text-[9px] text-zinc-500 uppercase tracking-widest font-mono leading-relaxed">
                    By continuing you agree to our{' '}
                    <a href="/policies/terms-and-conditions" target="_blank" className="text-zinc-400 underline hover:text-white">Terms</a>
                    {' '}&amp;{' '}
                    <a href="/policies/privacy-policy" target="_blank" className="text-zinc-400 underline hover:text-white">Privacy Policy</a>
                  </p>

                  {/* Explicit Close Button at Bottom */}
                  <button
                    onClick={handleDismiss}
                    className="w-full py-2.5 text-center text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest font-mono transition-colors cursor-pointer border-t border-white/10 mt-1 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Close &amp; Continue Browsing
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}


