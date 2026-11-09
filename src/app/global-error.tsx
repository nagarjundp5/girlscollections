'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FDFBF7] text-[#1E293B] min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Error</h2>
          <p className="text-xs text-gray-500 mb-6">
            A critical error occurred. Please refresh the page or return to the storefront.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-black"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

