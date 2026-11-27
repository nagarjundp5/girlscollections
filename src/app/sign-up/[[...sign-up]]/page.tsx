'use client';

import React, { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { PushConsentCheckbox } from '@/components/PushConsentCheckbox';

export default function SignUpPage() {
  const [pushOptIn, setPushOptIn] = useState(true);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('button');
    if (btn && typeof window !== 'undefined') {
      try {
        localStorage.setItem('tgc_push_consent', pushOptIn ? '1' : '0');
      } catch {}
    }
  };

  return (
    <div
      onClickCapture={handleContainerClick}
      className="flex min-h-screen flex-col items-center justify-center bg-[#FBF8F4] py-12 px-4 sm:px-6 lg:px-8 gap-4"
    >
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
      <div className="w-full max-w-[400px]">
        <PushConsentCheckbox checked={pushOptIn} onChange={setPushOptIn} />
      </div>
    </div>
  );
}
