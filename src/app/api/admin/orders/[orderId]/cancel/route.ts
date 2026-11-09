export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ShiprocketAdapter } from '@/lib/orchestration/providers/shiprocket-adapter';
import { writeAuditLog } from '@/lib/orchestration/audit-service';
import { sendCancellationEmail } from '@/lib/email';

const BodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  // 1. Admin auth (server-side allowlist check)
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;
  const adminCtx = authResult as { email: string };

  const { orderId } = params;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  let body: z.infer<typeof BodySchema> = {};
  try {
    const raw = await request.json();
    body = BodySchema.parse(raw);
  } catch {
    // reason is optional
  }

  try {
    const result = await db.transaction(async (tx: any) => {
      const [order] = await tx
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, orderId))
        // @ts-ignore
        .for('update')
        .limit(1);

      if (!order) return { error: 'Order not found', status: 404 };

      // Idempotent
      if (order.status === 'cancelled' || order.order_status === 'CANCELLED') {
        return { alreadyCancelled: true };
      }

      const now = new Date();
      let shiprocketCancelFailed = false;

      // If Shiprocket order exists, cancel it
      if (order.shiprocket_order_id) {
        const { success, error } = await ShiprocketAdapter.cancelOrder(order.shiprocket_order_id);
        if (!success) {
          console.error(`[AdminCancel] Shiprocket cancel failed for order ${order.order_number}:`, error);
          shiprocketCancelFailed = true;
        }
      }

      const refundAmt = (order.advance_paid ?? 0) > 0 ? Number(order.advance_paid) : 0;

      await tx
        .update(schema.orders)
        .set({
          status: 'cancelled',
          order_status: 'CANCELLED',
          cancelled_at: now,
          cancelled_by: 'admin',
          needs_attention: shiprocketCancelFailed,
          ...(refundAmt > 0 && {
            refund_status: 'pending',
            refund_amount: refundAmt,
          }),
          ...(body.reason && { refund_note: body.reason }),
          updated_at: now,
        })
        .where(eq(schema.orders.id, orderId));

      await writeAuditLog({
        orderId: order.id,
        action: 'ADMIN_ORDER_CANCELLED',
        workerId: adminCtx.email,
        details: {
          reason: body.reason,
          shiprocketCancelFailed,
          refundAmt,
          adminEmail: adminCtx.email,
        },
      });

      return { order, refundAmt };
    });

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: (result as any).status ?? 400 });
    }
    if ('alreadyCancelled' in result && result.alreadyCancelled) {
      return NextResponse.json({ success: true, message: 'Already cancelled' });
    }

    // Fire cancellation email non-fatally
    if ('order' in result && result.order) {
      const o = result.order as any;
      sendCancellationEmail({
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        refundAmount: (result as any).refundAmt ?? 0,
        paymentMode: (o.payment_mode ?? 'prepaid') as 'prepaid' | 'cod',
        refundNote: body.reason,
      }).catch((err) => console.error('[AdminCancel] Email error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Order Cancel] Error:', err?.message);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}

