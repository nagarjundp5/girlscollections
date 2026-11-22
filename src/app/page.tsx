import React from 'react';
import HomePageClient from '@/components/home/HomePageClient';
import { getHomepageSnapshot } from '@/lib/homepage-snapshot';

export const revalidate = 600;

export default async function HomePage() {
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
