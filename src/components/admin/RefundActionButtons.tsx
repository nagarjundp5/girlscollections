'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RefundActionButtons({
  orderId,
  currentStatus,
  refundRef,
}: {
  orderId: string;
  currentStatus: string;
  refundRef?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [inputRef, setInputRef] = useState(refundRef || '');
  const [error, setError] = useState<string | null>(null);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.trim()) {
      setError('Please provide a Razorpay Refund ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiated',
          refundRef: inputRef.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate refund');

      setShowInitiateModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completed',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete refund');

      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'pending' && (
        <button
          onClick={() => setShowInitiateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Initiate Refund
        </button>
      )}

      {currentStatus === 'initiated' && (
        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          Mark Completed
        </button>
      )}

      {currentStatus === 'completed' && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      )}

      {/* Modal for entering Razorpay Refund Reference */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Mark Refund Initiated</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the Razorpay Refund ID from your Razorpay Dashboard after initiating payout.
            </p>

            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Refund ID / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. rfnd_xxxxxxxxxxxxxx"
                  value={inputRef}
                  onChange={(e) => setInputRef(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save & Mark Initiated
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

