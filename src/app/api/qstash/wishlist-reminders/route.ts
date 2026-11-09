export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, or, isNull, lt, sql, inArray } from 'drizzle-orm';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { sendWishlistReminderEmail } from '@/lib/email';
import { WishlistEmailItem } from '@/components/WishlistReminderEmail';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // 1. Verify QStash signature
    const isValid = await verifyQStashSignature(request, rawBody);
    if (!isValid) {
      console.warn('[Wishlist Reminder] Unauthorized QStash signature');
      return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 2. Find eligible users (active email, last email sent > 7 days ago or null)
    const eligibleUsers = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        phone: schema.users.phone,
        name: schema.users.name,
        lastSent: schema.users.last_wishlist_email_sent_at,
      })
      .from(schema.users)
      .where(
        and(
          sql`${schema.users.email} IS NOT NULL AND ${schema.users.email} != ''`,
          or(
            isNull(schema.users.last_wishlist_email_sent_at),
            lt(schema.users.last_wishlist_email_sent_at, sevenDaysAgo)
          )
        )
      )
      .limit(50);

    let sentCount = 0;

    for (const user of eligibleUsers) {
      try {
        // Query user's wishlist items
        const wishlistItems = await db
          .select({
            productId: schema.wishlist.product_id,
            name: schema.products.name,
            slug: schema.products.slug,
            price: schema.products.price,
            images: schema.products.images,
            category: schema.products.category,
          })
          .from(schema.wishlist)
          .innerJoin(schema.products, eq(schema.wishlist.product_id, schema.products.id))
          .where(eq(schema.wishlist.user_id, user.id))
          .limit(6);

        if (wishlistItems.length === 0) continue;

        // Check if user already purchased these products
        const [priorPurchases] = await db
          .select({
            items: schema.orders.items,
          })
          .from(schema.orders)
          .where(
            and(
              eq(schema.orders.user_id, user.id),
              sql`${schema.orders.status} IN ('confirmed', 'shiprocket_created', 'shipped', 'delivered')`
            )
          )
          .limit(20);

        const purchasedProductIds = new Set<string>();
        if (priorPurchases && Array.isArray(priorPurchases.items)) {
          priorPurchases.items.forEach((item: any) => {
            if (item.productId || item.id) purchasedProductIds.add(item.productId || item.id);
          });
        }

        const pendingItems: WishlistEmailItem[] = wishlistItems
          .filter((item: any) => !purchasedProductIds.has(item.productId))
          .map((item: any) => {
            const rawImages = (item.images as any[]) || [];
            const primaryImg = typeof rawImages[0] === 'string' ? rawImages[0] : (rawImages[0]?.url || '');
            return {
              id: item.productId,
              name: item.name,
              slug: item.slug || item.productId,
              price: Math.round(Number(item.price || 0) / 100),
              image: primaryImg,
              category: item.category || 'Collection',
              reason: 'idle_reminder',
            };
          });

        if (pendingItems.length === 0) continue;

        // Generate 7-day single-use user-bound 10% discount code
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const codeString = `WISH10-${randomSuffix}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        try {
          await db.insert(schema.discountCodes).values({
            code: codeString,
            discount_type: 'percentage',
            discount_value: 10,
            usage_limit: 1,
            used_count: 0,
            target_phone: user.phone || null,
            is_phone_locked: !!user.phone,
            is_active: true,
            expires_at: expiresAt,
          });
        } catch (codeErr) {
          console.warn('[Wishlist Reminder] Discount code creation warning:', codeErr);
        }

        // Send email (non-fatal)
        await sendWishlistReminderEmail({
          customerEmail: user.email!,
          customerName: user.name || undefined,
          items: pendingItems,
          offerCode: codeString,
        });

        // Update last sent timestamp
        await db
          .update(schema.users)
          .set({ last_wishlist_email_sent_at: new Date() })
          .where(eq(schema.users.id, user.id));

        sentCount++;
      } catch (userErr) {
        console.error(`[Wishlist Reminder] Failed for user ${user.id}:`, userErr);
      }
    }

    return NextResponse.json({ success: true, processed: eligibleUsers.length, sent: sentCount });
  } catch (err: any) {
    console.error('[Wishlist Reminder Error]:', err);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
