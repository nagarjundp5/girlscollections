'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { WOMEN_MASTER_SIZES, KIDS_MASTER_SIZES, type MasterSizeDefinition } from '@/data/masterSizes';
import { Sparkles, Layers, Link as LinkIcon, Unlink } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SizeRow {
  size_key: string;
  label: string;
  division?: 'women' | 'kids';
  price: string;      // display in Rupees
  mrp: string;        // display in Rupees ('' = none)
  stock: string;
  price_group_id: string | null;
  group_name: string | null;
  is_active: boolean;
  sort: number;
}

export interface PriceGroup {
  id: string;         // local temp id e.g. 'g-1' or uuid
  name: string;
  price: string;
  mrp: string;
}

interface SizesPricingPanelProps {
  division: 'women' | 'kids' | 'both';
  initialRows?: SizeRow[];
  initialGroups?: PriceGroup[];
  onChange: (rows: SizeRow[], groups: PriceGroup[]) => void;
}

const GROUP_COLOURS = [
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
];

function groupColour(idx: number) {
  return GROUP_COLOURS[Math.max(0, idx) % GROUP_COLOURS.length];
}

const KIDS_LABELS: Record<string, string> = {
  k12: '3-9 months', k14: '1 year', k16: '1.5 years', k18: '2 years', k20: '3 years',
  k22: '4 years', k24: '5 years', k26: '6 years', k28: '7 years', k30: '8 years',
  k32: '9 years', k34: '10 years', k36: '11 years', k38: '13-14 years', k40: '15-17 years',
};

function formatKidsLabel(key: string, label: string) {
  if (KIDS_LABELS[key]) return `Size ${key.slice(1)} (${KIDS_LABELS[key]})`;
  return label || key;
}

function buildRows(): SizeRow[] {
  const women: SizeRow[] = WOMEN_MASTER_SIZES.map((d, i) => ({
    size_key: d.code,
    label: d.label || d.code,
    division: 'women',
    price: '',
    mrp: '',
    stock: '1',
    price_group_id: null,
    group_name: null,
    is_active: false,
    sort: i,
  }));

  const kids: SizeRow[] = KIDS_MASTER_SIZES.map((d, i) => ({
    size_key: d.code,
    label: formatKidsLabel(d.code, d.label),
    division: 'kids',
    price: '',
    mrp: '',
    stock: '1',
    price_group_id: null,
    group_name: null,
    is_active: false,
    sort: 100 + i,
  }));

  return [...women, ...kids];
}

let _gid = 1;
function newGroupId() { return `g-${Date.now()}-${_gid++}`; }

function mergeWithMaster(incoming?: SizeRow[]): SizeRow[] {
  const master = buildRows();
  if (!incoming || incoming.length === 0) return master;

  const map = new Map<string, SizeRow>();
  for (const r of incoming) {
    if (r && r.size_key) {
      map.set(r.size_key.trim().toLowerCase(), r);
    }
  }

  return master.map((m) => {
    const key = m.size_key.trim().toLowerCase();
    const inc = map.get(key);
    if (!inc) return m;

    return {
      ...m,
      price: inc.price !== undefined && inc.price !== null && inc.price !== '' ? String(inc.price) : '',
      mrp: inc.mrp !== undefined && inc.mrp !== null && inc.mrp !== '' ? String(inc.mrp) : '',
      stock: inc.stock !== undefined && inc.stock !== '' ? String(inc.stock) : '1',
      price_group_id: inc.price_group_id || null,
      group_name: inc.group_name || null,
      is_active: inc.is_active !== false,
    };
  });
}

