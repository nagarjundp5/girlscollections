export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { rateLimitCheckoutFlow } from '@/lib/rateLimit';
import { firestoreService } from '@/lib/firestore';

const postSchema = z.object({
  productId: z.string().uuid().optional(),
  productIds: z.array(z.string().uuid()).max(100).optional(),
  size: z.string().max(40).optional(),
}).refine((d) => Boolean(d.productId || (d.productIds && d.productIds.length > 0)), {
  message: 'productId or productIds is required',
});

const deleteSchema = z.object({
  productId: z.string().uuid(),
});

async function resolveAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const sessionCookie = req.cookies.get('tgc_session')?.value;
  if (sessionCookie) {
    const payload = await verifyToken(sessionCookie);
    if (payload && typeof payload.userId === 'string' && payload.userId) {
      return payload.userId;
    }
  }

  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch (err) {
    console.warn('[Wishlist Auth] Clerk auth check warning:', err);
  }

  return null;
}

async function fetchActiveProductsByIds(ids: string[]) {
  if (!ids.length) return [];
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
      stock: schema.products.stock_quantity,
      created_at: schema.products.created_at,
      is_active: schema.products.is_active,
      image: sql<string>`coalesce(${schema.products.images}[1], '')`,
      images: schema.products.images,
    })
    .from(schema.products)
    .where(and(inArray(schema.products.id, ids), eq(schema.products.is_active, true)));

  const rowMap = new Map(rows.map((r: any) => [r.id, r]));
  return ids
    .map((id) => rowMap.get(id))
    .filter(Boolean)
    .map((r: any) => {
      const priceRupees = r.price > 100000 ? Math.round(r.price / 100) : r.price;
      const originalPriceRupees = r.compare_price
        ? (r.compare_price > 100000 ? Math.round(r.compare_price / 100) : r.compare_price)
        : undefined;
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: priceRupees,
        originalPrice: originalPriceRupees,
        compare_price: originalPriceRupees,
        category: r.category,
        gender: r.gender,
        target: r.gender === 'kids' ? 'kids' : 'women',
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : (r.image ? [r.image] : []),
        sizes: Array.isArray(r.sizes) ? r.sizes : [],
        stock_quantity: r.stock || {},
        isNew: r.created_at ? Date.now() - new Date(r.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000 : false,
        is_active: true,
      };
    });
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limitRes = await rateLimitCheckoutFlow(ip);
    if (!limitRes.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limitRes.reset) } });
    }

    const { searchParams } = new URL(req.url);
    const guestIdsParam = searchParams.get('guestIds');
    const userId = await resolveAuthenticatedUserId(req);

    // Guest product hydration (no user data accessed)
    if (!userId) {
      if (guestIdsParam !== null) {
        const guestIds = guestIdsParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => z.string().uuid().safeParse(s).success)
          .slice(0, 50);
        const products = await fetchActiveProductsByIds(guestIds);
        return NextResponse.json({
          productIds: products.map((p: any) => p.id),
          products,
        });
      }
      return NextResponse.json({ error: 'Unauthorized: You must be signed in to view your wishlist.' }, { status: 401 });
    }

    const docs = await firestoreService.getSubcollectionDocs('users', userId, 'wishlist');
    docs.sort((a: any, b: any) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')));
    const savedIds = docs
      .map((d: any) => d.productId || d.id)
      .filter((id: any) => typeof id === 'string' && z.string().uuid().safeParse(id).success);

    const idsOnly = searchParams.get('idsOnly') === 'true';
    const products = await fetchActiveProductsByIds(savedIds);
    const validIds = products.map((p: any) => p.id);

    if (idsOnly) {
      return NextResponse.json({ productIds: validIds });
    }

    const sizeMap = new Map(docs.map((d: any) => [d.productId || d.id, d.size]));
    const enriched = products.map((p: any) => ({
      ...p,
      savedSize: sizeMap.get(p.id) || null,
    }));

    return NextResponse.json({ productIds: validIds, products: enriched });
  } catch (error: any) {
    console.error('[API /api/wishlist GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limitRes = await rateLimitCheckoutFlow(ip);
    if (!limitRes.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limitRes.reset) } });
    }

    const userId = await resolveAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: You must be signed in to add to wishlist.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { productId, productIds, size } = parsed.data;
    const idsToSave = productIds && productIds.length > 0 ? productIds : (productId ? [productId] : []);
    const nowIso = new Date().toISOString();

    await Promise.all(
      idsToSave.map((pid) =>
        firestoreService.setSubcollectionDoc('users', userId, 'wishlist', pid, {
          productId: pid,
          addedAt: nowIso,
          ...(size ? { size } : {}),
        })
      )
    );

    return NextResponse.json({ success: true, count: idsToSave.length });
  } catch (error: any) {
    console.error('[API /api/wishlist POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limitRes = await rateLimitCheckoutFlow(ip);
    if (!limitRes.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limitRes.reset) } });
    }

    const userId = await resolveAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: You must be signed in to modify wishlist.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await firestoreService.deleteSubcollectionDoc('users', userId, 'wishlist', parsed.data.productId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/wishlist DELETE Error]:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
