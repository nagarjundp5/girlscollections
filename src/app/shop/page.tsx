import React from 'react';
import { PLPPageContent } from '@/components/plp/PLPPageContent';
import { getPlpData } from '@/lib/plp-cache';

interface ShopPageProps {
  searchParams: {
    category?: string;
    target?: string;
    occasion?: string;
    categories?: string;
    sizes?: string;
    colours?: string;
    fabrics?: string;
    occasions?: string;
    minPrice?: string;
    maxPrice?: string;
    discount?: string;
    inStock?: string;
    sort?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Server-render first page & facets using shared PLP cache (1 GET on hit)
  const { data } = await getPlpData({
    ...searchParams,
    page: 1,
  });

  return (
    <PLPPageContent
      initialCategory={searchParams.category}
      initialTarget={searchParams.target}
      initialOccasion={searchParams.occasion}
      initialData={data}
    />
  );
}
