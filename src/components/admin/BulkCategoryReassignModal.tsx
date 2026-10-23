'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface BulkCategoryReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  categories: Category[];
  onSuccess: () => void;
}

export const BulkCategoryReassignModal: React.FC<BulkCategoryReassignModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds,
  categories,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [targetCatId, setTargetCatId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const subcategories = categories.filter((c) => c.is_active || c.isActive);

  const handleReassign = async () => {
    if (!targetCatId) {
      addToast('Please select a target subcategory', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/categories/bulk-reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          targetSubcategoryId: targetCatId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reassign category');

      addToast(`Successfully reassigned ${data.updatedCount} products!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to reassign products', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Bulk Reassign Subcategory</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Reassign {selectedProductIds.length} selected products to a new category.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Select Target Subcategory
            </label>
            <select
              value={targetCatId}
              onChange={(e) => setTargetCatId(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-900 font-medium"
            >
              <option value="">-- Choose Subcategory --</option>
              {subcategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.label} (/{cat.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This operation will update the subcategory tag for all {selectedProductIds.length} selected products simultaneously.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={isSubmitting || !targetCatId}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                Confirm Reassign
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
