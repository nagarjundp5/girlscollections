export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

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
    const { userId } = await auth();
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limiter = await rateLimit(`cart_${userId}_${ip}`, 60, 60000);
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = syncCartSchema.parse(body);

    const [updated] = await db
      .insert(schema.userCarts)
      .values({
        user_id: userId,
        items: parsed.items,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.userCarts.user_id,
        set: {
          items: parsed.items,
          updated_at: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ items: updated.items });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    console.error('[Cart POST Error]:', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

