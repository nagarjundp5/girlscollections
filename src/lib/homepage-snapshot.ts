import { unstable_cache } from 'next/cache';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { Product } from '@/types';

export interface HomepageSnapshot {
  womenTrending: Product[];
  kidsTrending: Product[];
  trendingProducts: Product[];
  newDrops: Product[];
  spotlightProduct: Product | null;
  updatedAt: string;
}

function mapToHomepageProduct(r: any): Product {
  const priceRupees = r.price > 100000 ? Math.round(r.price / 100) : r.price;
  const compareRupees = r.compare_price
    ? (r.compare_price > 100000 ? Math.round(r.compare_price / 100) : r.compare_price)
    : undefined;

  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: priceRupees,
    compare_price: compareRupees,
    originalPrice: compareRupees,
    category: r.category,
    gender: r.gender,
    target: r.gender === 'kids' ? 'kids' : 'women',
    images: r.image ? [r.image] : [],
    sizes: [],
    created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    is_active: true,
  } as unknown as Product;
}

/**
 * Raw loader for homepage sections.
 * Executes ONLY 2 queries with strict LIMITs:
 *   1. New drops: LIMIT 10
 *   2. Trending: LIMIT 20 (partitioned into womenTrending and kidsTrending)
 * Selects only slim columns: id, name, slug, price, compare_price, category, gender, created_at, images[1].
 * ZERO Redis calls, ZERO full-table scans, ZERO N+1 subqueries.
 */
async function fetchHomepageSnapshotRaw(): Promise<HomepageSnapshot> {
  const slimSelect = {
    id: schema.products.id,
    name: schema.products.name,
    slug: schema.products.slug,
    price: schema.products.price,
    compare_price: schema.products.compare_price,
    category: schema.products.category,
    gender: schema.products.gender,
    created_at: schema.products.created_at,
    image: sql<string>`coalesce(${schema.products.images}[1], '')`,
  };

  const [newDropsRows, trendingRows] = await Promise.all([
    // Query 1: New Drops (max 10 products)
    dbHttp
      .select(slimSelect)
      .from(schema.products)
      .where(eq(schema.products.is_active, true))
      .orderBy(desc(schema.products.created_at), desc(schema.products.id))
      .limit(10),

    // Query 2: Trending (max 20 products)
    dbHttp
      .select(slimSelect)
      .from(schema.products)
      .where(eq(schema.products.is_active, true))
      .orderBy(
        desc(schema.products.is_trending),
        desc(schema.products.is_featured),
        desc(schema.products.units_sold),
        desc(schema.products.created_at),
        desc(schema.products.id)
      )
      .limit(20),
  ]);

  const newDrops = newDropsRows.map(mapToHomepageProduct);
  const trendingPool = trendingRows.map(mapToHomepageProduct);

  const isKids = (p: Product) => {
    const cat = (p.category || '').toLowerCase();
    return p.gender === 'kids' || cat.includes('kid') || cat.includes('frock');
  };

  const womenTrending = trendingPool.filter((p: Product) => !isKids(p)).slice(0, 10);
  const kidsTrending = trendingPool.filter((p: Product) => isKids(p)).slice(0, 10);

  // If kidsTrending is small, backfill from newDrops or trending
  const finalKidsTrending =
    kidsTrending.length > 0 ? kidsTrending : trendingPool.slice(0, 8);
  const finalWomenTrending =
    womenTrending.length > 0 ? womenTrending : trendingPool.slice(0, 8);

  const trendingProducts = [
    ...finalWomenTrending.slice(0, 5),
    ...finalKidsTrending.slice(0, 5),
  ];

  const spotlightProduct = trendingProducts[0] || newDrops[0] || null;

  return {
    womenTrending: finalWomenTrending,
    kidsTrending: finalKidsTrending,
    trendingProducts,
    newDrops,
    spotlightProduct,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Cached homepage snapshot loader:
 * Key: "homepage-snapshot"
 * Revalidate: 600 seconds
 * Tag: "homepage"
 */
export const getHomepageSnapshot = unstable_cache(
  async () => {
    try {
      return await fetchHomepageSnapshotRaw();
    } catch (err) {
      console.error('[HomepageSnapshot] Failed to build snapshot:', err);
      return {
        womenTrending: [],
        kidsTrending: [],
        trendingProducts: [],
        newDrops: [],
        spotlightProduct: null,
        updatedAt: new Date().toISOString(),
      };
    }
  },
  ['homepage-snapshot'],
  { revalidate: 600, tags: ['homepage'] }
);

export async function saveHomepageSnapshot(): Promise<void> {
  // No-op: Invalidation is handled via revalidateTag('homepage')
}

export async function invalidateAndRebuildHomepageSnapshot(): Promise<void> {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/', 'page');
    revalidateTag('homepage');
    revalidateTag('products');
  } catch {
    // Ignore outside request context
  }
}
