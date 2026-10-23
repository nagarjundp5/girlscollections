'use client';

import React, { useEffect, useState } from 'react';
import { Database, Image as ImageIcon, AlertTriangle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface DiagnosticData {
  summary: {
    totalProducts: number;
    totalCategories: number;
    totalProductImages: number;
    orphanedImagesCount: number;
    productsWithoutImagesCount: number;
    categoriesWithoutImagesCount: number;
    brokenImageUrlsCount: number;
  };
  details: {
    productsWithoutImages: Array<{ id: string; name: string; category: string }>;
    categoriesWithoutImages: Array<{ id: string; name: string; slug: string }>;
    orphanedImageRecords: Array<{ id: string; productId: string; url: string }>;
    productsWithBrokenImages: Array<{ id: string; name: string; brokenUrl: string }>;
  };
}

export default function AdminDiagnosticsPage() {
  const { addToast } = useToast();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostics/media-sync');
      if (!res.ok) throw new Error('Diagnostic check failed');
      const result = await res.json();
      setData(result);
      addToast('Data sync diagnostics completed', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to run diagnostics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-zinc-700" />
            Media &amp; Database Diagnostics
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time verification of Neon Postgres catalog data vs media asset integrity.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Run Health Scan
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 space-y-3 bg-white border border-zinc-200/60 rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs font-bold uppercase tracking-wider">Scanning Neon database &amp; media records...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider block mb-1">Catalog Products</span>
              <span className="text-2xl font-black text-zinc-900 font-mono">{data.summary.totalProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider block mb-1">Active Categories</span>
              <span className="text-2xl font-black text-zinc-900 font-mono">{data.summary.totalCategories}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider block mb-1">Products w/o Images</span>
              <span className={`text-2xl font-black font-mono ${data.summary.productsWithoutImagesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {data.summary.productsWithoutImagesCount}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider block mb-1">Orphaned Media Records</span>
              <span className={`text-2xl font-black font-mono ${data.summary.orphanedImagesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {data.summary.orphanedImagesCount}
              </span>
            </div>
          </div>

          {/* Detailed Auditing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Missing Images */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Products Missing Images ({data.details.productsWithoutImages.length})
              </h3>
              {data.details.productsWithoutImages.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  All products in Neon have linked image media!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {data.details.productsWithoutImages.map((p) => (
                    <div key={p.id} className="p-3 bg-zinc-50 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-800">{p.name}</span>
                      <span className="font-mono text-zinc-400 text-[10px]">{p.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Missing Thumbnails */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-600" />
                Categories Missing Imagery ({data.details.categoriesWithoutImages.length})
              </h3>
              {data.details.categoriesWithoutImages.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  All categories have active header/cover thumbnails!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {data.details.categoriesWithoutImages.map((c) => (
                    <div key={c.id} className="p-3 bg-zinc-50 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-800">{c.name}</span>
                      <span className="font-mono text-zinc-400 text-[10px]">{c.slug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
