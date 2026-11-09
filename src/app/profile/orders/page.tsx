import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import ProfileLocationCard from '@/components/profile/ProfileLocationCard';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string, refundStatus?: string) {
  if (status === 'cancelled') {
    if (refundStatus === 'completed') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Refund Completed</span>;
    }
    if (refundStatus === 'initiated') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Refund Initiated</span>;
    }
    if (refundStatus === 'pending') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Refund Processing</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
  }

  switch (status) {
    case 'delivered':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Delivered</span>;
    case 'shipped':
    case 'out_for_delivery':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Shipped</span>;
    case 'shiprocket_created':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Processing</span>;
    case 'confirmed':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
    case 'pending_payment':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Payment Pending</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
  }
}

export default async function ProfileOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.user_id, userId))
    .orderBy(desc(schema.orders.created_at))
    .limit(50);

  return (
    <div className="space-y-6">
      {/* Saved Delivery Location */}
      <ProfileLocationCard />

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-medium text-[#0F172A]">Order History</h2>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-sm text-gray-500 mb-6">Looks like you haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-xl bg-[#0F172A] text-white hover:bg-black transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const items = (order.items as any[]) || [];
            const isCancelled = order.status === 'cancelled' || order.order_status === 'CANCELLED';
            const totalRupees = Math.round(Number(order.total || 0) / 100);
            const advanceRupees = Math.round(Number(order.advance_paid || 0) / 100);
            const balanceRupees = Math.round(Number(order.cod_balance || 0) / 100);

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Order Number</span>
                    <p className="text-base font-semibold text-gray-900">#{order.order_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status || order.order_status, order.refund_status)}
                    <span className="text-xs text-gray-400">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 flex flex-wrap gap-3 items-center">
                  {items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative w-14 h-18 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Item</div>
                      )}
                    </div>
                  ))}
                  {items.length > 4 && (
                    <span className="text-xs text-gray-500 font-medium">+{items.length - 4} more</span>
                  )}
                </div>

                {/* Financials & Status Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Total: ₹{totalRupees}
                    </div>
                    {order.payment_mode === 'cod' && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Advance Paid: ₹{advanceRupees} • <span className="font-medium text-amber-700">₹{balanceRupees} due on delivery</span>
                      </div>
                    )}
                    {isCancelled && order.refund_status !== 'none' && (
                      <div className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {order.refund_status === 'pending' && `Refund of ₹${Math.round(Number(order.refund_amount || 0) / 100)} is being processed by our team`}
                        {order.refund_status === 'initiated' && `Refund initiated (Ref: ${order.refund_ref || 'In-flight'})`}
                        {order.refund_status === 'completed' && `Refund of ₹${Math.round(Number(order.refund_amount || 0) / 100)} completed`}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
