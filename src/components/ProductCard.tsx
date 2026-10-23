'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/shopData';
import { useShop } from '@/context/ShopContext';
import { LuxuryHeartButton } from '@/components/LuxuryHeartButton';

interface ProductCardProps {
  product: Product;
  priorityImage?: boolean;
  variant?: 'rail' | 'grid';
  archShape?: boolean;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priorityImage = false,
  variant = 'grid',
  archShape = false,
  index = 0,
}) => {
  const { toggleWishlist, isInWishlist } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const inWishlist = isInWishlist(product.id);

  // Viewport entrance stagger-fade animation (fires ONCE to prevent scroll-jitter)
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.08, rootMargin: '50px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
  const availableSizes = product.sizes?.filter((s) => s.inStock) || [];
  const staggerDelay = (index % 6) * 50;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${staggerDelay}ms, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${staggerDelay}ms`,
      }}
      className={`group relative flex flex-col bg-transparent overflow-hidden select-none p-0 transition-all duration-300 ${
        variant === 'rail' ? 'w-full h-full justify-between' : 'w-full h-full justify-between'
      }`}
    >
      {/* Borderless Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden block rounded-2xl bg-sand/20 shadow-xs group-hover:shadow-md transition-shadow duration-300">
        <Link
          href={`/shop/${product.slug}`}
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
                src={product.images[0]}
                alt={product.name}
                fill
                priority={priorityImage}
                className={`object-cover transition-transform duration-[5000ms] cubic-bezier(0.25,0.46,0.45,0.94) ease-out group-hover:scale-[1.05] ${
                  isHovered && product.images[1] ? 'opacity-0' : 'opacity-100'
                }`}
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
              />

              {/* Hover Crossfade Image */}
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt={`${product.name} hover view`}
                  fill
                  className={`object-cover transition-all duration-[5000ms] cubic-bezier(0.25,0.46,0.45,0.94) ease-out group-hover:scale-[1.05] ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-navy-silk flex flex-col items-center justify-center p-4 text-center text-ivory">
              <span className="eyebrow-text text-zariGoldLight text-[11px]">{product.category}</span>
              <p className="text-sm font-sans font-medium text-ivory mt-1">{product.name}</p>
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
                className="text-[10px] sm:text-[11px] font-sans font-semibold text-inkNavy/80 bg-sand/20 border border-zariGold/35 hover:border-zariGold hover:text-zariGold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors duration-200"
              >
                {s.size}
              </span>
            ))}
            {availableSizes.length > 3 && (
              <span className="text-[10px] sm:text-[11px] font-sans text-zariGold font-bold">
                +{availableSizes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-serif font-medium text-inkNavy group-hover:text-zariGold tracking-[-0.015em] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="mt-1.5 flex items-baseline gap-2.5">
          <span className="text-base sm:text-[19px] font-sans font-extrabold text-zariGold font-tnum">
            ₹{product.price.toLocaleString('en-IN')}
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
