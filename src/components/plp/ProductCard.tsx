import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Process images: up to 5 images for the mini carousel
  const productImages = (Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : []
  ).filter((img) => typeof img === 'string' && img.trim() !== '').slice(0, 5);

  const primaryImgRaw = productImages[0] || '';
  const hasMultipleImages = productImages.length > 1;

  // Cloudinary responsive srcset for primary image (w_400 mobile budget)
  const primarySrc = primaryImgRaw ? cl(primaryImgRaw, { w: 400, ar: '2:3', c: 'fill', g: 'auto' }) : '';
  const primarySrcset = primaryImgRaw
    ? `${cl(primaryImgRaw, { w: 320, ar: '2:3', c: 'fill', g: 'auto' })} 320w, ` +
      `${cl(primaryImgRaw, { w: 400, ar: '2:3', c: 'fill', g: 'auto' })} 400w, ` +
      `${cl(primaryImgRaw, { w: 540, ar: '2:3', c: 'fill', g: 'auto' })} 540w, ` +
      `${cl(primaryImgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' })} 720w`
    : undefined;

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
    .map((s: any) => (typeof s === 'object' ? s.price : undefined))
    .filter((p): p is number => typeof p === 'number' && p > 0);
  const isMultiPrice = new Set(pricesAcrossSizes).size > 1;

  const showNewBadge = product.isNew;

  return (
    <div
      data-product-card
      data-card-id={product.id}
      style={{
        contentVisibility: isBelowFold ? 'auto' : undefined,
        containIntrinsicSize: isBelowFold ? '0 540px' : undefined,
      }}
      className="group relative flex flex-col w-full bg-transparent p-0 m-0 border-0 rounded-none shadow-none select-none"
    >
      {/* Clickable Image Area with Mini Carousel */}
      <div className="relative block w-full aspect-[2/3] overflow-hidden bg-[#F3EFEA]">
        {hasMultipleImages ? (
          /* CSS Scroll-Snap Mini Carousel */
          <div
            data-carousel-container
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar select-none"
            style={{
              scrollSnapType: 'x mandatory',
              touchAction: 'pan-y pinch-zoom',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {productImages.map((imgRaw, imgIdx) => {
              const src = cl(imgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' });
              const srcset =
                `${cl(imgRaw, { w: 360, ar: '2:3', c: 'fill', g: 'auto' })} 360w, ` +
                `${cl(imgRaw, { w: 540, ar: '2:3', c: 'fill', g: 'auto' })} 540w, ` +
                `${cl(imgRaw, { w: 720, ar: '2:3', c: 'fill', g: 'auto' })} 720w`;

              return (
                <div
                  key={imgIdx}
                  className="w-full h-full shrink-0 snap-start snap-always relative"
                >
                  <Link
                    href={`/shop/${product.slug}`}
                    className="block w-full h-full relative"
                    prefetch={index < 4}
                  >
                    <img
                      src={src}
                      srcSet={srcset}
                      sizes="(max-width: 768px) 50vw, (max-width: 1440px) 25vw, 360px"
                      alt={`${product.name} - View ${imgIdx + 1}`}
                      loading={imgIdx === 0 && isEager ? 'eager' : 'lazy'}
                      decoding={imgIdx === 0 && isEager ? 'sync' : 'async'}
                      style={{
                        backgroundImage:
                          imgIdx === 0 && blurPlaceholder ? `url(${blurPlaceholder})` : undefined,
                        backgroundSize: 'cover',
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out sm:group-hover:scale-[1.02]"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : primarySrc ? (
          /* Single Image */
          <Link
            href={`/shop/${product.slug}`}
            className="block w-full h-full relative"
            prefetch={index < 4}
          >
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
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F3EFEA] text-neutral-400 font-sans text-xs">
            No Image
          </div>
        )}

        {/* Carousel Prev & Next Buttons (Round 32px mobile / 36px desktop with 44px touch area) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              data-carousel-action="prev"
              aria-label="Previous image"
              style={{ display: 'none' }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-[#1C1417] border border-[#EFE7E2] shadow-sm items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer after:absolute after:-inset-1.5"
            >
              <ChevronLeft className="w-4 h-4 text-[#1C1417]" />
            </button>

            <button
              type="button"
              data-carousel-action="next"
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-[#1C1417] border border-[#EFE7E2] shadow-sm flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer after:absolute after:-inset-1.5"
            >
              <ChevronRight className="w-4 h-4 text-[#1C1417]" />
            </button>

            {/* Dots Indicator Above the Size Row */}
            <div
              data-carousel-dots
              className="absolute bottom-9 inset-x-0 z-20 flex justify-center items-center gap-1 pointer-events-none"
            >
              {productImages.map((_, i) => (
                <span
                  key={i}
                  data-dot-index={i}
                  className={`h-1 rounded-full transition-all ${
                    i === 0 ? 'w-2.5 bg-white shadow-xs' : 'w-1 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top-Left: "New In" Tag (black background, white text 11px/500, square corners, fully visible) */}
        {showNewBadge && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-[11px] font-medium font-sans uppercase tracking-[0.06em] px-2 py-1 leading-none pointer-events-none">
            New In
          </div>
        )}

        {/* Top-Right: Wishlist Heart (Client Island) */}
        <WishlistHeartIsland productId={product.id} />

        {/* Bottom of Image: Sizes Row (Mobile persistent, Desktop slide-up hover) */}
        <div className="absolute bottom-0 inset-x-0 z-10 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-200 ease-out">
          <SizeBoxesIsland slug={product.slug} sizes={formattedSizes} />
        </div>
      </div>

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
