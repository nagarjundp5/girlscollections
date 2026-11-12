import { NextResponse } from 'next/server';
import { redis, isRedisConfigured } from '@/lib/redis';
import { getPlpCacheVersion } from '@/lib/plp-cache';
import { getHomepageSnapshot } from '@/lib/homepage-snapshot';
import { MOCK_PRODUCTS } from '@/data/shopData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface CompactSearchItem {
  id: string;
  slug: string;
  name: string;
  cat: string;
  catName: string;
  div: 'women' | 'kids';
  tags: string[];
  colour: string;
  fabric: string;
  occasion: string;
  price: number;
  mrp?: number;
  img: string;
  inStock: boolean;
}

/**
 * GET /api/search/index
 *
 * Serves ultra-compact, public-only search index cached in Redis tied to `plp:ver`.
 * Zero Neon DB hits on cache hits.
 * Cache-Control: public, s-maxage=300, stale-while-revalidate=1800
 */
export async function GET() {
  try {
    const version = await getPlpCacheVersion();
    const cacheKey = `search:index:${version}`;

    // 1. Try Redis cache first
    if (isRedisConfigured()) {
      try {
        const cached = await redis.get<string | CompactSearchItem[]>(cacheKey);
        if (cached) {
          const items = typeof cached === 'string' ? JSON.parse(cached) : cached;
          return NextResponse.json(
            { version, items },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
                'Content-Type': 'application/json',
                'X-Content-Type-Options': 'nosniff',
              },
            }
          );
        }
      } catch (redisErr) {
        console.warn('[/api/search/index] Redis read error:', redisErr);
      }
    }

    // 2. Build compact index from homepage snapshot / active catalog
    let rawProducts: any[] = [];
    try {
      const snap = await getHomepageSnapshot();
      rawProducts = [
        ...(snap.trendingProducts || []),
        ...(snap.womenTrending || []),
        ...(snap.kidsTrending || []),
        ...(snap.newDrops || []),
      ];
    } catch {
      rawProducts = MOCK_PRODUCTS;
    }

    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = MOCK_PRODUCTS;
    }

    const seen = new Set<string>();
    const items: CompactSearchItem[] = [];

    for (const p of rawProducts) {
      if (!p || p.is_active === false) continue;
      const key = String(p.id || p.slug);
      if (seen.has(key)) continue;
      seen.add(key);

      const isKids =
        (p.gender === 'kids' ||
          (p.category || '').toLowerCase().includes('kids') ||
          (p.category || '').toLowerCase().includes('frock') ||
          (p.category || '').toLowerCase().includes('pattu')) &&
        p.gender !== 'women';

      const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || '/hero/hero-saree-1.png');

      const itemPrice = Number(p.price) > 100000 ? Math.round(Number(p.price) / 100) : Number(p.price) || 0;
      const itemMrp = p.compare_price || p.originalPrice
        ? (Number(p.compare_price || p.originalPrice) > 100000
            ? Math.round(Number(p.compare_price || p.originalPrice) / 100)
            : Number(p.compare_price || p.originalPrice))
        : undefined;

      items.push({
        id: String(p.id),
        slug: String(p.slug),
        name: String(p.name),
        cat: String(p.category || ''),
        catName: String(p.subcategory || p.category || ''),
        div: isKids ? 'kids' : 'women',
        tags: Array.isArray(p.tags) ? p.tags : [],
        colour: String(p.color || (Array.isArray(p.colors) && p.colors[0]?.name) || ''),
        fabric: String(p.fabric || ''),
        occasion: String(p.occasion || ''),
        price: itemPrice,
        mrp: itemMrp,
        img: firstImage,
        inStock: p.stock_quantity === undefined ? true : Number(p.stock_quantity) > 0,
      });
    }

    // 3. Cache to Redis for fast edge serving
    if (isRedisConfigured() && items.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(items), { ex: 3600 });
      } catch (cacheErr) {
        console.warn('[/api/search/index] Redis write error:', cacheErr);
      }
    }

    return NextResponse.json(
      { version, items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('[/api/search/index] Fatal error:', error);
    return NextResponse.json({ version: 'fallback', items: [] }, { status: 200 });
  }
}

