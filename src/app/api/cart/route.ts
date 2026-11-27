export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/getAuthUserId';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimitCheckoutFlow } from '@/lib/rateLimit';

const cartItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  price: z.number().min(0),
  title: z.string().min(1),
  image: z.string().optional().default(''),
  slug: z.string().optional().default(''),
});

const syncCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const [cartRow] = await db
      .select()
      .from(schema.userCarts)
      .where(eq(schema.userCarts.user_id, userId))
      .limit(1);

    return NextResponse.json({ items: cartRow?.items || [] });
  } catch (err: any) {
    console.error('[Cart GET Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limiter = await rateLimitCheckoutFlow(`${userId}_${ip}`);
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = syncCartSchema.parse(body);

    // Validate requested quantities against current DB stock
    if (parsed.items.length > 0) {
      const productIds = Array.from(new Set(parsed.items.map((i) => i.productId)));
      const dbProducts = await db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          stock_quantity: schema.products.stock_quantity,
        })
        .from(schema.products)
        .where(inArray(schema.products.id, productIds));

      const dbSizes = await db
        .select({
          product_id: schema.productSizes.product_id,
          size_key: schema.productSizes.size_key,
          stock: schema.productSizes.stock,
        })
        .from(schema.productSizes)
        .where(inArray(schema.productSizes.product_id, productIds));

      type DbProductRow = typeof dbProducts[number];
      type DbSizeRow = typeof dbSizes[number];
      const prodMap = new Map<string, DbProductRow>(dbProducts.map((p: DbProductRow) => [p.id, p]));
      for (const item of parsed.items) {
        const sizeRow = dbSizes.find(
          (s: DbSizeRow) => s.product_id === item.productId && s.size_key === item.size
        );
        const prod = prodMap.get(item.productId);
        const stockMap = (prod?.stock_quantity as Record<string, any>) || {};
        const available =
          sizeRow?.stock !== undefined && sizeRow?.stock !== null
            ? Number(sizeRow.stock)
            : stockMap[item.size] !== undefined
            ? Number(stockMap[item.size])
            : undefined;

        if (available !== undefined && item.quantity > available) {
          return NextResponse.json(
            {
              error:
                available <= 0
                  ? `"${item.title}" (${item.size}) is out of stock.`
                  : `Only ${available} available for "${item.title}" (${item.size}).`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Compute total in paise (sum of price * qty — price should already be in paise)
    const total = parsed.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const [updated] = await db
      .insert(schema.userCarts)
      .values({
        user_id: userId,
        items: parsed.items,
        total,
        status: 'active',
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.userCarts.user_id,
        set: {
          items: parsed.items,
          total,
          status: 'active',
          updated_at: new Date(),
        },
      })
      .returning();

    // Schedule QStash abandon reminder if QSTASH_TOKEN is set and cart is non-empty
    if (parsed.items.length > 0 && process.env.QSTASH_TOKEN) {
      try {
        const { Client } = await import('@upstash/qstash');
        const { getSiteUrl } = await import('@/lib/getSiteUrl');
        const qClient = new Client({ token: process.env.QSTASH_TOKEN });
        const baseUrl = getSiteUrl();
        // Delay 2 hours = 7200s. QStash deduplication key: cart-{userId}
        await qClient.publishJSON({
          url: `${baseUrl}/api/qstash/cart-reminder`,
          body: { userId, reminderIndex: 1 },
          delay: 7200,
          deduplicationId: `cart-remind-1-${userId}`,
        }).catch(() => {}); // Fire and forget
      } catch {
        // Never block cart save for reminder scheduling
      }
    }

    return NextResponse.json({ items: updated.items });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    console.error('[Cart POST Error]:', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
