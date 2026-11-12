import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from '../src/db';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { firestoreService } from '../src/lib/firestore';
import { confirmAndWriteOrder } from '../src/lib/order-db-helper';
import { normalizeSize } from '../src/lib/normalizeSize';

async function main() {
  const paymentId = process.argv[2]?.trim();

  if (!paymentId) {
    console.error('Usage: npx tsx scripts/recover-order.ts <razorpay_payment_id>');
    process.exit(1);
  }

  console.log(`\n=== [Order Recovery Script] ===`);
  console.log(`Checking recovery for payment ID: ${paymentId}`);

  // 1. Check if already committed in Neon DB
  try {
    const [existingPayment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.razorpay_payment_id, paymentId))
      .limit(1);

    if (existingPayment) {
      const [existingOrder] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, existingPayment.order_id))
        .limit(1);

      if (existingOrder) {
        console.log(`\n✅ Order ALREADY exists and is committed in Neon database:`);
        console.log(`   Order Number: ${existingOrder.order_number}`);
        console.log(`   Order ID    : ${existingOrder.id}`);
        console.log(`   Total       : ₹${(existingOrder.total / 100).toFixed(2)}`);
        console.log(`   Status      : ${existingOrder.status}`);
        process.exit(0);
      }
    }
  } catch (dbErr) {
    console.warn('[Order Recovery] DB check warning:', dbErr);
  }

  // 2. Look up in Firestore paid_unfulfilled or pending_checkouts
  let checkout: any = null;

  try {
    const unfulfilled = await firestoreService.getDoc('paid_unfulfilled', paymentId);
    if (unfulfilled?.cartSnapshot) {
      console.log(`Found unfulfilled record in Firestore: order ${unfulfilled.orderNumber}`);
      checkout = {
        id: unfulfilled.orderId,
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
  } catch (fErr) {
    console.warn('[Order Recovery] paid_unfulfilled lookup note:', fErr);
  }

  if (!checkout) {
    try {
      // Search pending_checkouts
      const checkouts = await firestoreService.queryDocs('pending_checkouts');
      const matched = checkouts.find((c: any) => c.payment_id === paymentId || c.razorpay_payment_id === paymentId);
      if (matched) {
        console.log(`Found matching pending checkout: ${matched.order_number}`);
        checkout = matched;
      }
    } catch (qErr) {
      console.warn('[Order Recovery] pending_checkouts lookup note:', qErr);
    }
  }

  if (!checkout) {
    console.error(`❌ Could not locate cart snapshot or checkout record for payment ${paymentId}`);
    process.exit(1);
  }

  // 3. Normalize sizes across all items before commit
  checkout.items = (checkout.items || []).map((item: any) => ({
    ...item,
    size: normalizeSize(item.division || item.gender, item.size) || item.size,
  }));

  console.log(`Rebuilding and committing order with items:`, checkout.items.map((i: any) => `${i.name} (${i.size})`));

  try {
    const recoveredOrder = await confirmAndWriteOrder(checkout, paymentId);

    console.log(`\n🎉 ORDER RECOVERED & COMMITTED SUCCESSFULLY!`);
    console.log(`   Order Number : ${recoveredOrder.order_number}`);
    console.log(`   Order ID     : ${recoveredOrder.id}`);
    console.log(`   Customer     : ${recoveredOrder.customer_name} (${recoveredOrder.customer_phone})`);
    console.log(`   Total Paid   : ₹${(recoveredOrder.total / 100).toFixed(2)}`);

    // Update Firestore records
    await firestoreService.updateDoc('paid_unfulfilled', paymentId, {
      status: 'recovered',
      order_id: recoveredOrder.id,
      order_number: recoveredOrder.order_number,
      recovered_at: new Date().toISOString(),
    }).catch(() => {});

    if (checkout.id) {
      await firestoreService.updateDoc('pending_checkouts', checkout.id, {
        status: 'paid',
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    }

    console.log(`\nFirestore state updated to 'recovered'. Customer can view order at:`);
    console.log(`https://www.thegirlscollections.com/order-confirmation/${recoveredOrder.id}\n`);

  } catch (commitErr: any) {
    console.error(`❌ Failed to commit recovered order:`, commitErr);
    process.exit(1);
  }
}

main();

