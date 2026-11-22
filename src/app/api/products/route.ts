import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { toPublicProductDTO } from '@/lib/dto/product';
import { queryShopProducts } from '@/lib/shop-products';
import { rateLimitPublicCatalogue } from '@/lib/rateLimit';

// ISR revalidation
export const revalidate = 300;

export async function GET(request: Request) {
  try {
    // Per-IP rate limit: 60 requests per minute
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const limitResult = await rateLimitPublicCatalogue(ip);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.reset || 60) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // Individual PDP lookup by slug: loads full details only for that one product
    if (slug) {
      const product = await dbService.getProductBySlug(slug);
      if (!product || product.is_active === false) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(
        { product: toPublicProductDTO(product) },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Paginated list view: accepts limit (default 12, max 24), cursor, category, target, sort
    const rawLimit = Number(searchParams.get('limit')) || 12;
    const limit = Math.min(24, Math.max(1, rawLimit));
    const cursor = searchParams.get('cursor') || undefined;
    const category = searchParams.get('category') || undefined;
    const target = searchParams.get('target') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const result = await queryShopProducts({
      limit,
      cursor,
      category,
      target,
      sort,
    });

    return NextResponse.json(
      {
        products: result.products,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Public products GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
