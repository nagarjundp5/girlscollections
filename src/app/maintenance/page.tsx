import React from 'react';
import { Lock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1E3A] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white border border-[#EADFD6] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1E3A]">
            The Girls Collections
          </h1>
          <p className="text-xs text-[#6B6F85] font-medium">
            Women&apos;s &amp; Kids Ethnic Wear
          </p>
        </div>

        <div className="w-12 h-12 bg-[#FDF2F5] border border-[#F5D0DC] rounded-full flex items-center justify-center mx-auto text-[#D94F7E]">
          <Lock className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-serif font-semibold text-[#1A1E3A]">
            We&apos;ll be right back
          </h2>
          <p className="text-sm text-[#6B6F85] leading-relaxed">
            Our store is undergoing a quick scheduled update. Please check back shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
