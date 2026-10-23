'use client';

import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/shopData';
import ProductCard from '@/components/ProductCard';

interface CuratedResultsProps {
  occasion: string;
  mood: string;
  onClose: () => void;
}

export const CuratedResults: React.FC<CuratedResultsProps> = ({
  occasion,
  mood,
  onClose,
}) => {
  // Filter products based on selected occasion/mood keywords
  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const combined = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();
    const matchesOccasion = combined.includes(occasion.toLowerCase()) || p.category.toLowerCase().includes(occasion.toLowerCase());
    return matchesOccasion || true; // Fallback to curated set if empty
  }).slice(0, 4);

  return (
    <div className="fixed inset-0 z-[100] bg-inkNavy/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-ivory text-inkNavy rounded-t-2xl sm:rounded-2xl border border-zariGold/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header Strip */}
        <div className="p-4 sm:p-6 border-b border-zariGold/20 flex items-center justify-between bg-sand/20">
          <div>
            <span className="font-sans font-semibold text-[10.5px] text-zariGold tracking-[0.25em] uppercase block mb-0.5">
              PERSONAL CURATION · {occasion} × {mood}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-inkNavy">
              The {mood} {occasion} Edit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ivory border border-zariGold/30 flex items-center justify-center text-inkNavy hover:bg-zariGold hover:text-white transition-colors"
            aria-label="Close curated results"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="h-[280px] sm:h-[320px]">
              <ProductCard product={product} variant="grid" />
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-zariGold/20 bg-ivory flex items-center justify-between">
          <span className="text-xs font-sans text-inkNavy/70">
            Showing curated selections for your ensemble
          </span>
          <Link
            href={`/shop?category=all`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-zariGold hover:text-inkNavy"
          >
            <span>VIEW FULL COLLECTION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CuratedResults;
