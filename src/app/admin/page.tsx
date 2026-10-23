'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, ShoppingBag, Package, AlertTriangle, Users, Eye, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { DriftModeAdminCard } from '@/components/DriftModeAdminCard';

interface CategoryHealthItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  isHealthy: boolean;
}

export default function AdminDashboard() {
  const [range, setRange] = useState<'today' | 'week' | 'month'>('month');
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockAlerts: 0,
    categoryCount: 0,
  });
  const [categoryHealth, setCategoryHealth] = useState<CategoryHealthItem[]>([]);

  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [visitorStats, setVisitorStats] = useState<{ liveVisitors: number; monthlyVisitors: number; overallVisitors: number }>({
    liveVisitors: 0,
    monthlyVisitors: 0,
    overallVisitors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async (selectedRange: 'today' | 'week' | 'month') => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setMetrics(data.metrics);
        setCategoryHealth(data.categoryHealth || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(range);

    const fetchLiveVisitors = async () => {
      try {
        const [resUsers, resVisitors] = await Promise.all([
          fetch('/api/admin/users/active'),
          fetch('/api/admin/visitors/stats'),
        ]);
        const dataUsers = await resUsers.json();
        if (resUsers.ok && dataUsers.success) {
          setActiveUsersCount(dataUsers.count);
        }
        const dataVisitors = await resVisitors.json();
        if (resVisitors.ok && dataVisitors.success) {
          setVisitorStats({
            liveVisitors: dataVisitors.liveVisitors || 0,
            monthlyVisitors: dataVisitors.monthlyVisitors || 0,
            overallVisitors: dataVisitors.overallVisitors || 0,
          });
        }
      } catch (e) {
        // Silently handle polling error
      }
    };

    fetchLiveVisitors();
    const interval = setInterval(fetchLiveVisitors, 15000);
    return () => clearInterval(interval);
  }, [range]);

  return (
    <div className="space-y-8 animate-fade-in text-zinc-900">
      {/* Header & Date Range Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900">Dashboard Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Authoritative analytics &amp; catalog category health monitoring.</p>
        </div>

        <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-xs">
          {(['today', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                range === r ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Revenue ({range})</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/50">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 font-mono">
              ₹{metrics.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono mt-1">Authoritative Neon settled orders</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Orders ({range})</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/50">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 font-mono">{metrics.totalOrders}</h3>
            <p className="text-[10px] text-zinc-400 font-mono mt-1">
              {metrics.pendingOrders} pending fulfillment
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-6 bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Products</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/50">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 font-mono">{metrics.totalProducts}</h3>
            <p className="text-[10px] text-zinc-400 font-mono mt-1">{metrics.categoryCount} categories</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Low Stock Warnings</span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-red-600 font-mono">{metrics.lowStockAlerts}</h3>
            <p className="text-[10px] text-zinc-400 font-mono mt-1">Products needing restock</p>
          </div>
        </div>
      </div>

      {/* Real-time Visitor & Active Users Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center gap-3">
          <Eye className="w-5 h-5 text-zariGold shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Live Active Visitors</p>
            <p className="text-xl font-bold font-mono text-zariGold">{visitorStats.liveVisitors}</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center gap-3">
          <Users className="w-5 h-5 text-zariGold shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Registered Active Users</p>
            <p className="text-xl font-bold font-mono text-white">{activeUsersCount}</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center gap-3">
          <Globe className="w-5 h-5 text-zariGold shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Monthly Visitors</p>
            <p className="text-xl font-bold font-mono text-white">{visitorStats.monthlyVisitors}</p>
          </div>
        </div>
      </div>

      <DriftModeAdminCard />

      {/* Category Health & Catalog Gaps Section */}
      <div className="bg-white border border-zinc-200/60 rounded-[16px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-zariGold" />
              Category Catalog Health
            </h2>
            <p className="text-xs text-zinc-500">
              Identifies empty or low-product subcategories across the catalog hierarchy.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="text-xs font-bold uppercase tracking-wider text-zariGold hover:underline"
          >
            Manage Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {categoryHealth.slice(0, 9).map((cat) => (
            <div
              key={cat.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                cat.isHealthy
                  ? 'bg-zinc-50 border-zinc-200'
                  : 'bg-red-50/40 border-red-200 text-red-900'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{cat.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-zinc-200">
                  {cat.productCount} prods
                </span>
                {!cat.isHealthy && (
                  <span title="Low product count">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
