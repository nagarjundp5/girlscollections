import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ExternalLink, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import CancelOrderButton from '@/components/CancelOrderButton';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [order] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, params.id), eq(schema.orders.user_id, userId)))
    .limit(1);

  if (!order) {
    notFound();
  }

  const items = (order.items as any[]) || [];
  const address = order.shipping_address as any;
  const isCancelled = order.status === 'cancelled' || order.order_status === 'CANCELLED';

  const subtotalRupees = Math.round(Number(order.subtotal || 0) / 100);
  const discountRupees = Math.round(Number(order.discount_amount || 0) / 100);
  const deliveryRupees = Math.round(Number(order.shipping_charge ?? order.shipping_fee ?? 0) / 100);
  const totalRupees = Math.round(Number(order.total || 0) / 100);
  const advanceRupees = Math.round(Number(order.advance_paid || 0) / 100);
  const balanceRupees = Math.round(Number(order.cod_balance || 0) / 100);

  // Status timeline steps
  const steps = [
    { label: 'Confirmed', done: true },
    { label: 'Processing', done: ['shiprocket_created', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status || '') },
    { label: 'Shipped', done: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status || '') },
    { label: 'Delivered', done: order.status === 'delivered' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Order Details</span>
          <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">#{order.order_number}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>

        {/* Cancellation or status actions */}
        {!isCancelled && (order.status === 'confirmed' || order.order_status === 'PLACED') && (
          <CancelOrderButton
            orderId={order.id}
            cancelAllowedUntil={order.cancel_allowed_until ? new Date(order.cancel_allowed_until).toISOString() : null}
          />
        )}
      </div>

      {/* Cancellation & Refund Alert Banner */}
      {isCancelled && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">This order has been cancelled</h4>
              {order.refund_status === 'pending' && (
                <p className="text-xs text-red-700 mt-1">
                  Refund of ₹{Math.round(Number(order.refund_amount || 0) / 100)} is being processed by our team.
                </p>
              )}
              {order.refund_status === 'initiated' && (
                <p className="text-xs text-blue-700 mt-1">
                  Refund initiated with reference: <strong>{order.refund_ref || 'In progress'}</strong>
                </p>
              )}
              {order.refund_status === 'completed' && (
                <p className="text-xs text-emerald-700 mt-1">
                  Refund of ₹{Math.round(Number(order.refund_amount || 0) / 100)} has been successfully completed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline (if not cancelled) */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Fulfillment Progress</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-2 ${
                    step.done
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs ${step.done ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Tracking Info if available */}
          {order.tracking_url && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-gray-400" />
                <span>Courier: <strong>{order.courier || order.courier_partner || 'Shiprocket'}</strong></span>
                {order.awb && <span>• AWB: <strong>{order.awb}</strong></span>}
              </div>
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] text-white hover:bg-black transition-colors"
              >
                Track Shipment
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Order Items & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Items in Order</h3>
          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="py-4 flex gap-4 items-center">
                <div className="relative w-16 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name || 'Product'} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Photo</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ₹{Math.round(Number(item.price || 0) / 100) * Number(item.quantity || 1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Address & Price Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delivery Address</h3>
            {address ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p className="pt-1 text-gray-500">Phone: {order.customer_phone}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Standard Delivery</p>
            )}
          </div>

          {/* Payment & Price Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Payment Summary</h3>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotalRupees}</span>
            </div>

            {discountRupees > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount (10% First Order)</span>
                <span>-₹{discountRupees}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-600">
              <span>Delivery Fee</span>
              <span>{deliveryRupees === 0 ? 'FREE' : `₹${deliveryRupees}`}</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-900">
              <span>Total Amount</span>
              <span>₹{totalRupees}</span>
            </div>

            {order.payment_mode === 'cod' && (
              <div className="pt-3 border-t border-dashed border-gray-200 space-y-1.5 bg-amber-50/50 p-3 rounded-xl">
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Advance Paid Online</span>
                  <span className="font-medium">₹{advanceRupees}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-800 font-semibold">
                  <span>Balance Due on Delivery</span>
                  <span>₹{balanceRupees}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

