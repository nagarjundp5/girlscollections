export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import crypto from 'crypto';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPaymentSchema } from '@/lib/validations';
import { auth } from '@clerk/nextjs/server';
import { razorpay } from '@/lib/razorpay';
import { verifyToken } from '@/lib/jwt';
import { sendRefundEmail, sendOrderSuccessEmail, sendDepositConfirmationEmail } from '@/lib/email';
import { firestoreService } from '@/lib/firestore';
import { confirmAndWriteOrder } from '@/lib/order-db-helper';
import { notifyAdminOfNewOrder } from '@/lib/push';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  let reqBody: any = null;

  try {
    // 0. Verify authentication
    let finalUserId: string | null = null;
    const rawCookie = request.headers.get('cookie') || '';
    const sessionToken = rawCookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('tgc_session='))
      ?.split('=')?.[1];

    if (sessionToken) {
      const payload = await verifyToken(sessionToken);
      if (payload && payload.userId) {
        finalUserId = payload.userId as string;
      }
    }

    if (!finalUserId) {
      try {
        const { userId } = await auth();
        if (userId) {
          finalUserId = userId;
        }
      } catch (e) {
        console.warn('[Verify Payment API] Failed to retrieve Clerk auth session:', e);
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to verify payment.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    reqBody = body;

    // 1. Zod input validation
    const validationResult = verifyPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid payment verification details' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID reference' }, { status: 400 });
    }

    // Validate orderId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    // 2. Fetch checkout from Firestore
    const checkout = await firestoreService.getDoc('pending_checkouts', orderId);
    if (!checkout) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 });
    }

    // 3. Prevent double processing (check Neon DB)
    const [existingNeonOrder] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (existingNeonOrder && existingNeonOrder.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        orderNumber: existingNeonOrder.order_number,
        message: 'Order already processed',
      });
    }

    // 4. Verify Razorpay Signature
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let paymentAmountVerified = true;

    if (!isMockOrder) {
      if (!secret) {
        console.error('RAZORPAY_KEY_SECRET is missing in environment variables');
        return NextResponse.json({ error: 'Gateway configuration error' }, { status: 500 });
      }

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf-8'),
          Buffer.from(razorpay_signature, 'utf-8')
        );
      } catch (err) {
        isValid = false;
      }

      if (!isValid) {
        console.warn(`[FRAUD ALERT] Mismatch signature! IP: ${ip}, Order: ${orderId}, Time: ${new Date().toISOString()}`);
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }

      // Fetch payment from Razorpay API to prevent amount tampering
      try {
        if (razorpay) {
          const rzPayment = await razorpay.payments.fetch(razorpay_payment_id);
          const expectedAmount = checkout.payment_type === 'cod_with_deposit' ? 20000 : checkout.total;
          if (rzPayment.amount !== expectedAmount) {
            console.error(`[FRAUD ALERT] Razorpay payment amount ${rzPayment.amount} does not match expected total ${expectedAmount}! IP: ${ip}, Order: ${checkout.order_number}`);
            paymentAmountVerified = false;
          }
        }
      } catch (err) {
        console.error('Failed to fetch Razorpay payment entity:', err);
        return NextResponse.json({ error: 'Failed to verify payment amount with gateway' }, { status: 400 });
      }
    }

    if (!paymentAmountVerified) {
      // Flag in Firestore
      await firestoreService.updateDoc('pending_checkouts', orderId, {
        status: 'payment_mismatch',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({ 
        error: 'Payment amount mismatch detected. Order flagged for manual review.', 
        code: 'PAYMENT_MISMATCH' 
      }, { status: 400 });
    }

    // 5. Commit to Neon Postgres and update status
    const confirmedOrder = await confirmAndWriteOrder(checkout, razorpay_payment_id);

    // Update Firestore checkout doc
    await firestoreService.updateDoc('pending_checkouts', orderId, {
      status: 'paid',
      payment_id: razorpay_payment_id,
      updated_at: new Date().toISOString(),
    });

    if (!confirmedOrder) {
      return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
    }

    // 6. Fire admin order push notification (fire-and-forget — must never block checkout response)
    notifyAdminOfNewOrder({
      id: confirmedOrder.id,
      order_number: confirmedOrder.order_number,
      customer_name: confirmedOrder.customer_name,
      items: (confirmedOrder.items as any[]).map((i) => ({ name: i.name, quantity: i.quantity })),
      total: confirmedOrder.total,
      payment_type: confirmedOrder.payment_type,
    }).catch((err) => console.error('[verify-payment] Admin order push notification failed:', err));

    // 7. Fire Make.com WhatsApp Webhook (Fire-and-forget)
    if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
      const itemsList = confirmedOrder.items
        .map((i: any) => `${i.name} (${i.size}) x${i.quantity}`)
        .join(', ');

      fetch(MAKE_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_confirmed',
          order_number: confirmedOrder.order_number,
          total: confirmedOrder.total,
          customer_name: confirmedOrder.customer_name,
          customer_phone: confirmedOrder.customer_phone,
          items: itemsList,
        }),
      }).catch((err) => console.error('Make.com WhatsApp Webhook execution failed:', err));
    }

    // 7. Send Order Success Email or COD Deposit Confirmation Email (Fire-and-forget)
    if (confirmedOrder.payment_type === 'cod_with_deposit') {
      sendDepositConfirmationEmail({
        orderNumber: confirmedOrder.order_number,
        customerName: confirmedOrder.customer_name,
        customerEmail: confirmedOrder.customer_email,
        items: confirmedOrder.items as any[],
        totalPaise: confirmedOrder.total,
        shippingChargePaise: confirmedOrder.shipping_charge,
        discountAmountPaise: confirmedOrder.discount_amount || 0,
        fulfillmentType: confirmedOrder.fulfillment_type,
        pickupCode: confirmedOrder.pickup_code,
        shippingAddress: confirmedOrder.shipping_address,
      }).catch((err) => console.error('Failed to send COD deposit confirmation email:', err));
    } else {
      sendOrderSuccessEmail({
        orderNumber: confirmedOrder.order_number,
        customerName: confirmedOrder.customer_name,
        customerEmail: confirmedOrder.customer_email,
        items: confirmedOrder.items as any[],
        totalPaise: confirmedOrder.total,
        shippingChargePaise: confirmedOrder.shipping_charge,
        discountAmountPaise: confirmedOrder.discount_amount || 0,
        fulfillmentType: confirmedOrder.fulfillment_type,
        pickupCode: confirmedOrder.pickup_code,
        shippingAddress: confirmedOrder.shipping_address,
      }).catch((err) => console.error('Failed to send order success email:', err));
    }

    return NextResponse.json({
      success: true,
      orderNumber: confirmedOrder.order_number,
      orderId: confirmedOrder.id,
    });

  } catch (error: any) {
    console.error('Server error during payment verification:', error);

    // Auto-refund logic if stock is somehow out (e.g. hold expired)
    if (error.message && error.message.startsWith('OUT_OF_STOCK_REFUND:')) {
      const productName = error.message.split('OUT_OF_STOCK_REFUND:')[1];
      const orderId = reqBody?.orderId;
      const razorpay_payment_id = reqBody?.razorpay_payment_id;

      try {
        const checkout = await firestoreService.getDoc('pending_checkouts', orderId);
        if (checkout) {
          const refundAmount = checkout.payment_type === 'cod_with_deposit' ? 20000 : checkout.total;
          
          if (razorpay) {
            console.log(`[AUTO-REFUND] Triggering refund for order ${checkout.order_number}, amount: ${refundAmount}`);
            await razorpay.payments.refund(razorpay_payment_id, {
              amount: refundAmount,
              notes: {
                reason: `Stock sold out before payment completed (late payment for ${productName})`,
                order_id: checkout.id,
                order_number: checkout.order_number
              }
            });
          }

          await firestoreService.updateDoc('pending_checkouts', orderId, {
            status: 'failed',
            payment_status: 'refunded',
            payment_id: razorpay_payment_id,
            updated_at: new Date().toISOString(),
          });

          sendRefundEmail({
            orderNumber: checkout.order_number,
            customerName: checkout.customer_name,
            customerEmail: checkout.customer_email,
            productName,
            refundAmountPaise: refundAmount,
          });
        }
      } catch (refundErr) {
        console.error('Failed to auto-refund after stock out:', refundErr);
      }

      return NextResponse.json({
        error: `Checkout time limit exceeded. The item "${productName}" has sold out. A full refund has been automatically initiated to your original payment method.`,
        code: 'OUT_OF_STOCK_REFUNDED'
      }, { status: 400 });
    }

    try {
      const { captureException, setTag } = await import('@sentry/nextjs');
      setTag("order_id", reqBody?.orderId || 'unknown');
      setTag("payment_id", reqBody?.razorpay_payment_id || 'unknown');
      captureException(error);
    } catch (sentryErr) {
      console.error('Sentry reporting failed:', sentryErr);
    }

    // NEVER lose a paid order: If order creation failed after payment signature/amount was verified,
    // persist paid_unfulfilled record, queue QStash retry, and return 200 so customer never sees raw 500.
    const orderId = reqBody?.orderId;
    const razorpay_payment_id = reqBody?.razorpay_payment_id;
    const razorpay_order_id = reqBody?.razorpay_order_id;
    let checkout = null;
    try {
      if (orderId) {
        checkout = await firestoreService.getDoc('pending_checkouts', orderId);
      }
    } catch (fGetErr) {
      console.error('Failed to get pending checkout for recovery:', fGetErr);
    }

    const unfulfilledDoc = {
      orderId,
      orderNumber: checkout?.order_number || orderId,
      razorpayOrderId: razorpay_order_id || checkout?.razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      cartSnapshot: checkout ? {
        items: checkout.items,
        total: checkout.total,
        customer_name: checkout.customer_name,
        customer_email: checkout.customer_email,
        customer_phone: checkout.customer_phone,
        shipping_address: checkout.shipping_address,
        fulfillment_type: checkout.fulfillment_type,
        payment_type: checkout.payment_type,
        discount_code: checkout.discount_code,
        discount_amount: checkout.discount_amount,
      } : null,
      user: {
        userId: checkout?.user_id || null,
        name: checkout?.customer_name || 'Customer',
        email: checkout?.customer_email,
        phone: checkout?.customer_phone,
      },
      error: error?.message || String(error),
      attempts: 1,
      status: 'pending_recovery',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await firestoreService.setDoc('paid_unfulfilled', razorpay_payment_id || orderId, unfulfilledDoc);
    } catch (unfulfilledErr) {
      console.error('[paid_unfulfilled] Failed to write doc to Firestore:', unfulfilledErr);
    }

    // Queue QStash recovery retry (max 5, exponential backoff)
    if (process.env.QSTASH_TOKEN) {
      try {
        const { Client } = await import('@upstash/qstash');
        const { getSiteUrl, getQStashPublishHeaders } = await import('@/lib/getSiteUrl');
        const client = new Client({ token: process.env.QSTASH_TOKEN });
        await client.publishJSON({
          url: `${getSiteUrl()}/api/webhooks/qstash/order-recovery`,
          body: {
            orderId,
            razorpayPaymentId: razorpay_payment_id,
            attempt: 1,
          },
          delay: 10,
          headers: getQStashPublishHeaders(),
        });
      } catch (qErr) {
        console.error('[Order Recovery QStash] Dispatch error:', qErr);
      }
    }

    return NextResponse.json({
      success: true,
      pendingConfirmation: true,
      orderId,
      orderNumber: checkout?.order_number || orderId,
      message: 'Payment received, confirming your order...',
    }, { status: 200 });
  }
}
