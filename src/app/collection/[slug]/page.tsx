import React, { Suspense } from 'react';
import { PLPPageContent } from '@/components/plp/PLPPageContent';

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory py-20 text-center text-navy font-serif">Loading Collection...</div>}>
      <PLPPageContent initialCategory={params.slug} />
    </Suspense>
  );
}
