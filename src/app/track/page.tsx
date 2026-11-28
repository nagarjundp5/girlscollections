'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

const STATUS_STAGES = [
  { id: 'placed', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { id: 'packed', label: 'Packed', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrderPage() {
  const { addToast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !contact) {
      addToast('Please enter both Order Number and Contact info.', 'error');
      return;
    }

    setIsLoading(true);
    setOrder(null);

    try {
      const foundOrder = await db.getOrderByTracking(orderNumber, contact);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        addToast('No order found with these details. Please check and try again.', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Failed to fetch order tracking information.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STAGES.findIndex((stage) => stage.id === status);
  };

  // Real-time polling updates when the tracking dashboard is open
  React.useEffect(() => {
    if (!order) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(contact)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Real-time tracking status check error:', err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [order?.order_number, contact]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1E3A] px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1E3A] mb-3">
            Track your order
          </h1>
          <p className="text-[#6B6F85] max-w-lg mx-auto text-sm sm:text-base">
            Enter your order number and the email or phone number used during checkout to view your shipment status.
          </p>
        </div>

        <div className="bg-white border border-[#EADFD6] p-6 md:p-8 rounded-2xl shadow-sm max-w-2xl mx-auto mb-10">
          <form onSubmit={handleTrack} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1E3A] block">Order number</label>
                <input
                  type="text"
                  placeholder="e.g. TGC-7K9M2P"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full min-h-[48px] bg-[#FBF8F4] border border-[#EADFD6] rounded-xl text-[#1A1E3A] px-4 py-3 text-base focus:outline-none focus:border-[#D94F7E]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1E3A] block">Email or phone</label>
                <input
                  type="text"
                  placeholder="Entered at checkout"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full min-h-[48px] bg-[#FBF8F4] border border-[#EADFD6] rounded-xl text-[#1A1E3A] px-4 py-3 text-base focus:outline-none focus:border-[#D94F7E]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] bg-[#D94F7E] hover:bg-[#C23F6D] text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Searching...' : 'Track order'}
              {!isLoading && <Search className="w-4 h-4" />}
            </button>
          </form>
        </div>

      {order && (
        <div className="animate-fade-in bg-zinc-900/50 border border-zinc-800 p-6 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-zinc-800 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-offwhite uppercase tracking-wider mb-1">
                Order {order.order_number}
              </h2>
              <p className="text-zinc-500 text-sm">Placed on {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-zinc-400 mb-1">Total Amount</p>
              <p className="text-xl text-brand-offwhite font-mono font-bold">₹{(order.total / 100).toFixed(2)}</p>
            </div>
          </div>

          {order.tracking_history && (
            <div className="mb-8 p-6 border border-zinc-800 bg-zinc-950/40 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Courier Tracking Status</p>
                <p className="text-lg font-bold text-white mt-1">{order.tracking_history.status_label}</p>
                {order.tracking_number && (
                  <p className="text-xs text-zinc-400 mt-1 font-mono">Tracking Number: {order.tracking_number} ({order.courier_partner || 'Courier'})</p>
                )}
              </div>
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Last Status Update</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {new Date(order.tracking_history.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {order.order_status === 'cancelled' ? (
            <div className="bg-zinc-950 border border-zinc-800 text-zinc-400 p-6 text-center font-bold tracking-widest uppercase text-sm mb-10">
              This order has been cancelled.
            </div>
          ) : (
            <div className="relative mb-12 py-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 hidden md:block" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 hidden md:block transition-all duration-1000"
                style={{
                  width: `${(Math.max(0, getStatusIndex(order.order_status)) / (STATUS_STAGES.length - 1)) * 100}%`,
                }}
              />
              
              <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
                {STATUS_STAGES.map((stage, index) => {
                  const currentIndex = getStatusIndex(order.order_status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.id} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                      <div className="md:hidden w-1 h-full bg-zinc-800 absolute left-5 top-10 -z-10" />
                      
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? 'bg-white border-white text-black'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="md:text-center">
                        <p
                          className={`text-xs md:text-sm font-bold uppercase tracking-wider ${
                            isCompleted ? 'text-brand-offwhite' : 'text-zinc-600'
                          }`}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && order.tracking_number && stage.id === 'shipped' && (
                          <a
                            href={order.tracking_url || `https://shiprocket.co/tracking/${order.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#D94F7E] underline mt-1 font-medium block"
                          >
                            AWB: {order.tracking_number}
                          </a>
                        )}
                        {isCurrent && order.courier_partner && stage.id === 'shipped' && (
                          <p className="text-xs text-[#6B6F85] mt-1">{order.courier_partner}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-white border border-[#EADFD6] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-serif font-bold text-[#1A1E3A] mb-4 pb-2 border-b border-[#EADFD6]">
              Items in shipment
            </h3>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-[#FBF8F4] rounded-xl overflow-hidden flex-shrink-0 border border-[#EADFD6]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1E3A] truncate">{item.name}</p>
                    <p className="text-xs text-[#6B6F85]">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#1A1E3A] font-semibold">₹{(item.price / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
