export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { computeOrderFinancials } from '@/lib/checkout-service';
import { checkRateLimit } from '@/lib/orchestration/rate-limiter';

const ComputeTotalsSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  paymentMode: z.enum(['prepaid', 'cod']),
  phone: z.string().optional().nullable(),
  deliveryType: z.enum(['delivery', 'pickup']).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData.userId;
  } catch {
    // Guest user
  }

  const { success } = await checkRateLimit({
    endpoint: 'checkout',
    userId,
    ip,
  });

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = ComputeTotalsSchema.parse(body);

    const financials = await computeOrderFinancials({
      items: parsed.items,
      paymentMode: parsed.paymentMode,
      userId,
      phone: parsed.phone,
      deliveryType: parsed.deliveryType,
    });

    return NextResponse.json({ success: true, financials });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: (err as any).issues || (err as any).errors }, { status: 400 });
    }
    console.error('[ComputeTotals API Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to compute totals' }, { status: 400 });
  }
}
