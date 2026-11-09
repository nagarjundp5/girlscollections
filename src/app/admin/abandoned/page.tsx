'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  AlertCircle,
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  ChevronRight,
  X,
  ExternalLink,
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AbandonedPage() {
  const { addToast } = useToast();
  const [tab, setTab] = useState<'bags' | 'checkouts'>('bags');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<any | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/abandoned?tab=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        addToast('Failed to load abandoned data', 'error');
      }
    } catch {
      addToast('Error fetching data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tab]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const p = (item.phone || item.customerInfo?.phone || '').toLowerCase();
      const n = (item.name || item.customerInfo?.name || '').toLowerCase();
      const matchesSearch = !searchPhone || p.includes(searchPhone.toLowerCase()) || n.includes(searchPhone.toLowerCase());
      const s = item.status || 'active';
      const matchesStatus = statusFilter === 'all' || s === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchPhone, statusFilter]);

  // Funnel calculations
  const funnel = useMemo(() => {
    const total = items.length;
    const contacted = items.filter(i => i.contacted).length;
    const converted = items.filter(i => i.status === 'converted' || i.isCompleted).length;
    return { total, contacted, converted };
  }, [items]);

  const handleMarkContacted = async (item: any) => {
    const id = item.cartId || item.sessionId;
    try {
      const res = await fetch('/api/admin/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_contacted', id, tab }),
      });
      if (res.ok) {
        addToast('Marked as contacted', 'success');
        setItems(prev => prev.map(i => (i.cartId === id || i.sessionId === id ? { ...i, contacted: true } : i)));
        if (selectedDrawerItem) {
          setSelectedDrawerItem({ ...selectedDrawerItem, contacted: true });
        }
      }
    } catch {
      addToast('Failed to mark contacted', 'error');
    }
  };

  const exportCSV = () => {
    if (filteredItems.length === 0) return addToast('No records to export', 'error');
    const headers = ['Date', 'Name', 'Phone', 'Items Count', 'Total (₹)', 'Status', 'Contacted'];
    const rows = filteredItems.map(i => [
      i.lastActivity || i.updatedAt || '',
      i.name || i.customerInfo?.name || 'Customer',
      i.phone || i.customerInfo?.phone || '',
      (i.items || i.cartSnapshot || []).length,
      (i.cartTotal || i.total || 0) / 100,
      i.status || '',
      i.contacted ? 'Yes' : 'No'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `abandoned_${tab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppUrl = (item: any) => {
    const phone = (item.phone || item.customerInfo?.phone || '').replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const name = item.name || item.customerInfo?.name || 'there';
    const msg = `Hi ${name}! We noticed you left some lovely items in your bag at The Girls Collections. Would you like any assistance completing your order today? https://thegirlscollections.com/cart`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
            Abandoned Bags &amp; Checkouts
          </h1>
          <p className="text-xs text-zinc-500">
            Real-time tracking of incomplete orders and cart recoveries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchItems}
            className="p-2 bg-white border border-zinc-300 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Funnel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Total Captured
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 mt-1">{funnel.total}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Contacted / Reminded
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{funnel.contacted}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Converted / Recovered
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{funnel.converted}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setTab('bags')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            tab === 'bags'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Abandoned Bags
        </button>
        <button
          onClick={() => setTab('checkouts')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            tab === 'checkouts'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Failed / Pending Checkouts
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search phone or customer name…"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-700 font-bold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="abandoned">Abandoned</option>
            <option value="recovered">Recovered</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status / Step</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
                    Loading tracking records…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No abandoned records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const itemsList = item.items || item.cartSnapshot || [];
                  const phone = item.phone || item.customerInfo?.phone || 'No phone';
                  const name = item.name || item.customerInfo?.name || 'Customer';
                  const total = (item.cartTotal || item.total || 0) / 100;
                  const dateStr = new Date(item.lastActivity || item.updatedAt || item.createdAt || Date.now()).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr
                      key={item.cartId || item.sessionId || Math.random()}
                      onClick={() => setSelectedDrawerItem(item)}
                      className="hover:bg-zinc-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">{dateStr}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{name}</div>
                        <div className="font-mono text-zinc-400 text-[11px]">{phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold">{itemsList.length} items</span>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                          {itemsList.map((i: any) => `${i.name} (${i.size})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-zinc-900">
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {item.step || item.status || 'Active'}
                        </span>
                        {item.contacted && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Contacted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {phone !== 'No phone' && (
                            <a
                              href={getWhatsAppUrl(item)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                          {!item.contacted && (
                            <button
                              onClick={() => handleMarkContacted(item)}
                              className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      {selectedDrawerItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
                  Abandoned Details
                </h3>
                <button
                  onClick={() => setSelectedDrawerItem(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Customer
                </div>
                <div className="font-bold text-zinc-900">
                  {selectedDrawerItem.name || selectedDrawerItem.customerInfo?.name || 'Customer'}
                </div>
                <div className="text-xs font-mono text-zinc-600">
                  Phone: {selectedDrawerItem.phone || selectedDrawerItem.customerInfo?.phone || 'N/A'}
                </div>
                <div className="text-xs font-mono text-zinc-600">
                  Device: {selectedDrawerItem.sourceDevice || selectedDrawerItem.device || 'Mobile'}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Items in Cart
                </div>
                <div className="space-y-2">
                  {(selectedDrawerItem.items || selectedDrawerItem.cartSnapshot || []).map((i: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900">{i.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          Size: {i.size} • Qty: {i.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-zinc-900">
                        ₹{((i.price || 0) * (i.quantity || 1) / 100).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-200 flex items-center gap-2">
              <a
                href={getWhatsAppUrl(selectedDrawerItem)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-4 h-4" /> Send WhatsApp
              </a>
              {!selectedDrawerItem.contacted && (
                <button
                  onClick={() => handleMarkContacted(selectedDrawerItem)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold"
                >
                  Mark Contacted
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

