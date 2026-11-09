'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function PhoneCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { setActive } = useClerk();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // 15-second safety timeout so user never spins forever
    const safetyTimer = setTimeout(() => {
      if (status === 'verifying') {
        setStatus('error');
        setErrorMessage('Verification took longer than expected. Please try again.');
      }
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [status]);

  useEffect(() => {
    if (hasTriggeredRef.current || !signInLoaded) return;

    const user_json_url = searchParams.get('user_json_url') || searchParams.get('auth_user_json_url');
    const access_token = searchParams.get('access_token');
    const returnTo = sessionStorage.getItem('tgc_auth_return_to') || '/';

    // Resolved URL
    const resolvedUrl = user_json_url || (access_token ? `https://user.phone.email/user_${access_token}.json` : null);

    if (!resolvedUrl && !access_token) {
      setStatus('error');
      setErrorMessage('No verification credential received. Please try logging in again.');
      return;
    }

    // Immediately clean up sensitive query parameters from browser URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/phone-callback');
    }

    // Check if this was a popup flow (e.g. Google user linking phone at checkout)
    const flowOrigin = typeof window !== 'undefined' ? sessionStorage.getItem('auth_flow_origin') : null;

    if (window.opener && flowOrigin === 'checkout') {
      try {
        window.opener.postMessage(
          {
            type: 'PHONE_EMAIL_USER_JSON',
            user_json_url: resolvedUrl,
            access_token,
          },
          window.location.origin
        );
        window.close();
        return;
      } catch (e) {
        console.error('Failed to postMessage to opener:', e);
      }
    }

    // Direct in-tab login exchange
    hasTriggeredRef.current = true;

    async function executeLoginExchange() {
      try {
        const res = await fetch('/api/auth/phone-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_json_url: resolvedUrl,
            access_token,
            returnTo,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete login');
        }

        if (!signIn) {
          throw new Error('Authentication client is not available');
        }

        // Exchange ticket token for session via Clerk ticket strategy
        const ticketResult = await signIn.create({
          strategy: 'ticket',
          ticket: data.token,
        });

        if (ticketResult.status !== 'complete') {
          throw new Error('Could not finalize session. Please retry.');
        }

        await setActive({ session: ticketResult.createdSessionId });
        setStatus('success');

        // Redirect based on onboarding status
        if (!data.onboarding_completed) {
          router.replace('/onboarding');
        } else {
          router.replace(data.returnTo || '/');
        }
      } catch (err: any) {
        console.error('Phone login callback failed:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Login failed. Please retry.');
      }
    }

    executeLoginExchange();
  }, [searchParams, signInLoaded, signIn, setActive, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-lg">
        {status === 'verifying' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#0F172A] animate-spin" />
            <h2 className="text-base font-serif font-bold text-[#0F172A]">Connecting Verified Account…</h2>
            <p className="text-xs text-gray-500">Please wait while we complete your secure login.</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <h2 className="text-base font-serif font-bold text-[#0F172A]">Authenticated!</h2>
            <p className="text-xs text-gray-500">Redirecting you to your account…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-serif font-bold text-[#0F172A]">Verification Issue</h2>
            <p className="text-xs text-red-600 leading-relaxed">{errorMessage}</p>
            <div className="flex flex-col gap-2 w-full pt-2">
              <button
                onClick={() => {
                  hasTriggeredRef.current = false;
                  window.location.href = '/sign-in';
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PhoneCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0F172A] animate-spin" />
        </div>
      }
    >
      <PhoneCallbackContent />
    </Suspense>
  );
}
