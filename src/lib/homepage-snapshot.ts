import { redis } from '@/lib/redis';
import { Product } from '@/types';
import { revalidatePath, revalidateTag } from 'next/cache';

export const HOMEPAGE_SNAPSHOT_REDIS_KEY = 'homepage:snapshot:v1';
export const HOMEPAGE_SNAPSHOT_TTL_SEC = 7 * 24 * 60 * 60; // 7 days (persists until invalidation)

export interface HomepageSnapshot {
  womenTrending: Product[];
  kidsTrending: Product[];
  trendingProducts: Product[];
  newDrops: Product[];
  spotlightProduct: Product | null;
  updatedAt: string;
}

async function getFirestoreDoc(collection: string, docId: string) {
  if (typeof window === 'undefined') {
    try {
      const { firestoreService } = await import('@/lib/firestore');
      return await firestoreService.getDoc(collection, docId);
    } catch {
      return null;
    }
  }
  return null;
}

async function setFirestoreDoc(collection: string, docId: string, data: any) {
  if (typeof window === 'undefined') {
    try {
      const { firestoreService } = await import('@/lib/firestore');
      await firestoreService.setDoc(collection, docId, data);
    } catch {
      // Ignore
    }
  }
}

/**
 * Builds the complete homepage snapshot from the database.
 * Executes ONE optimized query selecting ONLY card fields (no heavy descriptions/metadata).
 */
export async function buildHomepageSnapshot(): Promise<HomepageSnapshot> {
  const { dbHttp } = await import('@/db');
  const schema = await import('@/db/schema');
  const { eq, desc } = await import('drizzle-orm');

  // Single query for active products with price > 0
  const activeProducts = await dbHttp
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      compare_price: schema.products.compare_price,
      category: schema.products.category,
      subcategory: schema.products.subcategory,
      gender: schema.products.gender,
      images: schema.products.images,
      sizes: schema.products.sizes,
      stock_quantity: schema.products.stock_quantity,
      is_featured: schema.products.is_featured,
      is_trending: schema.products.is_trending,
      is_best_seller: schema.products.is_best_seller,
      is_new_arrival: schema.products.is_new_arrival,
      is_active: schema.products.is_active,
      created_at: schema.products.created_at,
    })
    .from(schema.products)
    .where(eq(schema.products.is_active, true))
    .orderBy(desc(schema.products.created_at));

  const validProducts: Product[] = (activeProducts || []).filter(
    (p: any) => p.price > 0 && Array.isArray(p.images) && p.images.length > 0
  ) as any[];

  // Separate Women and Kids
  const womenValid = validProducts.filter((p: Product) => {
    const cat = (p.category || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const isKids =
      cat.includes('kids') ||
      sub.includes('kids') ||
      cat.includes('frock') ||
      cat.includes('pattu') ||
      p.gender === 'kids' ||
      p.gender === 'both' ||
      p.gender === 'unisex';
    return p.gender === 'women' || p.gender === 'both' || !isKids;
  });

  const kidsValid = validProducts.filter((p: Product) => {
    const cat = (p.category || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const isKids =
      cat.includes('kids') ||
      sub.includes('kids') ||
      cat.includes('frock') ||
      cat.includes('pattu') ||
      p.gender === 'kids' ||
      p.gender === 'both' ||
      p.gender === 'unisex';
    return isKids || (p.gender as string) === 'both';
  });

  const womenTrending = [
    ...womenValid.filter((p: Product) => p.is_trending || p.is_featured || p.is_best_seller),
    ...womenValid.filter((p: Product) => !p.is_trending && !p.is_featured && !p.is_best_seller),
  ].slice(0, 16);

  const kidsTrending = [
    ...kidsValid.filter((p: Product) => p.is_trending || p.is_featured || p.is_best_seller),
    ...kidsValid.filter((p: Product) => !p.is_trending && !p.is_featured && !p.is_best_seller),
  ].slice(0, 16);

  const trendingProducts = [...womenTrending.slice(0, 8), ...kidsTrending.slice(0, 8)];

  const newDrops = [...validProducts]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 16);

  const spotlightProduct = trendingProducts[0] || validProducts[0] || null;

  return {
    womenTrending,
    kidsTrending,
    trendingProducts,
    newDrops,
    spotlightProduct,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reads the homepage snapshot from Redis (or Firestore backup).
 * NEVER touches Neon at request time if cached.
 */
export async function getHomepageSnapshot(): Promise<HomepageSnapshot> {
  // 1. Upstash Redis Cache Check (Fastest, ~10ms edge)
  try {
    const cached = await redis.get<string | HomepageSnapshot>(HOMEPAGE_SNAPSHOT_REDIS_KEY);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }
  } catch (err) {
    console.warn('[HomepageSnapshot] Redis read error:', err);
  }

  // 2. Firestore Cache Check (Backup persistent store)
  try {
    const firestoreSnap = await getFirestoreDoc('cache', 'home');
    if (firestoreSnap && firestoreSnap.data) {
      // Re-populate Redis
      try {
        await redis.set(HOMEPAGE_SNAPSHOT_REDIS_KEY, JSON.stringify(firestoreSnap.data), {
          ex: HOMEPAGE_SNAPSHOT_TTL_SEC,
        });
      } catch {
        // Non-critical
      }
      return firestoreSnap.data as HomepageSnapshot;
    }
  } catch (err) {
    console.warn('[HomepageSnapshot] Firestore read error:', err);
  }

  // 3. Cache Miss: Build fresh snapshot from DB, save to both stores, and return
  try {
    const snapshot = await buildHomepageSnapshot();
    await saveHomepageSnapshot(snapshot);
    return snapshot;
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
}

/**
 * Persists snapshot to both Upstash Redis and Firestore.
 */
export async function saveHomepageSnapshot(snapshot: HomepageSnapshot): Promise<void> {
  // 1. Write to Redis
  try {
    await redis.set(HOMEPAGE_SNAPSHOT_REDIS_KEY, JSON.stringify(snapshot), {
      ex: HOMEPAGE_SNAPSHOT_TTL_SEC,
    });
  } catch (err) {
    console.warn('[HomepageSnapshot] Redis save error:', err);
  }

  // 2. Write to Firestore doc 'cache/home'
  try {
    await setFirestoreDoc('cache', 'home', {
      data: snapshot,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[HomepageSnapshot] Firestore save error:', err);
  }
}

/**
 * Rebuilds the snapshot and invalidates ISR tags.
 */
export async function invalidateAndRebuildHomepageSnapshot(): Promise<void> {
  try {
    const freshSnapshot = await buildHomepageSnapshot();
    await saveHomepageSnapshot(freshSnapshot);
  } catch (err) {
    console.error('[HomepageSnapshot] Failed to rebuild during invalidation:', err);
    try {
      await redis.del(HOMEPAGE_SNAPSHOT_REDIS_KEY);
    } catch {
      // Ignore
    }
  }

  try {
    revalidatePath('/');
    revalidateTag('home');
    revalidateTag('products');
  } catch {
    // Non-fatal if outside server action
  }
}
