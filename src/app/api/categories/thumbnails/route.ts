import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { rateLimitPublicCatalogue } from '@/lib/rateLimit';

// ISR: revalidate at most once per hour; busted via revalidateTag('products') on admin mutations
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
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

    const thumbnails = await dbService.getCategoryThumbnails();
    return NextResponse.json(
      { thumbnails },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get category thumbnails:', error);
    return NextResponse.json({ error: 'Failed to fetch category thumbnails' }, { status: 500 });
  }
}
