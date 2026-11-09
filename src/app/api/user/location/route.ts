export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const LocationUpdateSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  area: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  source: z.enum(['geolocation', 'manual']).optional().default('manual'),
});

// GET: Fetch default saved location
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [addr] = await db
      .select()
      .from(schema.addresses)
      .where(and(eq(schema.addresses.user_id, userId), eq(schema.addresses.is_default, true)))
      .limit(1);

    if (!addr) {
      return NextResponse.json({ location: null });
    }

    return NextResponse.json({
      location: {
        id: addr.id,
        pincode: addr.pincode,
        area: addr.area || '',
        city: addr.city,
        state: addr.state,
        line1: addr.line1,
        line2: addr.line2 || '',
        source: addr.location_source || 'manual',
        updatedAt: addr.location_updated_at || addr.updated_at,
      },
    });
  } catch (err: any) {
    console.error('[Location GET Error]:', err);
    return NextResponse.json({ error: 'Failed to load location' }, { status: 500 });
  }
}

// POST: Save or update default location
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = await rateLimit(`loc:save:${userId}`, 10, 60000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = LocationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || 'Invalid location data' }, { status: 400 });
    }

    const { pincode, city, state, area, line1, line2, source } = parsed.data;

    // Check user phone
    const [user] = await db
      .select({ phone: schema.users.phone, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const now = new Date();
    const [existingDefault] = await db
      .select({ id: schema.addresses.id })
      .from(schema.addresses)
      .where(and(eq(schema.addresses.user_id, userId), eq(schema.addresses.is_default, true)))
      .limit(1);

    const finalLine1 = line1?.trim() || area?.trim() || `${city}, ${state}`;

    if (existingDefault) {
      await db
        .update(schema.addresses)
        .set({
          pincode,
          city,
          state,
          area: area || null,
          line1: finalLine1,
          line2: line2 || null,
          location_source: source,
          location_updated_at: now,
          updated_at: now,
        })
        .where(eq(schema.addresses.id, existingDefault.id));
    } else {
      await db.insert(schema.addresses).values({
        user_id: userId,
        name: user?.name || 'Customer',
        phone: user?.phone || '9999999999',
        pincode,
        city,
        state,
        area: area || null,
        line1: finalLine1,
        line2: line2 || null,
        is_default: true,
        location_source: source,
        location_updated_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Location POST Error]:', err);
    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
  }
}

// DELETE: Clear saved location
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db
      .delete(schema.addresses)
      .where(and(eq(schema.addresses.user_id, userId), eq(schema.addresses.is_default, true)));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Location DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to clear location' }, { status: 500 });
  }
}

