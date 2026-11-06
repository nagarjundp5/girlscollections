'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cl, clBlur } from '@/lib/cloudinary';

export interface ShopCategoryTile {
  id: string;
  name: string;
  slug: string;
  group?: 'women' | 'kids';
  image: string;
}

const TOP_CATEGORIES: ShopCategoryTile[] = [
  {
    id: 'anarkalis',
    name: 'Anarkali Sets',
    slug: 'anarkali-kurta-suit-sets',
    group: 'women',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907853/tgc/categories/anarkali-kurta-suit-sets.webp',
  },
  {
    id: 'pattu-pavadai',
    name: 'Pattu Pavadai',
    slug: 'kids-lehenga-blouse-or-pattu-pavadai',
    group: 'kids',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907856/tgc/categories/kids-lehenga-blouse-or-pattu-pavadai.webp',
  },
  {
    id: 'kurta-sets',
    name: 'Kurta Ensembles',
    slug: 'all-kurta-sets',
    group: 'women',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907852/tgc/categories/all-kurta-sets.webp',
  },
  {
    id: 'party-frocks',
    name: 'Party Wear Frocks',
    slug: 'party-wear-frocks',
    group: 'kids',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907858/tgc/categories/party-wear-frocks.webp',
  },
  {
    id: 'co-ords',
    name: 'Co-ord Sets',
    slug: 'co-ord-set',
    group: 'women',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907855/tgc/categories/co-ord-set.webp',
  },
  {
    id: 'kids-gowns',
    name: 'Traditional Gowns',
    slug: 'kids-traditional-gown-1-pc',
    group: 'kids',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907857/tgc/categories/kids-traditional-gown-1-pc.webp',
  },
  {
    id: 'skirt-top',
    name: 'Skirt & Crop Top',
    slug: 'skirt-and-top',
    group: 'women',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907858/tgc/categories/skirt-and-top.webp',
  },
  {
    id: 'kids-coords',
    name: 'Children Co-ords',
    slug: 'children-co-ord-set',
    group: 'kids',
    image: 'https://res.cloudinary.com/lt3ga2by/image/upload/v1793907854/tgc/categories/children-co-ord-set.webp',
  },
];

interface ShopByCategoryBentoProps {
  filter?: 'all' | 'women' | 'kids';
  categories?: ShopCategoryTile[];
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export const ShopByCategoryBento: React.FC<ShopByCategoryBentoProps> = ({
  filter = 'all',
  categories = TOP_CATEGORIES,
  title = 'Shop by Category',
  viewAllHref,
  viewAllLabel = 'VIEW ALL CATEGORIES',
}) => {
  const displayed = React.useMemo(() => {
    if (!filter || filter === 'all') return categories.slice(0, 8);
    const filtered = categories.filter((c) => !c.group || c.group === filter);
    return (filtered.length >= 4 ? filtered : categories).slice(0, 8);
  }, [filter, categories]);

  if (!displayed || displayed.length === 0) return null;

  const defaultViewAll = filter === 'women' ? '/shop?target=women' : filter === 'kids' ? '/shop?target=kids' : '/shop';
  const finalViewAllHref = viewAllHref || defaultViewAll;

  return (
    <section className="w-full bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Title Centred */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-[20px] md:text-[26px] font-sans font-semibold text-[#1C1417] tracking-[0.06em]">
            {title}
          </h2>
        </div>

        {/* 4 Columns Desktop / 2 Columns Mobile Grid of 3:4 portrait tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayed.map((cat) => {
            const targetParam = filter !== 'all' ? filter : cat.group || '';
            const href = `/shop?category=${cat.slug}${targetParam ? `&target=${targetParam}` : ''}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className="group flex flex-col items-center select-none"
                aria-label={`Shop ${cat.name}`}
              >
                {/* 3:4 Portrait Image Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-none bg-[#EFECE8]">
                  <Image
                    src={cl(cat.image, { w: 500, q: 'auto:good' })}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={clBlur(cat.image)}
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Category Name Below Image: Bold Uppercase, 14-15px, Centred */}
                <div className="mt-3.5 text-center px-1">
                  <h3 className="text-sm md:text-[15px] font-bold uppercase tracking-[0.08em] text-[#1C1417] group-hover:text-black transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button below tiles */}
        <div className="mt-8 md:mt-10 text-center">
          <Link
            href={finalViewAllHref}
            className="inline-flex items-center justify-center px-6 py-2.5 min-h-[44px] bg-[#1C1417] text-white hover:bg-black text-xs md:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors rounded-none"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategoryBento;
