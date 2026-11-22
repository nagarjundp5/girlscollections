import { NextResponse } from 'next/server';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { rateLimitPublicCatalogue } from '@/lib/rateLimit';

export const runtime = 'nodejs';
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

    // Query max 8 recommended products with slim columns
    const rows = await dbHttp
      .select({
        id: schema.products.id,
        name: schema.products.name,
        slug: schema.products.slug,
        price: schema.products.price,
        compare_price: schema.products.compare_price,
        category: schema.products.category,
        image: sql<string>`coalesce(${schema.products.images}[1], '')`,
      })
      .from(schema.products)
      .where(eq(schema.products.is_active, true))
      .orderBy(desc(schema.products.is_featured), desc(schema.products.units_sold), desc(schema.products.created_at))
      .limit(8);

    const recommended = rows.map((p: any) => {
      const priceRupees = p.price > 100000 ? Math.round(p.price / 100) : p.price;
      const originalPriceRupees = p.compare_price
        ? (p.compare_price > 100000 ? Math.round(p.compare_price / 100) : p.compare_price)
        : undefined;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: priceRupees,
        compare_price: originalPriceRupees,
        images: p.image ? [p.image] : [],
        sizes: [],
        colors: [],
        category: p.category,
      };
    });

    return NextResponse.json(
      { products: recommended },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Recommended products GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommended products' }, { status: 500 });
  }
}
