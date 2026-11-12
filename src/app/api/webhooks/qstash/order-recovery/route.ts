export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { firestoreService } from '@/lib/firestore';
import { confirmAndWriteOrder } from '@/lib/order-db-helper';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { razorpay } from '@/lib/razorpay';
import { Client } from '@upstash/qstash';
import { getSiteUrl, getQStashPublishHeaders } from '@/lib/getSiteUrl';

/**
 * POST /api/webhooks/qstash/order-recovery
 *
 * Durable background recovery worker for paid unfulfilled orders.
 * Guaranteed idempotency: if order is already written, commits nothing and marks recovered.
 * Retries up to 5 times with exponential backoff; if permanent failure, initiates auto-refund.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const isValid = await verifyQStashSignature(request, rawBody);
    if (!isValid) {
      console.warn('[OrderRecovery Worker] Unauthorized signature');
      return NextResponse.json({ error: 'Unauthorized QStash signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { orderId, razorpayPaymentId, attempt = 1 } = payload;

    if (!razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing razorpayPaymentId' }, { status: 400 });
    }

    console.log(`[OrderRecovery Worker] Processing recovery for payment ${razorpayPaymentId}, order ${orderId}, attempt ${attempt}`);

    // 1. Idempotency Check: see if order or payment already exists in Neon DB
    const [existingPayment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.razorpay_payment_id, razorpayPaymentId))
      .limit(1);

    if (existingPayment) {
      console.log(`[OrderRecovery Worker] Order already committed for payment ${razorpayPaymentId}. Marking recovered.`);
      await firestoreService.updateDoc('paid_unfulfilled', razorpayPaymentId, {
        status: 'recovered',
        order_id: existingPayment.order_id,
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: 'Already committed' });
    }

    // 2. Fetch checkout doc
    let checkout = null;
    if (orderId) {
      checkout = await firestoreService.getDoc('pending_checkouts', orderId);
    }
    if (!checkout) {
      const unfulfilled = await firestoreService.getDoc('paid_unfulfilled', razorpayPaymentId);
      if (unfulfilled?.cartSnapshot) {
        checkout = {
          id: unfulfilled.orderId || orderId,
          order_number: unfulfilled.orderNumber,
          user_id: unfulfilled.user?.userId,
          customer_name: unfulfilled.user?.name,
          customer_email: unfulfilled.user?.email,
          customer_phone: unfulfilled.user?.phone,
          shipping_address: unfulfilled.cartSnapshot.shippingAddress || unfulfilled.cartSnapshot.shipping_address,
          items: unfulfilled.cartSnapshot.items,
          subtotal: unfulfilled.cartSnapshot.subtotal || unfulfilled.cartSnapshot.total,
          total: unfulfilled.cartSnapshot.total,
          shipping_charge: unfulfilled.cartSnapshot.shippingCharge || unfulfilled.cartSnapshot.shipping_charge || 0,
          discount_code: unfulfilled.cartSnapshot.discountCode || unfulfilled.cartSnapshot.discount_code,
          discount_amount: unfulfilled.cartSnapshot.discountAmount || unfulfilled.cartSnapshot.discount_amount || 0,
          fulfillment_type: unfulfilled.cartSnapshot.fulfillmentType || unfulfilled.cartSnapshot.fulfillment_type || 'delivery',
          payment_type: unfulfilled.cartSnapshot.paymentType || unfulfilled.cartSnapshot.payment_type || 'prepaid',
          deposit_amount: unfulfilled.cartSnapshot.deposit_amount,
          razorpay_order_id: unfulfilled.razorpayOrderId,
        };
      }
    }

    if (!checkout) {
      console.error(`[OrderRecovery Worker] No checkout found for payment ${razorpayPaymentId}`);
      return NextResponse.json({ error: 'Checkout not found' }, { status: 404 });
    }

    // 3. Attempt to confirm and write order
    try {
      const confirmedOrder = await confirmAndWriteOrder(checkout, razorpayPaymentId);
      console.log(`[OrderRecovery Worker] Order ${confirmedOrder.order_number} successfully recovered for payment ${razorpayPaymentId}`);

      await firestoreService.updateDoc('paid_unfulfilled', razorpayPaymentId, {
        status: 'recovered',
        order_id: confirmedOrder.id,
        order_number: confirmedOrder.order_number,
        updated_at: new Date().toISOString(),
      });

      if (orderId) {
        await firestoreService.updateDoc('pending_checkouts', orderId, {
          status: 'paid',
          payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, orderNumber: confirmedOrder.order_number });
    } catch (createErr: any) {
      console.error(`[OrderRecovery Worker] Recovery attempt ${attempt} failed:`, createErr);

      if (attempt < 5) {
        const nextAttempt = attempt + 1;
        const delaySeconds = Math.min(180, Math.pow(2, attempt) * 15); // 15s, 30s, 60s, 120s

        if (process.env.QSTASH_TOKEN) {
          const client = new Client({ token: process.env.QSTASH_TOKEN });
          await client.publishJSON({
            url: `${getSiteUrl()}/api/webhooks/qstash/order-recovery`,
            body: {
              orderId,
              razorpayPaymentId,
              attempt: nextAttempt,
            },
            delay: delaySeconds,
            headers: getQStashPublishHeaders(),
          });
        }

        await firestoreService.updateDoc('paid_unfulfilled', razorpayPaymentId, {
          attempts: nextAttempt,
          last_error: createErr?.message || String(createErr),
          updated_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: false, message: `Requeued attempt ${nextAttempt} in ${delaySeconds}s` });
      } else {
        // Max retries exceeded -> initiate auto-refund to protect customer money
        console.error(`[OrderRecovery Worker] Max retries (5) reached for payment ${razorpayPaymentId}. Triggering auto-refund.`);
        let refundSuccess = false;

        if (razorpay) {
          try {
            const refundAmount = checkout.payment_type === 'cod_with_deposit' ? 20000 : checkout.total;
            await razorpay.payments.refund(razorpayPaymentId, {
              amount: refundAmount,
              notes: {
                reason: `System unable to create order after payment: ${createErr?.message || 'fulfillment failure'}`,
                order_id: checkout.id,
                order_number: checkout.order_number,
              },
            });
            refundSuccess = true;
          } catch (refErr) {
            console.error('[OrderRecovery Worker] Razorpay refund error:', refErr);
          }
        }

        await firestoreService.updateDoc('paid_unfulfilled', razorpayPaymentId, {
          status: refundSuccess ? 'auto_refunded' : 'failed_needs_manual_refund',
          final_error: createErr?.message || String(createErr),
          updated_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: false, refunded: refundSuccess, error: 'Max retries exhausted' });
      }
    }
  } catch (err: any) {
    console.error('[OrderRecovery Worker] Fatal exception:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

