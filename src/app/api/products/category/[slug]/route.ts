import { NextResponse } from 'next/server';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql, or } from 'drizzle-orm';
import { rateLimitPublicCatalogue } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    const { slug } = params;
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
    }

    const cat = slug.toLowerCase().trim();

    // Query max 8 category products with slim columns
    const rows = await dbHttp
      .select({
        id: schema.products.id,
        name: schema.products.name,
        slug: schema.products.slug,
        price: schema.products.price,
        compare_price: schema.products.compare_price,
        category: schema.products.category,
        gender: schema.products.gender,
        image: sql<string>`coalesce(${schema.products.images}[1], '')`,
      })
      .from(schema.products)
      .where(
        or(
          eq(schema.products.category, cat),
          sql`lower(${schema.products.category}) = ${cat}`,
          sql`lower(${schema.products.subcategory}) = ${cat}`
        )
      )
      .orderBy(desc(schema.products.created_at), desc(schema.products.id))
      .limit(8);

    const products = rows.map((p: any) => {
      const priceRupees = p.price > 100000 ? Math.round(p.price / 100) : p.price;
      const compareRupees = p.compare_price
        ? (p.compare_price > 100000 ? Math.round(p.compare_price / 100) : p.compare_price)
        : undefined;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: priceRupees,
        compare_price: compareRupees,
        originalPrice: compareRupees,
        category: p.category,
        target: p.gender === 'kids' ? 'kids' : 'women',
        images: p.image ? [p.image] : [],
        sizes: [],
        inStock: true,
      };
    });

    return NextResponse.json(
      { products, category: cat, count: products.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[/api/products/category] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
