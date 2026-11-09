'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

interface WishlistHeartIslandProps {
  productId: string;
}

export const WishlistHeartIsland: React.FC<WishlistHeartIslandProps> = ({ productId }) => {
  const { toggleWishlist, isInWishlist } = useShop();
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      className="absolute top-2.5 right-2.5 z-20 w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-white/95 hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#1C1417] transition-transform duration-150 active:scale-90 hover:scale-105 cursor-pointer focus:outline-none"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          inWishlist
            ? 'fill-[#D94F5C] text-[#D94F5C]'
            : 'text-[#1C1417] stroke-[1.75]'
        }`}
      />
    </button>
  );
};

