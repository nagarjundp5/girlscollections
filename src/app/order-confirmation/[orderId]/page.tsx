import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import LiveOrderTracker from '@/components/order/LiveOrderTracker';
import { MapPin, CreditCard, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Order Confirmed | The Girls Collections',
  description: 'Thank you for your order.',
};

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  let userId: string | null = null;
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('tgc_session')?.value;

  if (sessionToken) {
    const payload = await verifyToken(sessionToken);
    if (payload && payload.userId) {
      userId = payload.userId as string;
    }
  }

  if (!userId) {
    try {
      const clerkAuth = await auth();
      if (clerkAuth.userId) {
        userId = clerkAuth.userId;
      }
    } catch (e) {
      console.warn('[Order Confirmation Page] Clerk auth note:', e);
    }
  }

  if (!userId) {
    redirect(`/sign-in?redirect_url=/order-confirmation/${params.orderId}`);
  }

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.orderId)) {
    notFound();
  }

  // Fetch order from Neon
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, params.orderId))
    .limit(1);

  // IDOR check
  if (!order || order.user_id !== userId) {
    notFound();
  }

  const itemsList = (order.items as any[]) || [];
  const address = order.shipping_address as any;
  const isPickup = order.fulfillment_type === 'pickup';

  const subtotalRupees = order.subtotal > 100000 ? Math.round(order.subtotal / 100) : order.subtotal;
  const totalRupees = order.total > 100000 ? Math.round(order.total / 100) : order.total;
  const discountRupees = (order.discount_amount || 0) > 100000 ? Math.round((order.discount_amount || 0) / 100) : (order.discount_amount || 0);
  const shippingRupees = (order.shipping_charge || 0) > 100000 ? Math.round((order.shipping_charge || 0) / 100) : (order.shipping_charge || 0);

  return (
    <main className="min-h-screen bg-[#FBF7F1] text-[#1C1417] pt-24 sm:pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Live Order Tracker (Header, Tracking, Timeline, WhatsApp & Continue Shopping Buttons) */}
        <LiveOrderTracker
          order={{
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            status: order.status,
            order_status: order.order_status,
            created_at: order.created_at,
            courier_name: order.courier_name,
            awb_code: order.awb_code,
            tracking_url: order.tracking_url,
            fulfillment_type: order.fulfillment_type,
            total: totalRupees,
          }}
        />

        {/* ── ITEMS CARD ── */}
        <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE7E2] pb-3">
            <ShoppingBag className="w-4 h-4 text-[#B8924A]" />
            <h2 className="text-sm font-serif font-bold text-[#1C1417]">
              Ordered Items ({itemsList.length})
            </h2>
          </div>

          <div className="divide-y divide-[#EFE7E2]">
            {itemsList.map((item, idx) => {
              const itemPrice = item.price > 100000 ? Math.round(item.price / 100) : item.price;
              const lineTotal = itemPrice * (item.quantity || 1);

              return (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#EFE7E2]">
                      {item.image || item.images?.[0] ? (
                        <Image
                          src={item.image || item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-serif text-[#B8924A]">
                          TGC
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#1C1417] truncate max-w-[200px] sm:max-w-xs">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                        Size: <strong className="text-[#1C1417]">{item.size || item.size_key || 'Free Size'}</strong> • Qty: {item.quantity || 1}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-[#1C1417] font-sans shrink-0">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DELIVERY ADDRESS CARD ── */}
        <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#EFE7E2] pb-3">
            <MapPin className="w-4 h-4 text-[#B8924A]" />
            <h2 className="text-sm font-serif font-bold text-[#1C1417]">
              {isPickup ? 'Store Pickup Details' : 'Delivery Address'}
            </h2>
          </div>

          {isPickup ? (
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p className="font-bold text-[#1C1417]">The Girls Collections Store</p>
              <p>Gandhi Bazaar, Basavanagudi, Bengaluru, Karnataka 560004</p>
              <p className="pt-1 text-gray-500">Pickup Code: <strong className="text-[#3B1230] text-sm">{order.pickup_code || 'TGC-STORE'}</strong></p>
            </div>
          ) : (
            <div className="text-xs text-gray-600 leading-relaxed space-y-0.5">
              <p className="font-bold text-[#1C1417] text-sm">{order.customer_name}</p>
              <p>{address?.line1}</p>
              {address?.line2 && <p>{address?.line2}</p>}
              <p>{address?.city}, {address?.state} - {address?.pincode}</p>
              <p className="pt-1 text-gray-500">Phone: {order.customer_phone}</p>
            </div>
          )}
        </div>

        {/* ── PAYMENT SUMMARY CARD ── */}
        <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#EFE7E2] pb-3">
            <CreditCard className="w-4 h-4 text-[#B8924A]" />
            <h2 className="text-sm font-serif font-bold text-[#1C1417]">Payment Summary</h2>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#1C1417]">₹{subtotalRupees.toLocaleString('en-IN')}</span>
            </div>
            {discountRupees > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-₹{discountRupees.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-[#1C1417]">
                {shippingRupees === 0 ? 'FREE' : `₹${shippingRupees.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-semibold text-[#1C1417] uppercase">
                {order.payment_mode === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay / UPI)'}
              </span>
            </div>
            <div className="border-t border-[#EFE7E2] pt-3 flex justify-between text-sm sm:text-base font-serif font-bold text-[#3B1230]">
              <span>Total Paid</span>
              <span>₹{totalRupees.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
