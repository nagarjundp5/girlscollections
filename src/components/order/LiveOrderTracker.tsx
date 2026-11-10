'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Package,
  Truck,
  MapPin,
  Clock,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export interface LiveOrderTrackerProps {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    order_status?: string;
    created_at: string | Date;
    courier_name?: string | null;
    awb_code?: string | null;
    tracking_url?: string | null;
    fulfillment_type?: string | null;
    shipping_address?: any;
    items?: any[];
    total: number;
    subtotal?: number;
    discount_amount?: number;
    shipping_charge?: number;
    payment_mode?: string;
    cancel_allowed_until?: string | Date | null;
  };
  supportPhone?: string;
}

export default function LiveOrderTracker({
  order: initialOrder,
  supportPhone = '917406164512',
}: LiveOrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Poll Firestore mirror doc /api/orders/[orderId]/tracking or listen to updates without hitting Neon
  useEffect(() => {
    let isCancelled = false;

    async function checkFirestoreStatus() {
      try {
        const res = await fetch(`/api/orders/${order.id}/tracking-mirror`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && data && data.status) {
          setOrder((prev) => ({
            ...prev,
            status: data.status || prev.status,
            courier_name: data.courier_name || prev.courier_name,
            awb_code: data.awb || prev.awb_code,
            tracking_url: data.tracking_url || prev.tracking_url,
          }));
        }
      } catch {}
    }

    // Refresh once on load, then poll softly every 20s if still packing
    checkFirestoreStatus();
    const interval = setInterval(checkFirestoreStatus, 20000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [order.id]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isPickup = order.fulfillment_type === 'pickup';

  // ── Timeline Step Calculation ──
  // Status progression: Confirmed -> PACKING -> Shipped -> Out for delivery -> Delivered
  const normalizedStatus = (order.status || order.order_status || '').toLowerCase();

  const steps = [
    { key: 'confirmed', label: 'Confirmed', desc: 'Order received & payment secured' },
    { key: 'packing', label: 'Packing', desc: 'Handcrafted items being prepared & inspected' },
    { key: 'shipped', label: isPickup ? 'Ready for Pickup' : 'Shipped', desc: isPickup ? 'Awaiting your store visit' : 'Handed over to delivery partner' },
    { key: 'out_for_delivery', label: 'Out for delivery', desc: 'Courier agent is on the way' },
    { key: 'delivered', label: isPickup ? 'Collected' : 'Delivered', desc: 'Package safely handed over' },
  ];

  let currentStepIndex = 0;
  if (normalizedStatus === 'delivered' || normalizedStatus === 'collected') {
    currentStepIndex = 4;
  } else if (normalizedStatus === 'out_for_delivery') {
    currentStepIndex = 3;
  } else if (normalizedStatus === 'shipped' || normalizedStatus === 'shiprocket_created' || normalizedStatus === 'ready_for_pickup') {
    currentStepIndex = 2;
  } else if (normalizedStatus === 'packing' || normalizedStatus === 'preparing' || normalizedStatus === 'packed') {
    currentStepIndex = 1;
  } else {
    currentStepIndex = 0; // confirmed / placed
  }

  const isShippedOrBeyond = currentStepIndex >= 2;
  const trackingLink =
    order.tracking_url ||
    (order.awb_code ? `https://shiprocket.co/tracking/${order.awb_code}` : null);

  const whatsappText = encodeURIComponent(
    `Hi The Girls Collections, I have a query regarding my order ${order.order_number}. Could you please assist?`
  );

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER CARD ── */}
      <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1417] tracking-tight">
          Thank you, {order.customer_name || 'Valued Customer'}!
        </h1>

        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Order</span>
          <span className="text-sm font-bold text-[#3B1230] font-sans">{order.order_number}</span>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 rounded-md text-gray-400 hover:text-[#3B1230] transition-colors focus:outline-none cursor-pointer"
            title="Copy order number"
            aria-label="Copy order number"
          >
            {copiedOrderNumber ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 font-sans">
          Placed on {formattedDate} • Confirmation sent to{' '}
          <span className="font-medium text-[#1C1417]">
            {order.customer_email || order.customer_phone}
          </span>
        </p>
      </div>

      {/* ── TRACKING CARD ── */}
      <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7E2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#B8924A]/30 flex items-center justify-center text-[#B8924A]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#1C1417]">Shipment &amp; Tracking</h2>
              <span className="text-[11px] text-gray-500 font-sans">
                {isShippedOrBeyond ? 'Active Courier Transit' : 'Preparation Phase'}
              </span>
            </div>
          </div>

          {order.courier_name && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF6EE] text-[#3B1230] border border-[#B8924A]/30">
              {order.courier_name}
            </span>
          )}
        </div>

        {isShippedOrBeyond && order.awb_code ? (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF6EE]/50 border border-[#B8924A]/20 rounded-2xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-sans block">
                  AWB Tracking Number
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#1C1417] font-sans tracking-wide">
                    {order.awb_code}
                  </span>
                  <button
                    onClick={() => handleCopyAwb(order.awb_code!)}
                    className="p-1 text-gray-400 hover:text-[#3B1230] transition-colors cursor-pointer"
                    title="Copy AWB number"
                  >
                    {copiedAwb ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {trackingLink && (
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3B1230] hover:bg-[#2A0D22] text-white text-xs font-semibold tracking-wider transition-colors min-h-[44px] cursor-pointer shadow-xs"
                >
                  <span>Track your package</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FAF6EE]/40 border border-[#B8924A]/20 rounded-2xl flex items-start gap-3 text-left">
            <Package className="w-5 h-5 text-[#B8924A] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#1C1417]">
                Your order is currently being packed.
              </p>
              <p className="text-xs text-gray-500">
                Tracking details and courier allocation will appear here as soon as your package ships.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── VERTICAL ORDER TIMELINE ── */}
      <div className="bg-white border border-[#EFE7E2] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-sm font-serif font-bold text-[#1C1417] border-b border-[#EFE7E2] pb-3">
          Order Status Timeline
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-6 pt-2">
          {/* Vertical connecting line */}
          <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-[2px] bg-[#EFE7E2]" />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-3.5">
                {/* Dot */}
                <div
                  className={`absolute -left-[19px] sm:-left-[23px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#3B1230] border-[#3B1230] text-white'
                      : 'bg-white border-[#D6C7BE] text-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6C7BE]" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-sans uppercase tracking-wider font-bold ${
                        isCurrent ? 'text-[#3B1230]' : isCompleted ? 'text-[#1C1417]' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FAF6EE] text-[#B8924A] border border-[#B8924A]/40 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          href="/shop"
          className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-[#3B1230] hover:bg-[#2A0D22] text-white font-sans text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href={`https://wa.me/${supportPhone}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 py-3 px-6 rounded-xl border border-[#D6C7BE] hover:border-[#3B1230] bg-white text-[#1C1417] font-sans text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Need help? WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

