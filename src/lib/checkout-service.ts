import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, or, and, notInArray, sql } from 'drizzle-orm';

export interface CheckoutItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface ValidatedItemSnapshot {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number; // in paise
  image: string;
  slug: string;
}

export interface OrderFinancials {
  subtotal: number; // in paise
  discount: number; // in paise
  deliveryFee: number; // in paise
  total: number; // in paise
  advancePaid: number; // in paise
  codBalance: number; // in paise
  isFirstTimeOfferApplied: boolean;
  isCodAllowed: boolean;
  codError?: string;
  itemsSnapshot: ValidatedItemSnapshot[];
}

/**
 * Checks whether user/phone qualifies for the first-time user offer:
 * zero prior confirmed/paid/shipped orders for this user_id AND phone number.
 */
export async function checkFirstTimeUserEligibility(
  userId?: string | null,
  phone?: string | null
): Promise<boolean> {
  if (!userId && !phone) return true; // Guests can see the offer, verified upon phone entry

  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null;
  const conditions = [];

  if (userId) {
    conditions.push(eq(schema.orders.user_id, userId));
  }
  if (cleanPhone) {
    conditions.push(eq(schema.orders.customer_phone, cleanPhone));
  }

  if (conditions.length === 0) return true;

  const [priorOrder] = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(
      and(
        or(...conditions),
        notInArray(schema.orders.status, ['cancelled', 'failed', 'pending_payment']),
        notInArray(schema.orders.order_status, ['CANCELLED', 'FAILED', 'EXPIRED'])
      )
    )
    .limit(1);

  return !priorOrder;
}

/**
 * Recomputes all prices directly from Neon products & sizes tables.
 * Client-submitted prices are strictly ignored.
 */
export async function computeOrderFinancials(params: {
  items: CheckoutItemInput[];
  paymentMode: 'prepaid' | 'cod';
  userId?: string | null;
  phone?: string | null;
  deliveryType?: 'delivery' | 'pickup';
}): Promise<OrderFinancials> {
  const { items, paymentMode, userId, phone, deliveryType = 'delivery' } = params;

  if (!items || items.length === 0) {
    throw new Error('Cart is empty');
  }

  // 1. Fetch live products from DB
  const productIds = items.map((i) => i.productId);
  const dbProducts = await db
    .select()
    .from(schema.products)
    .where(sql`${schema.products.id} IN ${productIds}`);

  const productMap = new Map<string, any>();
  dbProducts.forEach((p: any) => productMap.set(p.id, p));

  // 2. Fetch live size prices
  const dbSizes = await db
    .select()
    .from(schema.productSizes)
    .where(sql`${schema.productSizes.product_id} IN ${productIds}`);

  const sizeMap = new Map<string, number>(); // `${productId}:${sizeKey}` -> price in paise
  dbSizes.forEach((s: any) => {
    sizeMap.set(`${s.product_id}:${s.size_key}`, s.price);
  });

  // 3. Compute item snapshots & subtotal
  let subtotal = 0;
  const itemsSnapshot: ValidatedItemSnapshot[] = [];

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // Determine authoritative price in paise
    const sizePrice = sizeMap.get(`${item.productId}:${item.size}`);
    const unitPricePaise =
      sizePrice && sizePrice > 0
        ? sizePrice
        : prod.price > 10000
        ? prod.price
        : prod.price * 100;

    const qty = Math.max(1, Math.min(20, item.quantity));
    subtotal += unitPricePaise * qty;

    const img =
      Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : '';

    itemsSnapshot.push({
      id: prod.id,
      name: prod.name,
      size: item.size,
      quantity: qty,
      price: unitPricePaise,
      image: img,
      slug: prod.slug || '',
    });
  }

  // 4. Check First-Time User Offer
  const isFirstTime = await checkFirstTimeUserEligibility(userId, phone);

  // 10% discount on first order
  const discount = isFirstTime ? Math.round(subtotal * 0.1) : 0;

  // Delivery fee: Free for first-time orders or subtotal >= ₹1999 (199900 paise)
  const defaultDeliveryFee = 10000; // ₹100
  const isFreeDelivery = isFirstTime || deliveryType === 'pickup' || subtotal >= 199900;
  const deliveryFee = isFreeDelivery ? 0 : defaultDeliveryFee;

  const total = Math.max(0, subtotal - discount + deliveryFee);

  // 5. COD vs Prepaid Split
  // Advance payment for COD is ₹200 (20000 paise)
  const COD_ADVANCE_PAISE = 20000;
  let isCodAllowed = true;
  let codError: string | undefined;
  let advancePaid = 0;
  let codBalance = 0;

  if (paymentMode === 'cod') {
    // Edge case: if total <= ₹200, COD is not allowed
    if (total <= COD_ADVANCE_PAISE) {
      isCodAllowed = false;
      codError = `Order total is ₹${(total / 100).toFixed(0)}. COD requires an order of more than ₹200. Please choose Prepaid.`;
      advancePaid = total;
      codBalance = 0;
    } else {
      advancePaid = COD_ADVANCE_PAISE;
      codBalance = total - COD_ADVANCE_PAISE;
    }
  } else {
    advancePaid = total;
    codBalance = 0;
  }

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    advancePaid,
    codBalance,
    isFirstTimeOfferApplied: isFirstTime,
    isCodAllowed,
    codError,
    itemsSnapshot,
  };
}

