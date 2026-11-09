import React from 'react';
import Link from 'next/link';
import { Product } from '@/data/shopData';
import { cl } from '@/lib/cloudinary';
import { formatCardSize, FormattedCardSize } from '@/lib/size-display';
import { WishlistHeartIsland } from './WishlistHeartIsland';
import { SizeBoxesIsland } from './SizeBoxesIsland';

interface ProductCardProps {
  product: Product;
  index: number;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  priority = false,
}) => {
  const isEager = priority || index < 4;
  const isBelowFold = index >= 8;

  // Process images
  const primaryImgRaw = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : '';
  const secondaryImgRaw = Array.isArray(product.images) && product.images.length > 1
    ? product.images[1]
    : '';

  // Cloudinary responsive srcset for primary image
  const primarySrc = primaryImgRaw ? cl(primaryImgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' }) : '';
  const primarySrcset = primaryImgRaw
    ? `${cl(primaryImgRaw, { w: 360, ar: '2:3', c: 'fill', g: 'auto' })} 360w, ` +
      `${cl(primaryImgRaw, { w: 540, ar: '2:3', c: 'fill', g: 'auto' })} 540w, ` +
      `${cl(primaryImgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' })} 720w, ` +
      `${cl(primaryImgRaw, { w: 960, ar: '2:3', c: 'fill', g: 'auto' })} 960w`
    : undefined;

  // Secondary image (for desktop hover swap)
  const secondarySrc = secondaryImgRaw
    ? cl(secondaryImgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' })
    : '';

  // Blur placeholder
  const blurPlaceholder = primaryImgRaw
    ? cl(primaryImgRaw, { w: 24, blur: 200, ar: '2:3', c: 'fill' })
    : undefined;

  // Normalize sizes
  const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
  const formattedSizes: FormattedCardSize[] = rawSizes.map((s) =>
    formatCardSize(s, product.target)
  );

  // Price calculations
  const price = product.price;
  const originalPrice = product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Check if multiple prices exist across sizes
  const pricesAcrossSizes = rawSizes
    .map((s: any) => typeof s === 'object' ? s.price : undefined)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  const isMultiPrice = new Set(pricesAcrossSizes).size > 1;

  const showNewBadge = product.isNew;

  return (
    <div
      style={{
        contentVisibility: isBelowFold ? 'auto' : undefined,
        containIntrinsicSize: isBelowFold ? '0 540px' : undefined,
      }}
      className="group relative flex flex-col w-full bg-transparent p-0 m-0 border-0 rounded-none shadow-none select-none"
    >
      {/* Clickable Image Container */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block w-full aspect-[2/3] overflow-hidden bg-[#F3EFEA]"
        prefetch={index < 4}
      >
        {/* Primary Image */}
        {primarySrc ? (
          <img
            src={primarySrc}
            srcSet={primarySrcset}
            sizes="(max-width: 768px) 50vw, (max-width: 1440px) 25vw, 360px"
            alt={product.name}
            loading={isEager ? 'eager' : 'lazy'}
            decoding={isEager ? 'sync' : 'async'}
            style={{
              backgroundImage: blurPlaceholder ? `url(${blurPlaceholder})` : undefined,
              backgroundSize: 'cover',
            }}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out sm:group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F3EFEA] text-neutral-400 font-sans text-xs">
            No Image
          </div>
        )}

        {/* Secondary Image (Desktop Hover Swap) */}
        {secondarySrc && (
          <img
            src={secondarySrc}
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            className="hidden sm:block absolute inset-0 w-full h-full object-cover object-top opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          />
        )}

        {/* Top-Left: "New In" Tag (black background, white text 11px/500, square corners, fully visible) */}
        {showNewBadge && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-[11px] font-medium font-sans uppercase tracking-[0.06em] px-2 py-1 leading-none">
            New In
          </div>
        )}

        {/* Top-Right: Wishlist Heart (Client Island) */}
        <WishlistHeartIsland productId={product.id} />

        {/* Bottom of Image: Sizes Row (Mobile persistent, Desktop slide-up hover) */}
        <div className="absolute bottom-0 inset-x-0 z-10 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-200 ease-out">
          <SizeBoxesIsland slug={product.slug} sizes={formattedSizes} />
        </div>
      </Link>

      {/* Text Info Under the Image (Left aligned, 12px top padding, 8px sides) */}
      <Link
        href={`/shop/${product.slug}`}
        className="block pt-3 px-2 pb-2 text-left"
        prefetch={index < 4}
      >
        {/* Product Title: UPPERCASE 13px (14px desktop), weight 400, dark #1C1417, 1 line with ellipsis */}
        <h3 className="font-sans text-[13px] sm:text-[14px] font-normal uppercase tracking-[0.03em] text-[#1C1417] truncate leading-snug">
          {product.name}
        </h3>

        {/* Price Row: bold 15px dark, MRP struck grey, discount % in sale colour */}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="font-sans text-[15px] font-bold text-[#1C1417] leading-none">
            {isMultiPrice ? 'From ' : ''}₹{price.toLocaleString('en-IN')}
          </span>

          {hasDiscount && (
            <>
              <span className="font-sans text-[13px] text-neutral-400 line-through font-normal leading-none">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-[12px] font-semibold text-[#B91C1C] leading-none">
                ({discountPercent}% OFF)
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};

