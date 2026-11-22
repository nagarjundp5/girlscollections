import { NextResponse } from 'next/server';
import { getCachedSlimCatalogue } from '@/lib/catalogue';
import { rateLimitSearch } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const revalidate = 3600;

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

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 30 req/min for search routes
    const limitResult = await rateLimitSearch(ip);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many search requests' },
        { status: 429, headers: { 'Retry-After': String(limitResult.reset || 60) } }
      );
    }

    const catalogue = await getCachedSlimCatalogue();

    const items: CompactSearchItem[] = catalogue.map((p) => {
      const priceRupees = p.price > 10000 ? Math.round(p.price / 100) : p.price;
      const originalPriceRupees = p.compare_price
        ? p.compare_price > 10000
          ? Math.round(p.compare_price / 100)
          : p.compare_price
        : undefined;

      const cat = (p.category || '').toLowerCase();
      const sub = (p.subcategory || '').toLowerCase();
      const isKids =
        p.gender === 'kids' ||
        cat.includes('kids') ||
        sub.includes('kids') ||
        cat.includes('frock');

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        cat: p.category,
        catName: p.subcategory || p.category,
        div: isKids ? 'kids' : 'women',
        tags: [],
        colour: p.colours[0] || '',
        fabric: p.fabric || '',
        occasion: p.occasion || '',
        price: priceRupees,
        mrp: originalPriceRupees,
        img: p.images[0] || '',
        inStock: p.in_stock,
      };
    });

    return NextResponse.json(
      { version: '1', items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Search index route error:', error);
    return NextResponse.json({ error: 'Failed to build search index' }, { status: 500 });
  }
}
