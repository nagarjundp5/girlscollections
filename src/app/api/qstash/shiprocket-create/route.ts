export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { ShiprocketAdapter } from '@/lib/orchestration/providers/shiprocket-adapter';
import { sendOrderSuccessEmail } from '@/lib/email';
import { writeAuditLog } from '@/lib/orchestration/audit-service';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // 1. Verify QStash signature
    const isValid = await verifyQStashSignature(request, rawBody);
    if (!isValid) {
      console.warn('[QStash Shiprocket] Unauthorized QStash signature');
      return NextResponse.json({ error: 'Unauthorized QStash signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload.order_id || payload.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // 2. Fetch order from Neon DB
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      console.warn(`[QStash Shiprocket] Order ${orderId} not found in DB`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. IDEMPOTENCY & CANCELLATION GUARD:
    // If order is cancelled, exit immediately (skip Shiprocket creation & skip confirmation email)
    if (order.status === 'cancelled' || order.order_status === 'CANCELLED') {
      console.log(`[QStash Shiprocket] Order ${order.order_number} is cancelled. Skipping Shiprocket fulfillment.`);
      return NextResponse.json({ message: 'Order was cancelled during 5-minute window. Fulfillment skipped.' });
    }

    // If order already has Shiprocket order, exit immediately (idempotent)
    if (order.shiprocket_order_id) {
      console.log(`[QStash Shiprocket] Order ${order.order_number} already has Shiprocket ID ${order.shiprocket_order_id}.`);
      return NextResponse.json({ message: 'Order already fulfilled with Shiprocket.' });
    }

    // Only fulfill orders that are confirmed / paid
    if (order.status !== 'confirmed' && order.payment_status !== 'paid' && order.payment_status !== 'partially_paid') {
      console.warn(`[QStash Shiprocket] Order ${order.order_number} is not confirmed yet (status: ${order.status}).`);
      return NextResponse.json({ message: 'Order is not in confirmed state yet.' });
    }

    // 4. Create Shiprocket Order
    const isCod = order.payment_mode === 'cod' || order.payment_type === 'cod';
    const remainingPaise = isCod ? (order.cod_balance || (order.total - (order.advance_paid || 20000))) : 0;

    let shipResult;
    try {
      shipResult = await ShiprocketAdapter.createOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address as any,
        items: (order.items as any[]) || [],
        subtotal: order.subtotal,
        total: order.total,
        paymentType: isCod ? 'cod' : 'prepaid',
        remainingAmount: remainingPaise,
      });
    } catch (shipErr: any) {
      console.error(`[QStash Shiprocket] Failed to create Shiprocket order for ${order.order_number}:`, shipErr);
      
      // Flag order for admin attention
      await db
        .update(schema.orders)
        .set({
          needs_attention: true,
          notes: `Shiprocket creation failed: ${shipErr?.message || 'Unknown error'}`,
          updated_at: new Date(),
        })
        .where(eq(schema.orders.id, order.id));

      await writeAuditLog({
        orderId: order.id,
        action: 'SHIPROCKET_CREATION_FAILED',
        details: { error: shipErr?.message },
      });

      // Throw 500 so QStash retries according to retry policy
      throw shipErr;
    }

    // 5. Update Neon order with Shiprocket tracking info
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        status: 'shiprocket_created',
        order_status: 'DISPATCHED_SHIPROCKET',
        shiprocket_order_id: shipResult.shipmentId,
        awb_code: shipResult.awbCode,
        courier_name: shipResult.courierName,
        tracking_url: shipResult.trackingUrl,
        updated_at: new Date(),
      })
      .where(eq(schema.orders.id, order.id))
      .returning();

    // 6. Send Branded Order Confirmation Email via Resend
    // Failures must never break the order fulfillment flow
    try {
      await sendOrderSuccessEmail({
        orderNumber: updatedOrder.order_number,
        customerName: updatedOrder.customer_name,
        customerEmail: updatedOrder.customer_email,
        items: (updatedOrder.items as any[]) || [],
        totalPaise: updatedOrder.total,
        discountAmountPaise: updatedOrder.discount_amount || 0,
        shippingChargePaise: updatedOrder.shipping_charge || 0,
        fulfillmentType: updatedOrder.fulfillment_type || 'delivery',
        pickupCode: updatedOrder.pickup_code || null,
        paymentMode: (updatedOrder.payment_mode as 'prepaid' | 'cod') || 'prepaid',
        advancePaid: updatedOrder.advance_paid || 0,
        codBalance: updatedOrder.cod_balance || 0,
        shippingAddress: updatedOrder.shipping_address as any,
        awb: (updatedOrder as any).awb_code || (updatedOrder as any).awb || undefined,
        courierName: (updatedOrder as any).courier_name || (updatedOrder as any).courier || undefined,
      });
      console.log(`[QStash Shiprocket] Confirmation email sent for ${updatedOrder.order_number}`);
    } catch (emailErr) {
      console.error(`[QStash Shiprocket] Non-fatal confirmation email error for ${updatedOrder.order_number}:`, emailErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.order_number,
      shiprocketOrderId: shipResult.shipmentId,
      awb: shipResult.awbCode,
    });
  } catch (err: any) {
    console.error('[QStash Shiprocket Handler Exception]:', err);
    return NextResponse.json({ error: err?.message || 'Shiprocket job processing failed' }, { status: 500 });
  }
}

