'use client';

import { useEffect, useRef } from 'react';
import { AuthenticateWithRedirectCallback, useAuth, useClerk } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { handleRedirectCallback } = useClerk();
  const redirectedRef = useRef(false);

  const completeAndRedirect = async () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('just_signed_in_google', 'true');
        if (data.isNewUser || !data.user?.name || data.user?.name === 'Google User') {
          sessionStorage.setItem('pending_new_google_user', 'true');
        }
      }
    } catch (e) {
      console.error('Failed to sync session on SSO callback:', e);
    } finally {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      completeAndRedirect();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let mounted = true;

    if (handleRedirectCallback) {
      handleRedirectCallback({
        signInForceRedirectUrl: '/',
        signUpForceRedirectUrl: '/',
        continueSignUpUrl: '/',
      })
        .then(() => {
          if (mounted) completeAndRedirect();
        })
        .catch((err) => {
          console.warn('SSO callback handle notice:', err);
          if (mounted) completeAndRedirect();
        });
    }

    // Fail-safe timer: guarantee redirect to home if stuck > 3 seconds
    const timer = setTimeout(() => {
      if (mounted) completeAndRedirect();
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [handleRedirectCallback]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white p-4 select-none">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <div className="text-center space-y-1">
        <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-white">
          Completing Sign-In…
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Finalising your Google session with The Girls Collection
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/"
        signInForceRedirectUrl="/"
        continueSignUpUrl="/"
      />
    </div>
  );
}

