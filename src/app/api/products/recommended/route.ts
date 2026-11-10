import { NextResponse } from 'next/server';
import { getCachedTrendingProducts } from '@/lib/product-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/products/recommended
 *
 * Serves curated "You May Also Like" items for Cart Drawer.
 * Backed by unstable_cache and CDN edge caching (0 DB hits on repeated visits).
 */
export async function GET() {
  try {
    const products = await getCachedTrendingProducts(6);

    // Format lightweight payload for cart recommendations
    const lightweight = (products || [])
      .filter((p) => p && p.is_active !== false && p.images && p.images.length > 0)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        images: p.images,
        sizes: p.sizes,
        category: p.category,
      }));

    return NextResponse.json(
      { products: lightweight },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[/api/products/recommended] Error:', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}

