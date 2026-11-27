'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F4] flex flex-col items-center justify-center gap-4 text-[#1A1E3A] p-4 select-none">
      <Loader2 className="w-8 h-8 text-[#D94F7E] animate-spin" />
      <div className="text-center space-y-1">
        <h2 className="text-base font-serif font-semibold text-[#1A1E3A]">
          Completing sign-in…
        </h2>
        <p className="text-sm text-[#6B6F85] font-sans">
          Finalising your Google session with The Girls Collections
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
        continueSignUpUrl="/onboarding"
      />
    </div>
  );
}
