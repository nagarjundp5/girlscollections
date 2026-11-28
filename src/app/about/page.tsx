import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About The Girls Collections',
  description: "Learn about The Girls Collections — curated women's and kids ethnic wear from Bengaluru.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#1A1E3A] min-h-screen py-14 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1E3A]">
            About The Girls Collections
          </h1>
          <p className="text-base text-[#6B6F85] max-w-2xl mx-auto">
            Handcrafted women&apos;s and kids ethnic wear curated with love in Bengaluru.
          </p>
        </div>

        <div className="bg-white border border-[#EADFD6] rounded-2xl p-6 sm:p-10 shadow-sm space-y-5 text-base leading-relaxed text-[#1A1E3A]">
          <p>
            The Girls Collections brings together timeless Indian craftsmanship and everyday comfort—from
            festive silk pattu frocks for little ones to graceful kurtas, co-ord sets, sarees, and lehengas for women.
          </p>
          <p>
            Every piece is selected for breathable fabrics, neat finishing, and joyful silhouettes you can wear
            with confidence at celebrations, family gatherings, and everyday moments.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 rounded-xl bg-[#D94F7E] hover:bg-[#C23F6D] text-white text-sm font-semibold transition-colors"
            >
              Explore the collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
