'use client';

import React, { useEffect, useState } from 'react';
import { OrphanAsset } from '@/app/api/admin/media/orphans/route';
import { Trash2, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare, Square, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminOrphanMediaPage() {
  const { addToast } = useToast();
  const [orphans, setOrphans] = useState<OrphanAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalScanned, setTotalScanned] = useState(0);

  const fetchOrphans = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/media/orphans');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to scan Cloudinary media');

      setOrphans(data.orphans || []);
      setTotalScanned(data.totalCloudinaryResources || 0);
      setSelectedIds(new Set());
      addToast(`Scanned ${data.totalCloudinaryResources} assets. Found ${data.orphanCount} orphans (>7d old).`, 'info');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to fetch orphan assets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrphans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (publicId: string) => {
    const next = new Set(selectedIds);
    if (next.has(publicId)) {
      next.delete(publicId);
    } else {
      next.add(publicId);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orphans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orphans.map((o) => o.publicId)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected orphan assets from Cloudinary permanently?`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch('/api/admin/media/orphans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicIds: Array.from(selectedIds) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete selected orphan assets');

      addToast(`Successfully deleted ${data.deletedCount} orphan assets from Cloudinary!`, 'success');
      fetchOrphans();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to delete orphan assets', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-zariGold" />
            Cloudinary Orphan Media Scanner
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Detects unreferenced Cloudinary images older than 7 days. Manual admin review required before deletion.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrphans}
            disabled={isLoading || isDeleting}
            className="bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-800 px-4 py-2.5 font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-zariGold ${isLoading ? 'animate-spin' : ''}`} />
            Scan Storage
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Safety Rule Enforced:</span> Only unreferenced assets created more than 7 days ago are listed below. Assets will never be deleted automatically without explicit admin selection and confirmation.
        </div>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              disabled={orphans.length === 0}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 disabled:opacity-50"
            >
              {selectedIds.size === orphans.length && orphans.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-zariGold" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
              Select All ({orphans.length})
            </button>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Total Scanned: {totalScanned} assets
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
            <span>Scanning Cloudinary media repository...</span>
          </div>
        ) : orphans.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-2">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <span className="font-bold text-zinc-800">Clean Media Repository!</span>
            <span>No unreferenced orphan assets older than 7 days were found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {orphans.map((item) => {
              const isSelected = selectedIds.has(item.publicId);
              return (
                <div
                  key={item.publicId}
                  onClick={() => toggleSelect(item.publicId)}
                  className={`border rounded-xl p-3 bg-white transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-zariGold ring-2 ring-zariGold/30 bg-amber-50/20'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 mb-3 border border-zinc-100">
                    <img src={item.url} alt={item.publicId} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-zariGold drop-shadow-md" />
                      ) : (
                        <Square className="w-5 h-5 text-white/80 drop-shadow-md" />
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      {item.width}x{item.height}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-zinc-800 truncate" title={item.publicId}>
                      {item.publicId}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{(item.bytes / 1024).toFixed(0)} KB</span>
                      <span className="text-amber-700 font-bold">{item.ageDays} days old</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
