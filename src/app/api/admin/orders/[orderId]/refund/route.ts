export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/orchestration/audit-service';

const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('initiated'), refundRef: z.string().min(3).max(100) }),
  z.object({ action: z.literal('completed') }),
]);

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  // 1. Admin auth
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;
  const adminCtx = authResult as { email: string };

  const { orderId } = params;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    body = BodySchema.parse(raw);
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid request body', details: e?.errors }, { status: 400 });
  }

  try {
    const [order] = await db
      .select({
        id: schema.orders.id,
        order_number: schema.orders.order_number,
        refund_status: schema.orders.refund_status,
        status: schema.orders.status,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'cancelled') {
      return NextResponse.json({ error: 'Order is not cancelled — cannot update refund status' }, { status: 400 });
    }

    if (body.action === 'initiated') {
      // Idempotent: if already initiated/completed, return 200
      if (order.refund_status === 'initiated' || order.refund_status === 'completed') {
        return NextResponse.json({ success: true, message: 'Refund already in progress or completed' });
      }

      await db
        .update(schema.orders)
        .set({ refund_status: 'initiated', refund_ref: body.refundRef, updated_at: new Date() })
        .where(eq(schema.orders.id, orderId));

      await writeAuditLog({
        orderId,
        action: 'REFUND_INITIATED',
        workerId: adminCtx.email,
        details: { refundRef: body.refundRef, adminEmail: adminCtx.email },
      });
    } else if (body.action === 'completed') {
      if (order.refund_status === 'completed') {
        return NextResponse.json({ success: true, message: 'Refund already completed' });
      }
      if (order.refund_status !== 'initiated') {
        return NextResponse.json({ error: 'Refund must be initiated before marking completed' }, { status: 400 });
      }

      await db
        .update(schema.orders)
        .set({ refund_status: 'completed', refunded_at: new Date(), updated_at: new Date() })
        .where(eq(schema.orders.id, orderId));

      await writeAuditLog({
        orderId,
        action: 'REFUND_COMPLETED',
        workerId: adminCtx.email,
        details: { adminEmail: adminCtx.email },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Refund] Error:', err?.message);
    return NextResponse.json({ error: 'Failed to update refund status' }, { status: 500 });
  }
}

