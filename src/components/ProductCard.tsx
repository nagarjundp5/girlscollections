'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/shopData';
import { useShop } from '@/context/ShopContext';
import { LuxuryHeartButton } from '@/components/LuxuryHeartButton';
import { cl, clBlur } from '@/lib/cloudinary';
import { formatSizeLabel } from '@/lib/formatSizeLabel';

interface ProductCardProps {
  product: Product;
  priorityImage?: boolean;
  variant?: 'rail' | 'grid';
  archShape?: boolean;
  index?: number;
}

function formatCategoryLabel(cat?: string): string {
  if (!cat) return '';
  return cat
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priorityImage = false,
  variant = 'grid',
  archShape = false,
}) => {
  const { toggleWishlist, isInWishlist } = useShop();
  const [isHovered, setIsHovered] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const tagText = product.isNew ? 'NEW IN' : product.isSale ? 'SALE' : null;
  const isSaleTag = product.isSale && !product.isNew;
  
  const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
  const productAny = product as any;
  const normalizedSizes: Array<{ size: string; inStock: boolean }> = rawSizes.map((s: any) => {
    if (typeof s === 'string') {
      const inStock = productAny.stock_quantity ? (Number(productAny.stock_quantity[s]) > 0) : true;
      return { size: s, inStock };
    }
    return { size: s?.size || String(s), inStock: s?.inStock ?? true };
  });
  const availableSizes = normalizedSizes.filter((s) => s.inStock);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col bg-transparent overflow-hidden select-none p-0 transition-opacity duration-300 ${
        variant === 'rail' ? 'w-full h-full justify-between' : 'w-full h-full justify-between'
      }`}
    >
      {/* Borderless Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden block rounded-2xl bg-sand/20 shadow-xs group-hover:shadow-md transition-shadow duration-300">
        <Link
          href={`/shop/${product.slug}`}
          prefetch={false}
          className={`relative w-full h-full block overflow-hidden ${
            archShape ? 'arch-frame-sm arch-inner' : ''
          }`}
        >
          {/* Soft Animated Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {tagText && (
              <span
                className={`px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider shadow-xs border border-zariGold/30 block rounded-full ${
                  isSaleTag ? 'bg-oxblood text-white' : 'bg-gold-gradient text-white'
                }`}
              >
                {tagText}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-roseGold/90 text-white rounded-full shadow-2xs border border-roseGold/30 animate-pulse">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Heart Icon Button (Top-Right) */}
          <div className="absolute top-2 right-2 z-20">
            <LuxuryHeartButton
              isLiked={inWishlist}
              onToggle={handleWishlistClick}
              size="md"
            />
          </div>

          {/* Primary Image */}
          {product.images[0] ? (
            <>
              <Image
                src={cl(product.images[0], { w: 400, q: 'auto:good' })}
                alt={product.name}
                fill
                priority={priorityImage}
                placeholder="blur"
                blurDataURL={clBlur(product.images[0])}
                className={`object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                  isHovered && product.images[1] ? 'opacity-0' : 'opacity-100'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Hover Crossfade Image — only mount when hovered to save mobile payload */}
              {product.images[1] && isHovered && (
                <Image
                  src={cl(product.images[1], { w: 400, q: 'auto:good' })}
                  alt={`${product.name} hover view`}
                  fill
                  loading="lazy"
                  className={`object-cover object-top transition-opacity duration-300 ease-out ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[#F6E4E4]/40 flex flex-col items-center justify-center p-4 text-center text-[#1A1E3A]">
              <span className="text-xs font-medium text-[#6B6F85]">{formatCategoryLabel(product.category)}</span>
              <p className="text-sm font-sans font-semibold text-[#1A1E3A] mt-1">{product.name}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="pt-3 pb-1 flex flex-col text-left shrink-0">
        
        {/* Uniform Size Chips Row */}
        {availableSizes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {availableSizes.slice(0, 3).map((s) => (
              <span
                key={s.size}
                className="text-[11px] font-sans font-semibold text-[#1A1E3A]/80 bg-[#FBF8F4] border border-[#EADFD6] px-2 py-0.5 rounded-full transition-colors duration-200"
              >
                {formatSizeLabel(s.size)}
              </span>
            ))}
            {availableSizes.length > 3 && (
              <span className="text-[11px] font-sans text-[#6B6F85] font-semibold">
                +{availableSizes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-sans font-semibold text-[#1A1E3A] group-hover:text-[#D94F7E] transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="mt-1.5 flex items-baseline gap-2.5">
          <span className="text-base sm:text-[19px] font-sans font-extrabold text-zariGold font-tnum">
            {(product as any).has_different_prices ? 'From ' : ''}₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm font-sans text-inkNavy/40 line-through font-normal font-tnum">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
