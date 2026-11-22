import { unstable_cache } from 'next/cache';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, asc, and, sql, or, lt, gt } from 'drizzle-orm';
import { Product as ShopProduct } from '@/data/shopData';

export interface ShopProductSlim {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  originalPrice?: number;
  category: string;
  target: 'women' | 'kids';
  gender: string;
  images: string[];
  sizes: any[];
  created_at: string;
  is_active: boolean;
}

export interface PaginatedShopResult {
  products: ShopProduct[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface QueryProductsParams {
  category?: string;
  target?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
}

// Encode cursor as base64url JSON
export function encodeCursor(payload: { c: string; i: string }): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

// Decode cursor
export function decodeCursor(cursorStr: string): { c: string; i: string } | null {
  try {
    const raw = Buffer.from(cursorStr, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.c && parsed.i) {
      return { c: String(parsed.c), i: String(parsed.i) };
    }
  } catch {
    // If numeric offset fallback
  }
  return null;
}

/**
 * Executes a strictly bounded SQL query for product cards.
 * Selects only: id, name, slug, price, mrp (compare_price), category, gender, created_at, and ONE primary image URL.
 * Never loads full catalog. Always enforces LIMIT <= 24 (default 12).
 */
export async function queryShopProducts(params: QueryProductsParams): Promise<PaginatedShopResult> {
  const limit = Math.min(24, Math.max(1, Number(params.limit) || 12));
  const sort = params.sort || 'newest';
  const target = (params.target || '').toLowerCase().trim();
  const category = (params.category || '').toLowerCase().trim();
  const cursor = params.cursor;

  const whereConditions = [eq(schema.products.is_active, true)];

  // Category filter
  if (category && category !== 'all') {
    whereConditions.push(
      or(
        eq(schema.products.category, category),
        sql`lower(${schema.products.category}) = ${category}`,
        sql`lower(${schema.products.subcategory}) = ${category}`
      )!
    );
  }

  // Target / Gender filter
  if (target === 'women') {
    whereConditions.push(
      or(
        eq(schema.products.gender, 'women'),
        eq(schema.products.gender, 'both'),
        eq(schema.products.gender, 'unisex')
      )!
    );
  } else if (target === 'kids') {
    whereConditions.push(
      or(
        eq(schema.products.gender, 'kids'),
        eq(schema.products.gender, 'both'),
        eq(schema.products.gender, 'unisex'),
        sql`${schema.products.category} ILIKE '%kid%'`,
        sql`${schema.products.category} ILIKE '%frock%'`
      )!
    );
  }

  // Cursor filter (keyset pagination for newest / default)
  let offset = 0;
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded && (sort === 'newest' || sort === 'featured' || !sort)) {
      const cursorDate = new Date(decoded.c);
      whereConditions.push(
        sql`(${schema.products.created_at} < ${cursorDate} OR (${schema.products.created_at} = ${cursorDate} AND ${schema.products.id} < ${decoded.i}))`
      );
    } else if (!isNaN(Number(cursor))) {
      offset = Math.max(0, Number(cursor));
    }
  }

  // Sorting
  let orderByClause;
  if (sort === 'price-low') {
    orderByClause = [asc(schema.products.price), asc(schema.products.id)];
  } else if (sort === 'price-high') {
    orderByClause = [desc(schema.products.price), desc(schema.products.id)];
  } else if (sort === 'popular') {
    orderByClause = [
      desc(schema.products.is_trending),
      desc(schema.products.is_best_seller),
      desc(schema.products.units_sold),
      desc(schema.products.created_at),
      desc(schema.products.id),
    ];
  } else if (sort === 'discount') {
    orderByClause = [
      sql`(CASE WHEN ${schema.products.compare_price} > ${schema.products.price} THEN (${schema.products.compare_price} - ${schema.products.price})::float / ${schema.products.compare_price} ELSE 0 END) DESC`,
      desc(schema.products.id),
    ];
  } else {
    // Default newest
    orderByClause = [desc(schema.products.created_at), desc(schema.products.id)];
  }

  // Query LIMIT + 1 to detect hasMore
  let query = dbHttp
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      compare_price: schema.products.compare_price,
      category: schema.products.category,
      gender: schema.products.gender,
      created_at: schema.products.created_at,
      image: sql<string>`coalesce(${schema.products.images}[1], '')`,
    })
    .from(schema.products)
    .where(and(...whereConditions))
    .orderBy(...orderByClause)
    .limit(limit + 1);

  if (offset > 0) {
    query = query.offset(offset);
  }

  const rows = await query;
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const products: ShopProduct[] = pageRows.map((r: any) => {
    const priceRupees = r.price > 100000 ? Math.round(r.price / 100) : r.price;
    const compareRupees = r.compare_price
      ? (r.compare_price > 100000 ? Math.round(r.compare_price / 100) : r.compare_price)
      : undefined;

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: priceRupees,
      compare_price: compareRupees,
      originalPrice: compareRupees,
      category: r.category,
      gender: r.gender,
      target: r.gender === 'kids' ? 'kids' : 'women',
      images: r.image ? [r.image] : [],
      sizes: [],
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      is_active: true,
      inStock: true,
    } as unknown as ShopProduct;
  });

  let nextCursor: string | null = null;
  if (hasMore && pageRows.length > 0) {
    const last = pageRows[pageRows.length - 1];
    if (sort === 'newest' || sort === 'featured' || !sort) {
      nextCursor = encodeCursor({
        c: last.created_at ? new Date(last.created_at).toISOString() : new Date().toISOString(),
        i: last.id,
      });
    } else {
      nextCursor = String(offset + limit);
    }
  }

  return {
    products,
    nextCursor,
    hasMore,
    limit,
  };
}

/**
 * Cached first page loader (LIMIT 12, revalidate 300, tag 'products')
 */
export async function getCachedFirstPageProducts(
  params: Omit<QueryProductsParams, 'cursor' | 'limit'>
): Promise<PaginatedShopResult> {
  const categoryKey = params.category || 'all';
  const targetKey = params.target || 'all';
  const sortKey = params.sort || 'default';

  const cacheKey = ['products-first-page-v1', categoryKey, targetKey, sortKey];

  return unstable_cache(
    async () => queryShopProducts({ ...params, limit: 12 }),
    cacheKey,
    { revalidate: 300, tags: ['products'] }
  )();
}