export default function SizesPricingPanel({
  division,
  initialRows,
  initialGroups,
  onChange,
}: SizesPricingPanelProps) {
  // Store all rows merged with master chart
  const [rows, setRows] = useState<SizeRow[]>(() => mergeWithMaster(initialRows));

  const [groups, setGroups] = useState<PriceGroup[]>(initialGroups || []);
  
  // Sync when initialRows changes (e.g. async fetch completes)
  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setRows(mergeWithMaster(initialRows));
    }
  }, [initialRows]);

  // Sync when initialGroups changes
  useEffect(() => {
    if (initialGroups && initialGroups.length > 0) {
      setGroups(initialGroups);
    }
  }, [initialGroups]);
  
  // Filter tab if division === 'both'
  const [activeTab, setActiveTab] = useState<'women' | 'kids'>(division === 'kids' ? 'kids' : 'women');

  useEffect(() => {
    if (division === 'kids') setActiveTab('kids');
    else if (division === 'women') setActiveTab('women');
  }, [division]);

  // Bulk Price & Stock states (initial stock = 1)
  const [quickPrice, setQuickPrice] = useState('');
  const [quickMrp, setQuickMrp] = useState('');
  const [quickStock, setQuickStock] = useState('1');
  const [linkAsGroup, setLinkAsGroup] = useState(true);

  const notify = useCallback((r: SizeRow[], g: PriceGroup[]) => {
    onChange(r, g);
  }, [onChange]);

  const update = (r: SizeRow[], g: PriceGroup[] = groups) => {
    setRows(r);
    setGroups(g);
    notify(r, g);
  };

  // Filter rows based on division
  const visibleRows = useMemo(() => {
    if (division === 'women') return rows.filter(r => r.division === 'women');
    if (division === 'kids') return rows.filter(r => r.division === 'kids');
    return rows.filter(r => r.division === activeTab);
  }, [rows, division, activeTab]);

  // Toggle selection on the left checkbox — checking activates & enables size directly with stock=1
  const toggleSizeSelection = (key: string) => {
    const next = rows.map((r) => {
      if (r.size_key !== key) return r;
      const willBeActive = !r.is_active;
      return {
        ...r,
        is_active: willBeActive,
        price: willBeActive && !r.price && quickPrice ? quickPrice : r.price,
        mrp: willBeActive && !r.mrp && quickMrp ? quickMrp : r.mrp,
        stock: willBeActive && (!r.stock || r.stock === '0') ? (quickStock || '1') : (r.stock || '1'),
      };
    });
    update(next);
  };

  const selectAllVisible = (enable: boolean) => {
    const visibleKeys = new Set(visibleRows.map(r => r.size_key));
    const next = rows.map((r) => {
      if (!visibleKeys.has(r.size_key)) return r;
      return {
        ...r,
        is_active: enable,
        price: enable && !r.price && quickPrice ? quickPrice : r.price,
        mrp: enable && !r.mrp && quickMrp ? quickMrp : r.mrp,
        stock: enable && (!r.stock || r.stock === '0') ? (quickStock || '1') : (r.stock || '1'),
      };
    });
    update(next);
  };

  const selectPreset = (keys: string[]) => {
    const keySet = new Set(keys);
    const next = rows.map((r) => {
      if (!visibleRows.some(vr => vr.size_key === r.size_key)) return r;
      const willBeActive = keySet.has(r.size_key);
      return {
        ...r,
        is_active: willBeActive,
        price: willBeActive && !r.price && quickPrice ? quickPrice : r.price,
        mrp: willBeActive && !r.mrp && quickMrp ? quickMrp : r.mrp,
        stock: willBeActive && (!r.stock || r.stock === '0') ? (quickStock || '1') : (r.stock || '1'),
      };
    });
    update(next);
  };

  // Apply price and/or stock to all currently checked/active sizes in visible view
  const applyPriceAndStock = () => {
    const hasPrice = quickPrice && !isNaN(Number(quickPrice)) && Number(quickPrice) > 0;
    const hasStock = quickStock !== '' && !isNaN(Number(quickStock));
    if (!hasPrice && !hasStock) return;

    let newGroups = [...groups];
    let groupId: string | null = null;
    let groupName: string | null = null;

    const targetKeys = new Set(visibleRows.filter(r => r.is_active).map(r => r.size_key));
    if (targetKeys.size === 0) return;

    if (hasPrice && linkAsGroup) {
      const gid = newGroupId();
      const gName = `Group ${String.fromCharCode(65 + newGroups.length)}`;
      newGroups.push({ id: gid, name: gName, price: quickPrice, mrp: quickMrp });
      groupId = gid;
      groupName = gName;
    }

    const next = rows.map((r) => {
      if (!targetKeys.has(r.size_key)) return r;
      const updatedRow: SizeRow = { ...r };
      if (hasPrice) {
        updatedRow.price = quickPrice;
        updatedRow.mrp = quickMrp;
        updatedRow.price_group_id = groupId;
        updatedRow.group_name = groupName;
      }
      if (hasStock) {
        updatedRow.stock = quickStock;
      }
      return updatedRow;
    });

    update(next, newGroups);
  };

  // Apply stock to all active sizes
  const applyStockToSelected = (qty: string) => {
    const targetKeys = new Set(visibleRows.filter(r => r.is_active).map(r => r.size_key));
    const next = rows.map((r) => (targetKeys.has(r.size_key) ? { ...r, stock: qty } : r));
    update(next);
  };

  // Update a single row field
  const updateRowField = (key: string, patch: Partial<SizeRow>) => {
    const next = rows.map((r) => (r.size_key === key ? { ...r, ...patch } : r));
    update(next);
  };

  // Edit group price
  const updateGroupPrice = (gid: string, price: string, mrp: string) => {
    const newGroups = groups.map((g) => (g.id === gid ? { ...g, price, mrp } : g));
    const next = rows.map((r) => (r.price_group_id === gid ? { ...r, price, mrp } : r));
    update(next, newGroups);
  };

  // Unlink size from group
  const unlinkSize = (key: string) => {
    const next = rows.map((r) => (r.size_key === key ? { ...r, price_group_id: null, group_name: null } : r));
    update(next);
  };

  // Quick preset: Women XS-XXL + 3XL-5XL groups
  const applyWomenDefaultGroups = () => {
    const g1Id = newGroupId();
    const g2Id = newGroupId();
    const g1: PriceGroup = { id: g1Id, name: 'Group A (XS–XXL)', price: quickPrice || '', mrp: quickMrp || '' };
    const g2: PriceGroup = { id: g2Id, name: 'Group B (3XL–5XL)', price: quickPrice || '', mrp: quickMrp || '' };

    const grp1 = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    const grp2 = new Set(['3XL', '4XL', '5XL']);

    const next = rows.map((r) => {
      if (grp1.has(r.size_key)) {
        return { ...r, is_active: true, price_group_id: g1Id, group_name: g1.name, price: quickPrice || r.price, mrp: quickMrp || r.mrp };
      }
      if (grp2.has(r.size_key)) {
        return { ...r, is_active: true, price_group_id: g2Id, group_name: g2.name, price: quickPrice || r.price, mrp: quickMrp || r.mrp };
      }
      return r;
    });

    update(next, [...groups, g1, g2]);
  };

  // Quick preset: Kids Split by Range (12-20, 22-28, 30-40)
  const applyKidsRangePreset = () => {
    const g1Id = newGroupId();
    const g2Id = newGroupId();
    const g3Id = newGroupId();
    const g1: PriceGroup = { id: g1Id, name: 'Kids 12–20 (3m–3y)', price: quickPrice || '', mrp: quickMrp || '' };
    const g2: PriceGroup = { id: g2Id, name: 'Kids 22–28 (4y–7y)', price: quickPrice || '', mrp: quickMrp || '' };
    const g3: PriceGroup = { id: g3Id, name: 'Kids 30–40 (8y–17y)', price: quickPrice || '', mrp: quickMrp || '' };

    const r1 = new Set(['k12', 'k14', 'k16', 'k18', 'k20']);
    const r2 = new Set(['k22', 'k24', 'k26', 'k28']);
    const r3 = new Set(['k30', 'k32', 'k34', 'k36', 'k38', 'k40']);

    const next = rows.map((r) => {
      if (r1.has(r.size_key)) {
        return { ...r, is_active: true, price_group_id: g1Id, group_name: g1.name, price: quickPrice || r.price, mrp: quickMrp || r.mrp };
      }
      if (r2.has(r.size_key)) {
        return { ...r, is_active: true, price_group_id: g2Id, group_name: g2.name, price: quickPrice || r.price, mrp: quickMrp || r.mrp };
      }
      if (r3.has(r.size_key)) {
        return { ...r, is_active: true, price_group_id: g3Id, group_name: g3.name, price: quickPrice || r.price, mrp: quickMrp || r.mrp };
      }
      return r;
    });

    update(next, [...groups, g1, g2, g3]);
  };

  const activeVisibleCount = visibleRows.filter(r => r.is_active).length;
  const allActiveRows = useMemo(() => rows.filter((r) => r.is_active), [rows]);

  const startingPrice = useMemo(() => {
    const activePrices = allActiveRows
      .map((r) => Number(r.price))
      .filter((p) => !isNaN(p) && p > 0);
    return activePrices.length > 0 ? Math.min(...activePrices) : null;
  }, [allActiveRows]);

  const getGroupIdx = (gid: string | null) => {
    if (!gid) return 0;
    const idx = groups.findIndex((g) => g.id === gid);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="w-full space-y-4">
      {/* ── Tabs when 'both' is selected ── */}
      {division === 'both' && (
        <div className="flex border-b border-zinc-200">
          <button
            type="button"
            onClick={() => setActiveTab('women')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'women'
                ? 'border-zinc-900 text-zinc-950 font-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Women&apos;s Sizes ({rows.filter(r => r.division === 'women' && r.is_active).length} active)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kids')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'kids'
                ? 'border-zinc-900 text-zinc-950 font-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Kids Chart ({rows.filter(r => r.division === 'kids' && r.is_active).length} active)
          </button>
        </div>
      )}

      {/* ── Top Header Banner: Starting Price + Quick Presets ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 bg-zinc-900 text-white rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Starting Price (Auto)
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {startingPrice ? `₹${startingPrice.toLocaleString('en-IN')}` : '—'}
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/15 text-zinc-200 ml-2">
            {allActiveRows.length} sizes active
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => selectAllVisible(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-md bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => selectAllVisible(false)}
            className="px-3 py-1.5 text-xs font-bold rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>

          {(division === 'women' || (division === 'both' && activeTab === 'women')) && (
            <>
              <button
                type="button"
                onClick={() => selectPreset(['XS', 'S', 'M', 'L', 'XL', 'XXL'])}
                className="px-3 py-1.5 text-xs font-bold rounded-md bg-zinc-700 hover:bg-zinc-600 text-white transition-colors cursor-pointer"
              >
                XS–XXL
              </button>
              <button
                type="button"
                onClick={applyWomenDefaultGroups}
                className="px-3 py-1.5 text-xs font-bold rounded-md bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer"
              >
                Women Preset (XS–XXL + 3XL–5XL groups)
              </button>
            </>
          )}

          {(division === 'kids' || (division === 'both' && activeTab === 'kids')) && (
            <>
              <button
                type="button"
                onClick={() => selectPreset(['k12', 'k14', 'k16', 'k18', 'k20', 'k22', 'k24', 'k26', 'k28', 'k30', 'k32', 'k34', 'k36', 'k38', 'k40'])}
                className="px-3 py-1.5 text-xs font-bold rounded-md bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
              >
                Kids 12–40 Even
              </button>
              <button
                type="button"
                onClick={applyKidsRangePreset}
                className="px-3 py-1.5 text-xs font-bold rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                Kids Split Range Groups
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Easy Set Price & Stock Bar ── */}
      <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-zinc-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            Set Price &amp; Stock For Selected ({activeVisibleCount} sizes selected)
          </span>
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={linkAsGroup}
              onChange={(e) => setLinkAsGroup(e.target.checked)}
              className="rounded text-zinc-900 focus:ring-zinc-900"
            />
            <span>Link as Group (sync prices)</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Price input */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-xs">₹</span>
            <input
              type="number"
              placeholder="Price (₹)"
              value={quickPrice}
              onChange={(e) => setQuickPrice(e.target.value)}
              className="pl-6 pr-2 py-1.5 w-28 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* MRP input */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-xs">₹</span>
            <input
              type="number"
              placeholder="MRP (₹ opt)"
              value={quickMrp}
              onChange={(e) => setQuickMrp(e.target.value)}
              className="pl-6 pr-2 py-1.5 w-28 text-xs font-mono bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* Direct Stock input */}
          <div className="flex items-center gap-1 bg-white border border-zinc-300 rounded-md px-2 py-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">Stock:</span>
            <input
              type="number"
              min="0"
              placeholder="1"
              value={quickStock}
              onChange={(e) => setQuickStock(e.target.value)}
              className="w-14 text-xs font-mono font-bold text-zinc-900 focus:outline-none"
            />
          </div>

          {/* Apply button */}
          <button
            type="button"
            onClick={applyPriceAndStock}
            disabled={(!quickPrice && quickStock === '') || activeVisibleCount === 0}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            Apply to Selected ({activeVisibleCount})
          </button>

          {/* Quick price presets */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-medium">Quick ₹:</span>
            {[799, 999, 1299, 1499, 1999].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuickPrice(p.toString())}
                className="px-2 py-0.5 text-[11px] font-mono bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded cursor-pointer"
              >
                ₹{p}
              </button>
            ))}
          </div>

          {/* Quick stock presets */}
          <div className="flex items-center gap-1 sm:ml-auto">
            <span className="text-[11px] text-zinc-400 font-medium">Stock:</span>
            {[1, 2, 5, 10, 0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuickStock(s.toString());
                  applyStockToSelected(s.toString());
                }}
                disabled={activeVisibleCount === 0}
                className="px-2 py-0.5 text-[11px] font-mono bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-700 border border-zinc-200 rounded cursor-pointer"
                title={s === 0 ? 'Mark sold out (0)' : `Set stock to ${s}`}
              >
                {s === 0 ? '0 (Out)' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Price Groups Strip ── */}
      {groups.length > 0 && (
        <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5" />
            Active Linked Price Groups (editing price updates all member sizes)
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((g, gi) => (
              <div
                key={g.id}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${groupColour(gi)}`}
              >
                <span className="font-bold">{g.name}:</span>
                <div className="flex items-center gap-1 font-mono font-bold">
                  <span>₹</span>
                  <input
                    type="number"
                    value={g.price}
                    onChange={(e) => updateGroupPrice(g.id, e.target.value, g.mrp)}
                    placeholder="Price"
                    className="w-16 px-1.5 py-0.5 bg-white border border-current/25 rounded text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
                {g.mrp && (
                  <div className="flex items-center gap-1 text-[11px] opacity-75 font-mono">
                    <span>MRP ₹</span>
                    <input
                      type="number"
                      value={g.mrp}
                      onChange={(e) => updateGroupPrice(g.id, g.price, e.target.value)}
                      placeholder="MRP"
                      className="w-16 px-1.5 py-0.5 bg-white border border-current/25 rounded text-xs font-mono focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Laptop Proper Full-Width Table View ── */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-zinc-100/90 border-b border-zinc-200 text-zinc-700 text-xs uppercase tracking-wider font-bold">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={activeVisibleCount === visibleRows.length && visibleRows.length > 0}
                  onChange={(e) => selectAllVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  title="Select All Sizes"
                />
              </th>
              <th className="py-2.5 px-3 min-w-[160px]">Size / Age Group</th>
              <th className="py-2.5 px-2 w-32">Price (₹)</th>
              <th className="py-2.5 px-2 w-28">MRP (₹)</th>
              <th className="py-2.5 px-2 w-20 text-center">Discount</th>
              <th className="py-2.5 px-2 w-24">Stock</th>
              <th className="py-2.5 px-3 min-w-[120px]">Group Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            {visibleRows.map((row) => {
              const isEnabled = row.is_active;
              const gIdx = getGroupIdx(row.price_group_id);
              const isGrouped = row.price_group_id !== null;
              const pNum = Number(row.price);
              const mrpNum = Number(row.mrp);
              const disc = isEnabled && pNum > 0 && mrpNum > pNum ? Math.round(100 - (pNum / mrpNum) * 100) : null;

              return (
                <tr
                  key={row.size_key}
                  className={`transition-colors duration-150 ${
                    isEnabled
                      ? 'bg-white hover:bg-zinc-50'
                      : 'bg-zinc-50/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Left Checkbox to Select Size */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleSizeSelection(row.size_key)}
                      className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </td>

                  {/* Size Label (clicking anywhere toggles selection) */}
                  <td
                    onClick={() => toggleSizeSelection(row.size_key)}
                    className="py-2 px-3 font-bold text-zinc-900 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm">{row.label}</span>
                      {isEnabled ? (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-normal">
                          (click to select)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price (₹) Input */}
                  <td className="py-2 px-2">
                    {isEnabled ? (
                      isGrouped ? (
                        <div className="flex items-center gap-1 text-zinc-800">
                          <span className="font-mono font-bold text-xs sm:text-sm">
                            ₹{row.price ? Number(row.price).toLocaleString('en-IN') : '0'}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium">(group)</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={row.price}
                            onChange={(e) => updateRowField(row.size_key, { price: e.target.value })}
                            placeholder="Price"
                            className="w-full pl-5 pr-1.5 py-1 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
                            min="0"
                          />
                        </div>
                      )
                    ) : (
                      <span className="text-zinc-300 font-mono">—</span>
                    )}
                  </td>

                  {/* MRP (₹) Input */}
                  <td className="py-2 px-2">
                    {isEnabled ? (
                      isGrouped ? (
                        <div className="text-zinc-500 font-mono text-xs">
                          {row.mrp ? `₹${Number(row.mrp).toLocaleString('en-IN')}` : '—'}
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={row.mrp}
                            onChange={(e) => updateRowField(row.size_key, { mrp: e.target.value })}
                            placeholder="MRP"
                            className="w-full pl-5 pr-1.5 py-1 text-xs font-mono bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
                            min="0"
                          />
                        </div>
                      )
                    ) : (
                      <span className="text-zinc-300 font-mono">—</span>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="py-2 px-2 text-center">
                    {disc !== null ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        {disc}% OFF
                      </span>
                    ) : (
                      <span className="text-zinc-300 font-mono">—</span>
                    )}
                  </td>

                  {/* Stock Input */}
                  <td className="py-2 px-2">
                    {isEnabled ? (
                      <input
                        type="number"
                        value={row.stock}
                        onChange={(e) => updateRowField(row.size_key, { stock: e.target.value })}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 text-center"
                        min="0"
                      />
                    ) : (
                      <span className="text-zinc-300 font-mono">—</span>
                    )}
                  </td>

                  {/* Group Link Badge */}
                  <td className="py-2 px-3">
                    {isEnabled && row.group_name ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border truncate max-w-[100px] ${groupColour(gIdx)}`}>
                          {row.group_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => unlinkSize(row.size_key)}
                          title="Unlink from group"
                          className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-0.5 shrink-0"
                        >
                          <Unlink className="w-3 h-3" />
                        </button>
                      </div>
                    ) : isEnabled ? (
                      <span className="text-[10px] text-zinc-400">Independent</span>
                    ) : (
                      <span className="text-zinc-300 font-mono">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Validation notice */}
      {allActiveRows.length === 0 ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          Please check at least one size on the left to include it with this product.
        </div>
      ) : allActiveRows.some((r) => !r.price || isNaN(Number(r.price)) || Number(r.price) <= 0) ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
          Please enter a valid price (&gt; ₹0) for all checked sizes.
        </div>
      ) : null}
    </div>
  );
}
