import { NextResponse } from 'next/server';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { and, eq, desc, sql } from 'drizzle-orm';
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

    const { searchParams } = new URL(request.url);
    const division = (searchParams.get('division') || 'all').toLowerCase();

    const divisionFilter =
      division === 'kids'
        ? sql`(lower(coalesce(${schema.products.gender}, '')) IN ('kids', 'girls', 'boys', 'children') OR lower(coalesce(${schema.products.category}, '')) LIKE '%kid%' OR lower(coalesce(${schema.products.category}, '')) LIKE '%frock%' OR lower(coalesce(${schema.products.category}, '')) LIKE '%pattu%')`
        : division === 'women'
        ? sql`(lower(coalesce(${schema.products.gender}, '')) IN ('women', 'ladies', 'womens') OR (coalesce(${schema.products.gender}, '') = '' AND lower(coalesce(${schema.products.category}, '')) NOT LIKE '%kid%' AND lower(coalesce(${schema.products.category}, '')) NOT LIKE '%girl%' AND lower(coalesce(${schema.products.category}, '')) NOT LIKE '%boy%' AND lower(coalesce(${schema.products.category}, '')) NOT LIKE '%frock%' AND lower(coalesce(${schema.products.category}, '')) NOT LIKE '%pattu%' AND lower(coalesce(${schema.products.name}, '')) NOT LIKE '%kid%' AND lower(coalesce(${schema.products.name}, '')) NOT LIKE '%girl%'))`
        : undefined;

    // Query max 8 recommended products with slim columns + product_images fallback
    const rows = await dbHttp
      .select({
        id: schema.products.id,
        name: schema.products.name,
        slug: schema.products.slug,
        price: schema.products.price,
        compare_price: schema.products.compare_price,
        category: schema.products.category,
        gender: schema.products.gender,
        sizes: schema.products.sizes,
        stock_quantity: schema.products.stock_quantity,
        is_featured: schema.products.is_featured,
        is_best_seller: schema.products.is_best_seller,
        is_new_arrival: schema.products.is_new_arrival,
        created_at: schema.products.created_at,
        image: sql<string>`coalesce(nullif(${schema.products.images}[1], ''), (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = ${schema.products.id} ORDER BY pi.sort_order ASC LIMIT 1), '')`,
        images: schema.products.images,
      })
      .from(schema.products)
      .where(divisionFilter ? and(eq(schema.products.is_active, true), divisionFilter) : eq(schema.products.is_active, true))
      .orderBy(desc(schema.products.is_featured), desc(schema.products.units_sold), desc(schema.products.created_at))
      .limit(8);

    const recommended = rows.map((p: any) => {
      const priceRupees = p.price > 10000 ? Math.round(p.price / 100) : p.price;
      const originalPriceRupees = p.compare_price
        ? (p.compare_price > 10000 ? Math.round(p.compare_price / 100) : p.compare_price)
        : undefined;
      const rawImgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      const finalImgs = rawImgs.length > 0 ? rawImgs.slice(0, 2) : (p.image ? [p.image] : []);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: priceRupees,
        originalPrice: originalPriceRupees,
        compare_price: originalPriceRupees,
        images: finalImgs,
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        stock_quantity: p.stock_quantity || {},
        colors: [],
        category: p.category,
        gender: p.gender,
        target: p.gender === 'kids' ? 'kids' : 'women',
        isNew: p.is_new_arrival ?? true,
        isBestSeller: p.is_best_seller ?? p.is_featured,
        isSale: !!originalPriceRupees,
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
