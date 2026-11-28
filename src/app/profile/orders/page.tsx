import React, { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, AlertCircle } from 'lucide-react';
import ProfileLocationCard from '@/components/profile/ProfileLocationCard';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string, refundStatus?: string) {
  const s = (status || '').toLowerCase();
  if (s === 'cancelled') {
    if (refundStatus === 'completed') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Refund completed</span>;
    }
    if (refundStatus === 'initiated' || refundStatus === 'pending') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Refund in progress</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Cancelled</span>;
  }

  switch (s) {
    case 'delivered':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Delivered</span>;
    case 'out_for_delivery':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Out for delivery</span>;
    case 'shipped':
    case 'shiprocket_created':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Shipped</span>;
    case 'confirmed':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Confirmed</span>;
    case 'pending_payment':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Payment pending</span>;
    default:
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
  }
}

function getProgressIndex(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return 3;
  if (s === 'shipped' || s === 'out_for_delivery') return 2;
  if (s === 'shiprocket_created' || s === 'packed') return 1;
  return 0;
}

async function OrdersListSection({ userId }: { userId: string }) {
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.user_id, userId))
    .orderBy(desc(schema.orders.created_at))
    .limit(50);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1E3A]">My orders</h2>
          <p className="text-sm sm:text-base text-[#6B6F85] mt-0.5">Track and manage your orders.</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#FDF2F5] border border-[#F5D0DC] text-[#D94F7E] text-xs sm:text-sm font-semibold">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EADFD6] p-10 sm:p-12 text-center shadow-2xs space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#FDF2F5] border border-[#F5D0DC] flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-[#D94F7E]" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h12l1 12H5L6 7z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-semibold text-[#1A1E3A]">No orders yet</h3>
          <p className="text-base text-[#6B6F85]">Your first order will appear here.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 text-sm font-semibold rounded-xl bg-[#D94F7E] text-white hover:bg-[#C23F6D] transition-transform active:scale-95"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const items = (order.items as any[]) || [];
            const isCancelled = order.status === 'cancelled' || order.order_status === 'CANCELLED';
            const totalRupees = Math.round(Number(order.total || 0) / 100);
            const advanceRupees = Math.round(Number(order.advance_paid || 20000) / 100);
            const balanceRupees = Math.round(Number(order.cod_balance ?? order.remaining_amount ?? Math.max(0, Number(order.total || 0) - 20000)) / 100);
            const isCod = order.payment_mode === 'cod' || order.payment_type === 'cod' || order.payment_status === 'partially_paid';
            const stepIdx = getProgressIndex(order.status || order.order_status);
            const steps = ['Placed', 'Packed', 'Shipped', 'Delivered'];

            return (
              <div
                key={order.id}
                className="bg-white border border-[#EADFD6] rounded-2xl p-4 sm:p-6 shadow-[0_2px_10px_rgba(28,20,23,0.04)] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EADFD6]/70 pb-3.5">
                  <div>
                    <span className="text-xs text-[#6B6F85] font-medium">Order number</span>
                    <p className="text-base font-semibold text-[#1A1E3A]">#{order.order_number}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getStatusBadge(order.status || order.order_status, order.refund_status)}
                    <span className="text-xs text-[#6B6F85]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>

                {/* Up to 3 product thumbnails (object-contain, rounded) */}
                <div className="flex flex-wrap gap-3 items-center">
                  {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="relative w-16 h-20 bg-[#FBF8F4] rounded-xl overflow-hidden border border-[#EADFD6] flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6F85] text-xs">Item</div>
                      )}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <span className="text-xs sm:text-sm text-[#6B6F85] font-semibold px-2.5 py-1 rounded-full bg-[#FBF8F4] border border-[#EADFD6]">
                      +{items.length - 3} more
                    </span>
                  )}
                </div>

                {/* 4-step progress line */}
                {!isCancelled && (
                  <div className="pt-1">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {steps.map((label, idx) => {
                        const done = idx <= stepIdx;
                        return (
                          <div key={label} className="flex flex-col items-center gap-1.5">
                            <div className="w-full flex items-center">
                              <div className={`h-1 flex-1 rounded-full ${idx === 0 ? 'bg-transparent' : done ? 'bg-[#D94F7E]' : 'bg-[#EADFD6]'}`} />
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${done ? 'bg-[#D94F7E]' : 'bg-[#EADFD6]'}`} />
                              <div className={`h-1 flex-1 rounded-full ${idx === 3 ? 'bg-transparent' : idx < stepIdx ? 'bg-[#D94F7E]' : 'bg-[#EADFD6]'}`} />
                            </div>
                            <span className={`text-[11px] font-medium ${done ? 'text-[#1A1E3A]' : 'text-[#6B6F85]'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Financials & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#EADFD6]/70">
                  <div>
                    <div className="text-base font-bold text-[#1A1E3A]">
                      Total: ₹{totalRupees.toLocaleString('en-IN')}
                    </div>
                    {isCod && (
                      <div className="text-xs sm:text-sm text-[#6B6F85] mt-0.5">
                        Paid online ₹{advanceRupees} · <span className="font-semibold text-amber-700">To pay on delivery ₹{balanceRupees}</span>
                      </div>
                    )}
                    {isCancelled && order.refund_status !== 'none' && (
                      <div className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {order.refund_status === 'pending' && `Refund of ₹${Math.round(Number(order.refund_amount || 0) / 100)} is being processed`}
                        {order.refund_status === 'initiated' && `Refund initiated (Ref: ${order.refund_ref || 'In-flight'})`}
                        {order.refund_status === 'completed' && `Refund of ₹${Math.round(Number(order.refund_amount || 0) / 100)} completed`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Link
                      href={`/track?orderNumber=${encodeURIComponent(order.order_number)}`}
                      className="flex-1 sm:flex-none min-h-[48px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#D94F7E] hover:bg-[#C23F6D] text-white transition-colors"
                    >
                      Track order
                    </Link>
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="flex-1 sm:flex-none min-h-[48px] inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-[#EADFD6] text-[#1A1E3A] hover:border-[#D94F7E] hover:text-[#D94F7E] transition-colors"
                    >
                      View details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function ProfileOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <ProfileLocationCard />
      <Suspense
        fallback={
          <div className="space-y-4 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-[#EADFD6] rounded-2xl p-6 space-y-4">
                <div className="h-5 w-40 bg-[#F3EFEA] rounded animate-pulse" />
                <div className="h-20 w-full bg-[#FBF8F4] rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        }
      >
        <OrdersListSection userId={userId} />
      </Suspense>
    </div>
  );
}
