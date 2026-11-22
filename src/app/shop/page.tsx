import React, { Suspense } from 'react';
import { PLPPageContent } from '@/components/plp/PLPPageContent';
import { getCachedFirstPageProducts } from '@/lib/shop-products';

interface ShopPageProps {
  searchParams: {
    category?: string;
    target?: string;
    sort?: string;
    q?: string;
  };
}

export const revalidate = 300;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Server-render first page only (12 products, slim columns, cached with unstable_cache 300s, tag: 'products')
  const initialData = await getCachedFirstPageProducts({
    category: searchParams.category,
    target: searchParams.target,
    sort: searchParams.sort,
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] py-20 text-center text-[#1C1417] font-serif">Loading Collection...</div>}>
      <PLPPageContent
        initialCategory={searchParams.category}
        initialTarget={searchParams.target}
        initialSort={searchParams.sort}
        initialQuery={searchParams.q}
        initialProducts={initialData.products}
        initialNextCursor={initialData.nextCursor}
        initialHasMore={initialData.hasMore}
      />
    </Suspense>
  );
}
