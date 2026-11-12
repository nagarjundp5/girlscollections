import React from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { unstable_cache } from 'next/cache';

// Static ISR with on-demand invalidation via revalidateTag('home') / revalidatePath('/')
export const revalidate = 300;

const getCachedHomepageSnapshot = unstable_cache(
  async () => {
    const { getHomepageSnapshot } = await import('@/lib/homepage-snapshot');
    return getHomepageSnapshot();
  },
  ['tgc-home-snapshot-v2'],
  { revalidate: 300, tags: ['home'] }
);

export default async function HomePage() {
  const snapshot = await getCachedHomepageSnapshot();

  return (
    <HomePageClient
      trendingProducts={snapshot.trendingProducts}
      womenTrending={snapshot.womenTrending}
      kidsTrending={snapshot.kidsTrending}
      newDrops={snapshot.newDrops}
      spotlightProduct={snapshot.spotlightProduct}
    />
  );
}
