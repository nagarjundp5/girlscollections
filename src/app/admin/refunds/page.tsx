import { getAdminSession } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, or, desc, sql } from 'drizzle-orm';
import RefundActionButtons from '@/components/admin/RefundActionButtons';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function getTimeSince(date: Date) {
  const diffMinutes = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function AdminRefundsPage() {
  const admin = await getAdminSession();
  if (!admin || !admin.isAdmin) {
    redirect('/admin/login');
  }

  // Fetch all orders where refund_status is not 'none'
  const refundOrders = await db
    .select()
    .from(schema.orders)
    .where(
      or(
        eq(schema.orders.refund_status, 'pending'),
        eq(schema.orders.refund_status, 'initiated'),
        eq(schema.orders.refund_status, 'completed')
      )
    )
    .orderBy(desc(schema.orders.cancelled_at))
    .limit(100);

  const pendingCount = refundOrders.filter((o: any) => o.refund_status === 'pending').length;
  const isStaff = admin.role === 'staff';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Manual Refunds Queue</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Zero auto-refunds policy. Initiate payout directly in Razorpay, then record status below.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Cancelled By</th>
                <th className="py-3 px-4">Cancelled At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {refundOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No orders currently in the refunds queue.
                  </td>
                </tr>
              ) : (
                refundOrders.map((order: any) => {
                  const refundRupees = Math.round(Number(order.refund_amount || 0) / 100);
                  const paymentIdDisplay = isStaff ? '••••••••' : (order.razorpay_payment_id || order.payment_id || '—');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-[11px] text-gray-400">{order.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px] font-medium">
                        {order.payment_mode || 'prepaid'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                        {paymentIdDisplay}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {isStaff ? '—' : `₹${refundRupees}`}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-gray-600">
                        {order.cancelled_by || 'system'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {order.cancelled_at ? (
                          <div>
                            <div>{getTimeSince(order.cancelled_at)}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(order.cancelled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {order.refund_status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {order.refund_status === 'initiated' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Initiated
                          </span>
                        )}
                        {order.refund_status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <RefundActionButtons
                          orderId={order.id}
                          currentStatus={order.refund_status}
                          refundRef={order.refund_ref}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
