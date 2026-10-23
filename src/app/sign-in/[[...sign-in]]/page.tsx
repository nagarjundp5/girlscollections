'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] py-12 px-4 sm:px-6 lg:px-8">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
