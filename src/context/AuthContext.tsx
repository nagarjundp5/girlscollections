'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/components/ToastContainer';
import { useSignIn, useClerk, useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/nextjs';
import { X, Loader2, Smartphone, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TermsAndConditionsBox from '@/components/TermsAndConditionsBox';
import { useCartStore } from '@/lib/cartStore';

interface User {
  id: string;
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  notificationsOptIn: boolean;
  termsAcceptedAt: string | null;
  authProvider: 'phone' | 'google';
  onboardingCompleted?: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  openAuthModal: (mode?: 'phone' | 'google') => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web Push Subscription Helper
export async function subscribeToWebPush(addToast: (msg: string, type: 'success' | 'error') => void) {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const rawKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!rawKey) return;
    const { urlBase64ToUint8Array } = await import('@/lib/vapid');
    const applicationServerKey = urlBase64ToUint8Array(rawKey);

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.toJSON().keys?.p256dh, auth: subscription.toJSON().keys?.auth },
        productId: null,
      }),
    });

    localStorage.setItem('push_alerts_subscribed', 'true');
    window.dispatchEvent(new Event('push-subscription-changed'));
    addToast('Subscribed to notifications!', 'success');
  } catch (err) {
    console.warn('Push subscription notice:', err);
  }
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const { signOut, setActive } = useClerk();
  const { signIn, isLoaded: clerkSignInLoaded } = useSignIn();
  const { isSignedIn: clerkIsSignedIn, isLoaded: clerkAuthLoaded } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();

  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const effectiveUser = user || (clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.primaryEmailAddress?.emailAddress || 'Customer',
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    emailVerified: true,
    phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
    phoneVerified: !!clerkUser.primaryPhoneNumber,
    authProvider: 'google' as const,
    notificationsOptIn: true,
    termsAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  } : null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Inline name step for new accounts without name
  const [nameStep, setNameStep] = useState(false);
  const [enteredName, setEnteredName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);

  // Merge Guest Bag on Login
  const mergeGuestBagOnLogin = useCallback(async () => {
    try {
      const currentItems = useCartStore.getState().items;
      if (!currentItems || currentItems.length === 0) return;

      const res = await fetch('/api/bag/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentItems }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          useCartStore.setState({ items: data.items });
        }
      }
    } catch (e) {
      console.error('Guest bag sync notice:', e);
    }
  }, []);

  // Fetch session on mount & sync
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        if (data.user && (!data.user.name || data.user.name === 'Valued Customer' || data.user.name === 'Google User')) {
          setNameStep(true);
          setModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (clerkAuthLoaded && clerkIsSignedIn && !user && isLoaded) {
      refreshUser();
    }
  }, [clerkAuthLoaded, clerkIsSignedIn, user, isLoaded, refreshUser]);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openAuthModal = (mode: 'phone' | 'google' = 'phone') => {
    setInlineError(null);
    setIsVerifying(false);
    setNameStep(false);
    setIsActionInProgress(false);
    setModalOpen(true);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
    setInlineError(null);
    setIsVerifying(false);
    setNameStep(false);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await signOut();
      setUser(null);
      addToast('Logged out successfully', 'success');
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
      addToast('Logged out', 'success');
    }
  };

  // Google OAuth via Clerk
  const handleGoogleLogin = async () => {
    if (isActionInProgress) return;
    setInlineError(null);
    setIsActionInProgress(true);

    if (clerkAuthLoaded && clerkIsSignedIn) {
      try {
        await refreshUser();
        await mergeGuestBagOnLogin();
        closeAuthModal();
        addToast('Welcome back! 👋', 'success');
      } catch {
        setInlineError('Failed to synchronize Google session. Please retry.');
      } finally {
        setIsActionInProgress(false);
      }
      return;
    }

    if (!clerkSignInLoaded || !signIn) {
      setInlineError('Authentication is loading, please retry in a moment.');
      setIsActionInProgress(false);
      return;
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: window.location.pathname || '/',
      });
    } catch (err: any) {
      console.error('Google OAuth failed:', err);
      setInlineError(err?.errors?.[0]?.message || 'Google sign-in could not be started.');
      setIsActionInProgress(false);
    }
  };

  // Handle verified phone from phone.email (Pure OTP auth, decoupled from Clerk)
  const processVerifiedPhoneEmail = useCallback(async (userJsonUrl: string) => {
    setIsVerifying(true);
    setInlineError(null);

    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_json_url: userJsonUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setInlineError(data.message || data.error || 'Phone verification failed.');
        setIsVerifying(false);
        return;
      }

      await refreshUser();
      await mergeGuestBagOnLogin();

      if (data.isNewUser || !data.onboarding_completed) {
        closeAuthModal();
        window.location.href = '/onboarding';
      } else {
        closeAuthModal();
        addToast('Welcome to The Girls Collections! ✨', 'success');
      }
    } catch (err: any) {
      console.error('Verification exception:', err);
      setInlineError('Network or server error during sign-in. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  }, [refreshUser, mergeGuestBagOnLogin, addToast]);

  // Start Phone OTP flow
  const startPhoneOTP = () => {
    if (isActionInProgress || isVerifying) return;
    setInlineError(null);
    setIsActionInProgress(true);

    const clientId = process.env.NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID || '19014171169408573674';
    const redirectUrl = `${window.location.origin}/phone-callback`;
    const authUrl = `https://auth.phone.email/log-in?client_id=${clientId}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    const w = 480;
    const h = 580;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    const popup = window.open(authUrl, 'phone_email_popup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);

    setTimeout(() => {
      setIsActionInProgress(false);
    }, 2500);

    if (!popup) {
      setInlineError('Popup blocked. Please allow popups for phone OTP verification.');
    }
  };

  // Listen for message from callback popup or window listener
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'PHONE_EMAIL_USER_JSON' && event.data.user_json_url) {
        processVerifiedPhoneEmail(event.data.user_json_url);
      } else if (event.data?.type === 'PHONE_EMAIL_VERIFIED' && event.data.accessToken) {
        processVerifiedPhoneEmail(`https://user.phone.email/user_${event.data.accessToken}.json`);
      }
    };

    window.addEventListener('message', handleMsg);

    // Global listener for phone.email script
    (window as any).phoneEmailListener = (userObj: any) => {
      if (userObj?.user_json_url) {
        processVerifiedPhoneEmail(userObj.user_json_url);
      }
    };

    return () => {
      window.removeEventListener('message', handleMsg);
    };
  }, [processVerifiedPhoneEmail]);

  // Handle single-field name completion
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredName.trim()) {
      setInlineError('Please enter your name.');
      return;
    }
    setIsSubmittingName(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: enteredName.trim() }),
      });
      if (res.ok) {
        await refreshUser();
        closeAuthModal();
        addToast('Profile updated! Welcome!', 'success');
      } else {
        setInlineError('Could not save your name. You can continue shopping.');
      }
    } catch {
      closeAuthModal();
    } finally {
      setIsSubmittingName(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user: effectiveUser, isSignedIn: !!effectiveUser, isLoaded, openAuthModal, closeAuthModal, logout, refreshUser }}>
      {children}
      {mounted && createPortal(
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              style={{ zIndex: 99999 }}
              className="fixed inset-0 flex sm:items-center sm:justify-center items-end bg-black/60 backdrop-blur-xs p-0 sm:p-4"
            >
              {/* Bottom sheet on mobile, centered dialog on desktop */}
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full sm:max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              >
                {/* Close Button */}
                {!isVerifying && (
                  <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full transition-all cursor-pointer z-50"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Banner / Header */}
                <div className="relative w-full h-36 sm:h-40 bg-gradient-to-br from-rose-950 via-zinc-900 to-black p-6 flex flex-col justify-end text-white select-none">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-300 font-bold">
                    The Girls Collections
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    {nameStep ? 'Almost Done' : 'Sign In / Register'}
                  </h2>
                  <p className="text-xs text-zinc-300">
                    {nameStep ? 'What should we call you?' : 'One account for order tracking, bag & rewards'}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Inline Error with Retry */}
                  {inlineError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-2 text-xs text-red-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{inlineError}</span>
                      </div>
                      <button
                        onClick={() => setInlineError(null)}
                        className="text-[11px] font-bold text-red-700 hover:underline shrink-0"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Verifying Spinner */}
                  {isVerifying ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                      <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                        Verifying credentials &amp; signing you in…
                      </p>
                    </div>
                  ) : nameStep ? (
                    /* Inline 1-field name step */
                    <form onSubmit={handleNameSubmit} className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 font-mono">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        autoFocus
                        required
                        value={enteredName}
                        onChange={(e) => setEnteredName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingName}
                        className="w-full min-h-[44px] bg-zinc-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmittingName ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue to Shop →'}
                      </button>
                    </form>
                  ) : (
                    /* Two Equal 44px+ Buttons */
                    <div className="space-y-3">
                      {/* Phone Login */}
                      <button
                        type="button"
                        onClick={startPhoneOTP}
                        disabled={isActionInProgress}
                        className="w-full min-h-[48px] bg-zinc-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                      >
                        <Smartphone className="w-4 h-4 text-white" />
                        <span>Continue with phone</span>
                      </button>

                      {/* Google Login */}
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isActionInProgress}
                        className="w-full min-h-[48px] bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue with Google</span>
                      </button>

                      <p className="text-[10px] text-zinc-400 text-center uppercase tracking-wider font-mono pt-1">
                        By continuing you accept our Terms &amp; Privacy Policy
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
}
