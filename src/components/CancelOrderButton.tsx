'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function CancelOrderButton({
  orderId,
  cancelAllowedUntil,
}: {
  orderId: string;
  cancelAllowedUntil: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Check if window is still open
  const isWindowActive = cancelAllowedUntil ? new Date() < new Date(cancelAllowedUntil) : false;

  if (!isWindowActive) {
    return (
      <div className="text-xs text-gray-400 italic">
        Need to cancel? Please contact customer support.
      </div>
    );
  }

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer cancelled from profile' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setConfirmOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!confirmOpen ? (
        <button
          onClick={() => setConfirmOpen(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
        >
          Cancel Order
        </button>
      ) : (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 space-y-3">
          <div className="flex items-start gap-2 text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span>Are you sure you want to cancel this order? Any advance paid will be queued for manual refund.</span>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Yes, Cancel Order
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Nevermind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

