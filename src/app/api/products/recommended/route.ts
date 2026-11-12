import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getHomepageSnapshot } from '@/lib/homepage-snapshot';
import { MOCK_PRODUCTS } from '@/data/shopData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECOMMENDED_REDIS_KEY = 'cart:recommended:v2';
const RECOMMENDED_CACHE_TTL_SEC = 86400; // 24 hours

export interface RecommendedProductPayload {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  images: string[];
  sizes: any[];
  colors: { name: string; hex: string }[];
  category: string;
}

/**
 * GET /api/products/recommended
 *
 * Serves curated "You May Also Like" items for Cart Drawer.
 * High-performance 0-DB-hit architecture:
 * 1. Checks Redis key `cart:recommended:v2` (Edge latency ~10ms).
 * 2. On miss, pulls from `homepage:snapshot:v1` in Redis (0 DB hits).
 * 3. Sanitizes and caches the result back to Redis for 24 hours.
 */
export async function GET() {
  try {
    // 1. Direct Upstash Redis Cache Check (Fastest, 0 DB hits)
    try {
      const cached = await redis.get<string | RecommendedProductPayload[]>(RECOMMENDED_REDIS_KEY);
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json(
            { products: parsed },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'X-Content-Type-Options': 'nosniff',
              },
            }
          );
        }
      }
    } catch (redisErr) {
      console.warn('[/api/products/recommended] Redis read cache skip:', redisErr);
    }

    // 2. Read from Redis homepage snapshot (0 DB hits)
    let candidates: any[] = [];
    try {
      const snap = await getHomepageSnapshot();
      candidates = [
        ...(snap.trendingProducts || []),
        ...(snap.womenTrending || []),
        ...(snap.newDrops || []),
        ...(snap.kidsTrending || []),
      ];
    } catch (snapErr) {
      console.warn('[/api/products/recommended] Snapshot read note:', snapErr);
    }

    // 3. Fallback to curated mock products if snapshot is empty (0 DB hits)
    if (!candidates || candidates.length === 0) {
      candidates = MOCK_PRODUCTS;
    }

    // 4. Sanitize, filter, and format lightweight payload
    const seen = new Set<string>();
    const sanitized: RecommendedProductPayload[] = [];

    for (const p of candidates) {
      if (!p || p.is_active === false) continue;

      const idKey = String(p.id || p.slug || '');
      if (!idKey || seen.has(idKey)) continue;

      const images = Array.isArray(p.images)
        ? p.images.filter((img: any) => typeof img === 'string' && img.trim() !== '' && !img.includes('three-kids-mobile') && !img.includes('photo-1610030469983'))
        : [];

      if (images.length === 0) continue;

      const numPrice = Number(p.price);
      if (!numPrice || isNaN(numPrice) || numPrice <= 0) continue;

      seen.add(idKey);
      sanitized.push({
        id: String(p.id),
        name: String(p.name),
        slug: String(p.slug),
        price: numPrice > 100000 ? Math.round(numPrice / 100) : numPrice,
        compare_price: p.compare_price ? (Number(p.compare_price) > 100000 ? Math.round(Number(p.compare_price) / 100) : Number(p.compare_price)) : undefined,
        images,
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Standard', hex: '#000000' }],
        category: String(p.category || ''),
      });

      if (sanitized.length >= 8) break;
    }

    // 5. Store back to Redis cache
    if (sanitized.length > 0) {
      try {
        await redis.set(RECOMMENDED_REDIS_KEY, JSON.stringify(sanitized), {
          ex: RECOMMENDED_CACHE_TTL_SEC,
        });
      } catch (cacheErr) {
        console.warn('[/api/products/recommended] Redis write cache note:', cacheErr);
      }
    }

    return NextResponse.json(
      { products: sanitized },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('[/api/products/recommended] Error:', error);
    return NextResponse.json(
      { products: [] },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}
