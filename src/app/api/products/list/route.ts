import { NextResponse } from 'next/server';
import { queryShopProducts } from '@/lib/shop-products';
import { rateLimitPublicCatalogue } from '@/lib/rateLimit';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const limitResult = await rateLimitPublicCatalogue(ip);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(limitResult.reset || 60) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(24, Math.max(1, Number(searchParams.get('limit')) || 12));
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
        limit: result.limit,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Products list API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
  }
}
