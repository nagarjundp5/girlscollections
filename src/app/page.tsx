import React, { Suspense } from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { getHomepageSnapshot } from '@/lib/homepage-snapshot';

export const revalidate = 300;

async function HomeContent() {
  const snapshot = await getHomepageSnapshot();

  return (
    <HomePageClient
      trending={snapshot.trending}
      newDrops={snapshot.newDrops}
      categoryRows={snapshot.categoryRows}
      spotlightProduct={snapshot.spotlightProduct}
      trendingProducts={snapshot.trending.all}
      womenTrending={snapshot.trending.women}
      kidsTrending={snapshot.trending.kids}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#FAF8F5] px-4 py-8 space-y-8">
          <div className="w-full h-[55vh] rounded-2xl bg-[#EFE7E2] animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1440px] mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#EADFD6] overflow-hidden">
                <div className="w-full aspect-[3/4] bg-[#F3EFEA] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-[#F3EFEA] rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-[#F3EFEA] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
