export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { verifyCsrfOrigin } from '@/lib/csrf';
import { callShiprocketApi } from '@/lib/orchestration/providers/shiprocket-logger';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  const { orderId } = params;

  try {

    const body = await request.json();
    const { trackingNumber, courierPartner } = body;

    // 1. Fetch order details from database
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate total weight (defaulting to 500g per item if missing/invalid)
    const totalWeightGrams = order.items.reduce((acc: number, item: any) => {
      const w = item.weight_grams ?? 500;
      return acc + (w * item.quantity);
    }, 0);

    let finalShippingCharge: number | undefined = undefined;

    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;
    const isShiprocketConfigured =
      shiprocketEmail &&
      shiprocketPassword &&
      !shiprocketEmail.includes('placeholder') &&
      !shiprocketPassword.includes('placeholder');

    let awb = trackingNumber || '';
    let courierName = courierPartner || '';
    let shiprocketOrderId: string | null = null;
    const shippingAddr = order.shipping_address as any;

    let courierProvider = order.courier_provider || 'shiprocket';
    if (body.fallbackToShiprocket || body.provider === 'shiprocket') {
      courierProvider = 'shiprocket';
    }

    if (courierProvider === 'borzo') {
      // Fetch store pickup address
      const dbSettings = await db.select().from(schema.settings);
      let borzoPickupAddress = 'North Hanuman Temple, 3, NAT Street, DV Gundappa Rd, Gandhi Bazaar, Basavanagudi, Bengaluru, Karnataka 560004';
      dbSettings.forEach((row: any) => {
        if (row.key === 'borzo_pickup_address') borzoPickupAddress = row.value;
      });

      const borzoKey = process.env.BORZO_API_KEY;
      const isMock = !borzoKey || borzoKey.includes('placeholder') || borzoKey.includes('mock');

      if (isMock) {
        if (!awb) {
          awb = `BZ-${order.order_number}-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        if (!courierName) {
          courierName = 'Borzo Express';
        }
      } else {
        try {
          const endpoint = process.env.BORZO_API_URL_CREATE || 'https://robot.borzodelivery.com/api/business/1.8/create-order';
          const payload = {
            points: [
              {
                address: borzoPickupAddress,
                contact_person: {
                  phone: '919844371705',
                  name: 'The Girls Collections Dispatch Desk'
                }
              },
              {
                address: shippingAddr ? `${shippingAddr.line1}, ${shippingAddr.line2 || ''}, ${shippingAddr.city} - ${shippingAddr.pincode}` : 'Bengaluru',
                contact_person: {
                  phone: order.customer_phone.replace('+91', '').trim(),
                  name: order.customer_name
                }
              }
            ],
            matter: `Streetwear Order ${order.order_number}`,
            total_weight_kg: totalWeightGrams / 1000,
            vehicle_type: 8, // Motorbike
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-DV-Auth-Token': borzoKey,
            },
            body: JSON.stringify(payload),
          });

          const resData = await response.json();

          if (response.ok && resData.is_successful !== false && resData.order?.id) {
            awb = String(resData.order.id);
            courierName = 'Borzo Express';
            console.log('[Borzo API Order Created]', awb);
          } else {
            console.error('[Borzo API Order Creation Failed]:', resData);
            throw new Error(`Borzo API failed: ${JSON.stringify(resData.parameter_errors || resData)}`);
          }
        } catch (apiErr: any) {
          console.warn(`[Borzo API Fail] Downgrading order ${order.order_number} to Shiprocket. Error:`, apiErr.message);
          courierProvider = 'shiprocket';

          // 1. Calculate refund amount
          let defaultShippingCharge = 9900;
          let freeShippingThreshold = 99900;
          const dbSettings = await db.select().from(schema.settings);
          dbSettings.forEach((row: any) => {
            if (row.key === 'free_shipping_threshold') freeShippingThreshold = Number(row.value);
            if (row.key === 'default_shipping_charge') defaultShippingCharge = Number(row.value);
          });
          const standardCharge = order.subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
          const refundAmountPaise = Math.max(0, order.shipping_charge - standardCharge);
          finalShippingCharge = standardCharge;

          // 2. Process Razorpay refund if applicable
          let refundStatus = 'Not Eligible (Manual/Unpaid)';
          if (refundAmountPaise > 0 && order.payment_id && order.payment_status === 'paid') {
            try {
              const { razorpay } = await import('@/lib/razorpay');
              if (razorpay) {
                await razorpay.payments.refund(order.payment_id, {
                  amount: refundAmountPaise,
                  notes: {
                    reason: 'Borzo express delivery failed, downgraded to standard shipping.',
                    order_number: order.order_number
                  }
                });
                refundStatus = 'Automated Razorpay Refund Initiated';
              }
            } catch (refundErr: any) {
              console.error('[Refund Error]:', refundErr);
              refundStatus = `Failed to process refund: ${refundErr.message || 'Unknown error'}`;
            }
          }

          // 3. Send Admin Alert Email
          try {
            const { sendAdminFallbackAlertEmail } = await import('@/lib/email');
            await sendAdminFallbackAlertEmail({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              deliveryProvider: 'Borzo',
              failureReason: apiErr.message || 'Unknown API failure',
              refundStatus,
              refundAmountPaise,
            });
          } catch (emailErr) {
            console.error('[Email Notification Error]:', emailErr);
          }
        }
      }
    }

    if (courierProvider === 'shiprocket') {
      // Shiprocket flow
      if (!courierName) {
        courierName = 'Shiprocket Partner';
      }
      if (isShiprocketConfigured && !trackingNumber) {
        console.log('Shiprocket configuration found. Attempting automatic shipment creation...');
        try {
          const { ShiprocketAdapter } = await import('@/lib/orchestration/providers/shiprocket-adapter');
          const isCod =
            order.payment_mode === 'cod' ||
            order.payment_type === 'cod' ||
            order.payment_status === 'partially_paid';
          const remainingPaise = isCod
            ? (order.cod_balance || order.remaining_amount || Math.max(0, order.total - (order.advance_paid || 20000)))
            : 0;

          const shipResult = await ShiprocketAdapter.createOrder({
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            shippingAddress: shippingAddr,
            items: (order.items as any[]) || [],
            subtotal: order.subtotal,
            total: order.total,
            paymentType: isCod ? 'cod' : 'prepaid',
            remainingAmount: remainingPaise,
          });

          shiprocketOrderId = shipResult.shipmentId;
          awb = shipResult.awbCode;
          courierName = shipResult.courierName || 'Shiprocket Partner';
        } catch (err: any) {
          console.error('Shiprocket API integration exception:', err);
          return NextResponse.json(
            { error: `Shiprocket API failed: ${err.message || 'Unknown error'}. Please try manual tracking details instead.` },
            { status: 502 }
          );
        }
      } else {
        // Manual input flow
        if (!awb || !courierName) {
          return NextResponse.json(
            { error: 'Tracking number and courier partner are required for manual booking' },
            { status: 400 }
          );
        }
      }
    }

    // 2. Update order in Neon DB using Drizzle
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        tracking_number: awb,
        courier_partner: courierName,
        courier_provider: courierProvider,
        shiprocket_order_id: shiprocketOrderId,
        order_status: 'shipped',
        ...(finalShippingCharge !== undefined ? { shipping_charge: finalShippingCharge } : {}),
        updated_at: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order tracking details' }, { status: 500 });
    }

    // 2b. Write tracking to Firestore in-place (routine tracking state)
    const { firestoreService } = await import('@/lib/firestore');
    await firestoreService.setDoc('order_tracking', orderId, {
      order_id: orderId,
      order_number: updatedOrder.order_number,
      courier_provider: courierProvider,
      tracking_number: awb,
      status: 'shipped',
      status_label: 'Shipped & Handed over to Courier',
      updated_at: new Date().toISOString(),
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order tracking details' }, { status: 500 });
    }

    // 3. Send tracking WhatsApp update to customer via Make.com
    if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
      fetch(MAKE_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_shipped',
          order_number: updatedOrder.order_number,
          customer_name: updatedOrder.customer_name,
          customer_phone: updatedOrder.customer_phone,
          tracking_number: awb,
          courier_partner: courierName,
          tracking_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegirlscollections.com'}/track?orderNumber=${updatedOrder.order_number}&phone=${updatedOrder.customer_phone}`,
        }),
      }).catch((err) => console.error('Make.com shipping notification failed:', err));
    }

    return NextResponse.json({
      success: true,
      awb,
      courier_partner: courierName,
      status: 'shipped',
    });

  } catch (error) {
    console.error(`Admin shipment booking exception for order ${orderId}:`, error);
    return NextResponse.json({ error: 'An unexpected shipment server error occurred' }, { status: 500 });
  }
}
