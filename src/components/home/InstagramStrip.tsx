'use client';

import React from 'react';
import Image from 'next/image';

const UGC_IMAGES = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=600",
  "https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=600",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=600",
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=600",
];

export const InstagramStrip: React.FC = () => {
  return (
    <section className="py-16 bg-ivory text-navy border-t border-roseGold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-roseGold font-sans font-semibold">
          #TheGirlsCollection
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-navy mt-1">
          Tagged by Our Royal Patron Family
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-7xl mx-auto px-4 sm:px-8">
        {UGC_IMAGES.map((img, i) => (
          <a
            key={i}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square border border-roseGold/20 overflow-hidden block"
          >
            <Image
              src={img}
              alt={`Instagram feature ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </a>
        ))}
      </div>
    </section>
  );
};
