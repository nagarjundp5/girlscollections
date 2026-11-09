export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit } from '@/lib/orchestration/rate-limiter';

// GET — check if user has dismissed the offer (for client hydration)
export async function GET(_request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ dismissed: false });

  try {
    const [user] = await db
      .select({ dismissed: schema.users.first_order_offer_dismissed })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    return NextResponse.json({ dismissed: user?.dismissed ?? false });
  } catch {
    return NextResponse.json({ dismissed: false });
  }
}

// POST — persist dismiss flag to Neon
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await checkRateLimit({ endpoint: 'dismiss_offer', userId, ip });
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    await db
      .update(schema.users)
      .set({ first_order_offer_dismissed: true })
      .where(eq(schema.users.id, userId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DismissOffer]', err?.message);
    return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 });
  }
}

