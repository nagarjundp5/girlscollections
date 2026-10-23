import React, { Suspense } from 'react';
import { PLPPageContent } from '@/components/plp/PLPPageContent';

interface ShopPageProps {
  searchParams: {
    category?: string;
    target?: string;
    occasion?: string;
  };
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory py-20 text-center text-navy font-serif">Loading Catalog...</div>}>
      <PLPPageContent
        initialCategory={searchParams.category}
        initialTarget={searchParams.target}
        initialOccasion={searchParams.occasion}
      />
    </Suspense>
  );
}
