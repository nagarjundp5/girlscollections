// export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPlpData } from '@/lib/plp-cache';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    // 1. Upstash Rate Limit (60 req/min per IP)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const limitResult = await rateLimit(`plp_api:${ip}`, 60, 60000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limitResult.reset || 60),
            'X-RateLimit-Limit': String(limitResult.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    // 3. Fetch from PLP cache (Redis 1 GET on hit / SWR / Neon fallback)
    const { data, cacheStatus, neonQueries } = await getPlpData(queryObj);

    // 4. Return response with X-Cache & Cache-Control headers
    return NextResponse.json(
      {
        products: data.products,
        total: data.total,
        hasMore: data.hasMore,
        page: data.page,
        limit: data.limit,
        facetCounts: data.facets,
      },
      {
        status: 200,
        headers: {
          'X-Cache': cacheStatus,
          'X-Neon-Queries': String(neonQueries),
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('PLP API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products catalogue' },
      { status: 500 }
    );
  }
}
