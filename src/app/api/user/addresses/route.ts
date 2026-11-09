export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/getAuthUserId';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
  line1: z.string().min(3, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit PIN code required'),
  is_default: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAddresses = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.user_id, userId))
      .orderBy(desc(schema.addresses.is_default), desc(schema.addresses.created_at));

    return NextResponse.json({ addresses: userAddresses });
  } catch (err: any) {
    console.error('[Addresses GET Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limiter = await rateLimit(`addr_${userId}_${ip}`, 20, 60000);
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = addressSchema.parse(body);

    if (parsed.is_default) {
      await db
        .update(schema.addresses)
        .set({ is_default: false })
        .where(eq(schema.addresses.user_id, userId));
    }

    const [newAddress] = await db
      .insert(schema.addresses)
      .values({
        user_id: userId,
        name: parsed.name,
        phone: parsed.phone,
        line1: parsed.line1,
        line2: parsed.line2 || null,
        city: parsed.city,
        state: parsed.state,
        pincode: parsed.pincode,
        is_default: parsed.is_default || false,
      })
      .returning();

    return NextResponse.json({ address: newAddress });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message || 'Invalid address data' }, { status: 400 });
    }
    console.error('[Addresses POST Error]:', err);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}

