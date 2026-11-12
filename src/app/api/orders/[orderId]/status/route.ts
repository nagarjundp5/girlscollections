export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { firestoreService } from '@/lib/firestore';

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // 1. Check Neon DB
    const [order] = await db
      .select({
        id: schema.orders.id,
        order_number: schema.orders.order_number,
        status: schema.orders.status,
        payment_status: schema.orders.payment_status,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (order) {
      return NextResponse.json({
        confirmed: true,
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
      });
    }

    // 2. Check Firestore pending_checkouts or paid_unfulfilled
    const pending = await firestoreService.getDoc('pending_checkouts', orderId);
    if (pending) {
      return NextResponse.json({
        confirmed: pending.status === 'paid',
        pendingConfirmation: true,
        orderId,
        orderNumber: pending.order_number,
        message: 'Payment received, confirming your order...',
      });
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (err: any) {
    console.error('Order status check error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}

