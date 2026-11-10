'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

interface CancelOrderButtonProps {
  orderId: string;
  cancelAllowedUntil?: string | Date | null;
  orderStatus: string;
  onCancelled?: () => void;
}

export default function CancelOrderButton({
  orderId,
  cancelAllowedUntil,
  orderStatus,
  onCancelled,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(
    orderStatus === 'CANCELLED' || orderStatus === 'cancelled'
  );

  useEffect(() => {
    if (!cancelAllowedUntil) {
      setTimeLeftSec(0);
      return;
    }

    const targetTime = new Date(cancelAllowedUntil).getTime();

    const updateTimer = () => {
      const diff = Math.floor((targetTime - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeftSec(0);
      } else {
        setTimeLeftSec(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cancelAllowedUntil]);

  const cancellableStatuses = [
    'CREATED',
    'PAYMENT_PENDING',
    'PAID',
    'CANCELLATION_WINDOW',
    'placed',
    'confirmed',
    'preparing',
    'packing',
  ];
  const isStatusCancellable = cancellableStatuses.includes(orderStatus) && !isCancelled;
  const isTimeValid = timeLeftSec !== null && timeLeftSec > 0;
  const canCancel = isStatusCancellable && isTimeValid;

  const handleCancel = async () => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this order? Handcrafted items will be returned to inventory.'
      )
    ) {
      return;
    }

    try {
      setIsPending(true);
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setIsCancelled(true);
      addToast('Order cancelled successfully', 'success');
      if (onCancelled) {
        onCancelled();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setIsPending(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isCancelled) {
    return (
      <div className="bg-[#FAF6EE] border border-[#B8924A]/30 text-rose-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span className="font-medium">This order has been cancelled.</span>
      </div>
    );
  }

  if (canCancel) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#3B1230] text-xs bg-[#FAF6EE] border border-[#B8924A]/30 px-3 py-2 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-[#B8924A] animate-pulse" />
          <span>Cancellation available for the next <strong>{formatCountdown(timeLeftSec!)}</strong></span>
        </div>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-40 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl cursor-pointer min-h-[44px]"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isPending ? 'Cancelling...' : 'Cancel Order'}
        </button>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500 bg-[#FAF6EE]/50 border border-[#EFE7E2] p-3 rounded-xl max-w-md">
      This order is being packed for dispatch and can no longer be self-cancelled. Please message WhatsApp support if you need assistance.
    </div>
  );
}
