'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] py-12 px-4 sm:px-6 lg:px-8">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
