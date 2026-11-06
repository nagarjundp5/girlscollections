import React from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { getHomepageSnapshot } from '@/lib/homepage-snapshot';

// Static ISR with on-demand invalidation via revalidateTag('home') / revalidatePath('/')
export const revalidate = 60;

export default async function HomePage() {
  const snapshot = await getHomepageSnapshot();

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
