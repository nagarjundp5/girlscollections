import React, { Suspense } from 'react';
import { PLPPageContent } from '@/components/plp/PLPPageContent';
import { getCachedFirstPageProducts } from '@/lib/shop-products';

export const revalidate = 300;

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  // Server-render first page only (12 products, slim columns, cached with unstable_cache 300s, tag: 'products')
  const initialData = await getCachedFirstPageProducts({
    category: params.slug,
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] py-20 text-center text-[#1C1417] font-serif">Loading Collection...</div>}>
      <PLPPageContent
        initialCategory={params.slug}
        initialProducts={initialData.products}
        initialNextCursor={initialData.nextCursor}
        initialHasMore={initialData.hasMore}
      />
    </Suspense>
  );
}
