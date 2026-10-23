'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { Product, Category } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Tag,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';

export default function AdminProducts() {
  const { addToast } = useToast();
  const router = useRouter();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');

  // Sort states
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'stock' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selection & Bulk actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkWeightModalOpen, setIsBulkWeightModalOpen] = useState(false);
  const [bulkWeightInput, setBulkWeightInput] = useState('');
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [targetCategorySlug, setTargetCategorySlug] = useState('');
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load products and categories from DB
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [prodsData, catsData] = await Promise.all([
        db.getAllProducts(),
        db.getAllCategories(),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      addToast('Failed to load products or categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category slug-to-name lookup map
  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.slug] = c.name || c.label || c.slug;
    });
    return map;
  }, [categories]);

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search term
      const search = searchTerm.toLowerCase().trim();
      if (search) {
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesCat = (p.category || '').toLowerCase().includes(search);
        const matchesSlug = (p.slug || '').toLowerCase().includes(search);
        const matchesAge = (p.gender || '').toLowerCase().includes(search);
        if (!matchesName && !matchesCat && !matchesSlug && !matchesAge) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // 3. Age Group filter
      if (selectedAgeGroup !== 'all' && p.gender !== selectedAgeGroup) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'all') {
        const isActive = p.is_active;
        if (selectedStatus === 'active' && !isActive) return false;
        if (selectedStatus === 'draft' && isActive) return false;
      }

      // 5. Stock filter
      const totalStock = Object.values(p.stock_quantity || {}).reduce((a, b) => a + b, 0);
      const hasLowStockSize = Object.values(p.stock_quantity || {}).some((qty) => qty >= 1 && qty <= 3);

      if (selectedStock === 'in_stock' && totalStock === 0) return false;
      if (selectedStock === 'out_of_stock' && totalStock > 0) return false;
      if (selectedStock === 'low_stock' && !(hasLowStockSize || (totalStock > 0 && totalStock <= 5))) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'stock') {
        const stockA = Object.values(a.stock_quantity || {}).reduce((x, y) => x + y, 0);
        const stockB = Object.values(b.stock_quantity || {}).reduce((x, y) => x + y, 0);
        comparison = stockA - stockB;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        // created_at default
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, searchTerm, selectedCategory, selectedAgeGroup, selectedStatus, selectedStock, sortBy, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedAgeGroup, selectedStatus, selectedStock, sortBy, sortOrder]);

  // Paginated product slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAllCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedProducts.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // Status toggle per product
  const toggleProductActive = async (product: Product) => {
    if (actionLoadingId) return;
    setActionLoadingId(product.id);
    try {
      await db.updateProduct(product.id, { is_active: !product.is_active });
      addToast(`"${product.name}" is now ${!product.is_active ? 'Active' : 'Draft'}`, 'success');
      await fetchInitialData();
    } catch (error) {
      addToast('Failed to update product status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Duplicate single product
  const handleDuplicateProduct = async (product: Product) => {
    if (actionLoadingId) return;
    setActionLoadingId(product.id);
    try {
      const res = await fetch('/api/admin/products/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Duplication failed');

      addToast(`Product "${product.name}" duplicated successfully!`, 'success');
      await fetchInitialData();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to duplicate product', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete single product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (actionLoadingId) return;
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setActionLoadingId(id);
    try {
      await db.deleteProduct(id);
      addToast(`Product "${name}" deleted successfully`, 'success');
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      await fetchInitialData();
    } catch (error) {
      console.error(error);
      addToast('Failed to delete product', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk Actions Handlers
  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0 || isUpdatingBulk) return;
    setIsUpdatingBulk(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, is_active: isActive }),
      });
      if (!res.ok) throw new Error('Bulk status update failed');
      addToast(`Updated status to ${isActive ? 'Active' : 'Draft'} for ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
      await fetchInitialData();
    } catch (err) {
      addToast('Bulk status update failed', 'error');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleBulkCategoryReassign = async () => {
    if (!targetCategorySlug || selectedIds.length === 0 || isUpdatingBulk) return;
    setIsUpdatingBulk(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, category: targetCategorySlug }),
      });
      if (!res.ok) throw new Error('Bulk category reassign failed');
      addToast(`Reassigned category for ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
      setIsBulkCategoryModalOpen(false);
      setTargetCategorySlug('');
      await fetchInitialData();
    } catch (err) {
      addToast('Bulk category reassignment failed', 'error');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleBulkWeightUpdate = async () => {
    if (!bulkWeightInput || isNaN(Number(bulkWeightInput))) {
      return addToast('Please enter a valid weight in grams', 'error');
    }
    const weightVal = Math.round(Number(bulkWeightInput));
    if (weightVal <= 0) return addToast('Weight must be at least 1 gram', 'error');
    setIsUpdatingBulk(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, weight_grams: weightVal }),
      });
      if (!res.ok) throw new Error('Bulk weight update failed');
      addToast(`Updated weight for ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
      setIsBulkWeightModalOpen(false);
      setBulkWeightInput('');
      await fetchInitialData();
    } catch (err) {
      addToast('Failed to update product weights', 'error');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || isUpdatingBulk) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected products?`)) return;
    setIsUpdatingBulk(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Bulk delete failed');
      addToast(`Permanently deleted ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
      await fetchInitialData();
    } catch (err) {
      addToast('Bulk delete failed', 'error');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-900 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-red" />
            Product Catalog
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage inventory, categories, age groups, pricing, and variant options.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="bg-zinc-900 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors flex items-center gap-2 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, category, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-zinc-900 transition-all rounded-lg font-medium"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold text-zinc-500 uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-900 font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="created_at">Date Added</option>
                <option value="price">Price</option>
                <option value="stock">Total Stock</option>
                <option value="name">Name</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>

            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-xs">
              <span className="font-bold text-zinc-500 uppercase tracking-wider">Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-transparent text-zinc-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-100">
          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none focus:border-zinc-900 transition-colors uppercase tracking-wider"
            >
              <option value="all">All Categories</option>
              {categories.filter((c) => c.is_active !== false).map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Age Group</label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none focus:border-zinc-900 transition-colors uppercase tracking-wider"
            >
              <option value="all">All Age Groups</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none focus:border-zinc-900 transition-colors uppercase tracking-wider"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Draft / Soft-Deleted</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Stock Level</label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none focus:border-zinc-900 transition-colors uppercase tracking-wider"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock Tier (1-3 size / ≤5 total)</option>
              <option value="out_of_stock">Out of Stock (0 total)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Items Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-brand-red text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
              Apply bulk operations to selected products:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatus(true)}
              disabled={isUpdatingBulk}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              disabled={isUpdatingBulk}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
            >
              Set Draft
            </button>
            <button
              onClick={() => setIsBulkCategoryModalOpen(true)}
              disabled={isUpdatingBulk}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
            >
              Reassign Category
            </button>
            <button
              onClick={() => setIsBulkWeightModalOpen(true)}
              disabled={isUpdatingBulk}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
            >
              Set Weight
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isUpdatingBulk}
              className="bg-red-950/80 hover:bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors border border-red-900 disabled:opacity-50"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-zinc-400 hover:text-white underline ml-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white border border-zinc-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            <span>Loading products catalog...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllCurrentPage}
                        checked={
                          paginatedProducts.length > 0 &&
                          paginatedProducts.every((p) => selectedIds.includes(p.id))
                        }
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 w-16">Image</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Garment Details</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Price & Discount</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Stock Levels</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-zinc-400 text-sm">
                        No products found matching your active filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => {
                      const totalStock = Object.values(product.stock_quantity || {}).reduce((a, b) => a + b, 0);
                      const isMissingWeight = !product.weight_grams || product.weight_grams === 0;

                      // Discount percentage calculation
                      const hasDiscount = product.compare_price && product.compare_price > product.price;
                      const discountPct = hasDiscount
                        ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
                        : 0;

                      // Category name lookup
                      const categoryDisplayName = categoryNameMap[product.category] || product.category;

                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors ${
                            isMissingWeight ? 'bg-red-50/10' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(product.id)}
                              onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                            />
                          </td>

                          {/* Image */}
                          <td className="p-4">
                            <div className="w-12 h-16 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                              {product.images && product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px] text-zinc-400 font-mono font-bold text-center px-1">
                                  No Image
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Details */}
                          <td className="p-4">
                            <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1 font-semibold flex items-center gap-1.5 flex-wrap">
                              <span className="text-zinc-800 font-bold">{categoryDisplayName}</span>
                              <span>•</span>
                              <span className="capitalize text-zinc-600">{product.gender || 'Women'}</span>
                              {product.weight_grams ? (
                                <>
                                  <span>•</span>
                                  <span>
                                    {product.weight_grams >= 1000
                                      ? `${(product.weight_grams / 1000).toFixed(1)}kg`
                                      : `${product.weight_grams}g`}
                                  </span>
                                </>
                              ) : null}
                            </p>
                            {isMissingWeight && (
                              <span className="inline-block mt-1 text-[9px] font-extrabold tracking-widest bg-red-50 text-red-500 border border-red-150 px-2 py-0.5 rounded uppercase">
                                ⚠️ Missing Weight
                              </span>
                            )}
                          </td>

                          {/* Price & Discount */}
                          <td className="p-4">
                            <div className="text-sm font-mono font-bold text-zinc-900">
                              ₹{(product.price / 100).toFixed(2)}
                            </div>
                            {hasDiscount && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-mono text-zinc-400 line-through">
                                  ₹{(product.compare_price! / 100).toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                  {discountPct}% OFF
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Stock Breakdown with Low-Stock Tiering */}
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 mb-1 max-w-[240px]">
                              {Object.entries(product.stock_quantity || {}).map(([size, qty]) => {
                                let badgeStyle = 'bg-zinc-50 text-zinc-600 border-zinc-200';
                                if (qty === 0) {
                                  badgeStyle = 'bg-red-50 text-red-600 border-red-200 font-extrabold';
                                } else if (qty >= 1 && qty <= 3) {
                                  badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
                                }
                                return (
                                  <span
                                    key={size}
                                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeStyle}`}
                                  >
                                    {size}:{qty}
                                  </span>
                                );
                              })}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider">
                              {totalStock === 0 ? (
                                <span className="text-red-600 font-extrabold">Total: 0 (Out of Stock)</span>
                              ) : totalStock <= 5 ? (
                                <span className="text-amber-700 font-bold">Total: {totalStock} (Low Stock)</span>
                              ) : (
                                <span className="text-zinc-500 font-bold">Total: {totalStock}</span>
                              )}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <button
                              onClick={() => toggleProductActive(product)}
                              disabled={actionLoadingId === product.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${
                                product.is_active
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                              }`}
                            >
                              {product.is_active ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-zinc-400" />
                              )}
                              {product.is_active ? 'Active' : 'Draft'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Edit */}
                              <button
                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                className="p-2 text-zinc-500 hover:text-zinc-950 transition-colors border border-zinc-200 hover:bg-zinc-50 rounded-lg bg-white shadow-sm"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicateProduct(product)}
                                disabled={actionLoadingId === product.id}
                                className="p-2 text-zinc-500 hover:text-zinc-950 transition-colors border border-zinc-200 hover:bg-zinc-50 rounded-lg bg-white shadow-sm"
                                title="Duplicate Product (Speed up variant creation)"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={actionLoadingId === product.id}
                                className="p-2 text-zinc-400 hover:text-brand-red transition-colors border border-zinc-200 hover:bg-red-50 rounded-lg bg-white shadow-sm"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="md:hidden divide-y divide-zinc-100">
              {paginatedProducts.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm">No products found.</div>
              ) : (
                paginatedProducts.map((product) => {
                  const totalStock = Object.values(product.stock_quantity || {}).reduce((a, b) => a + b, 0);
                  const isMissingWeight = !product.weight_grams || product.weight_grams === 0;
                  const hasDiscount = product.compare_price && product.compare_price > product.price;
                  const discountPct = hasDiscount
                    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
                    : 0;

                  return (
                    <div key={product.id} className="p-4 space-y-3 bg-white">
                      <div className="flex gap-3 items-start">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-1"
                        />
                        <div className="w-14 h-18 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-zinc-400 font-mono font-bold text-center">No Img</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 truncate">{product.name}</h3>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                            {categoryNameMap[product.category] || product.category} • {product.gender || 'Women'}
                          </p>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-sm font-mono font-bold text-zinc-900">
                              ₹{(product.price / 100).toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs font-mono text-zinc-400 line-through">
                                ₹{(product.compare_price! / 100).toFixed(2)} ({discountPct}% OFF)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock breakdown */}
                      <div className="border-t border-zinc-100 pt-2 flex flex-wrap gap-1">
                        {Object.entries(product.stock_quantity || {}).map(([size, qty]) => (
                          <span
                            key={size}
                            className={`text-[9px] uppercase px-1.5 py-0.5 border rounded ${
                              qty === 0
                                ? 'bg-red-50 text-red-600 border-red-200 font-extrabold'
                                : qty <= 3
                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                            }`}
                          >
                            {size}:{qty}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="border-t border-zinc-100 pt-2 flex items-center justify-between">
                        <button
                          onClick={() => toggleProductActive(product)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${
                            product.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Draft'}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase border border-zinc-200 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase border border-zinc-200 rounded"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase border border-red-200 text-red-600 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 font-medium">
                Showing{' '}
                <span className="font-bold text-zinc-900">
                  {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-zinc-900">
                  {Math.min(currentPage * pageSize, filteredProducts.length)}
                </span>{' '}
                of <span className="font-bold text-zinc-900">{filteredProducts.length}</span> products
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-zinc-700 font-mono px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Category Reassignment Modal */}
      {isBulkCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest border-b border-zinc-100 pb-2">
              Bulk Reassign Category
            </h3>
            <p className="text-xs text-zinc-500">
              Reassign category for <span className="font-bold">{selectedIds.length}</span> selected products.
            </p>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block">
                Target Category
              </label>
              <select
                value={targetCategorySlug}
                onChange={(e) => setTargetCategorySlug(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 text-sm focus:outline-none focus:border-zinc-900 rounded-lg font-bold"
              >
                <option value="" disabled>-- Select Category --</option>
                {categories.filter((c) => c.is_active !== false).map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setIsBulkCategoryModalOpen(false);
                  setTargetCategorySlug('');
                }}
                className="border border-zinc-200 text-zinc-650 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingBulk || !targetCategorySlug}
                onClick={handleBulkCategoryReassign}
                className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                {isUpdatingBulk ? 'Saving...' : 'Confirm Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Set Weight Modal */}
      {isBulkWeightModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest border-b border-zinc-100 pb-2">
              Bulk Set Weight
            </h3>
            <p className="text-xs text-zinc-500">
              Set weight for <span className="font-bold">{selectedIds.length}</span> selected products.
            </p>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block">
                Weight (Grams)
              </label>
              <input
                type="number"
                value={bulkWeightInput}
                onChange={(e) => setBulkWeightInput(e.target.value)}
                placeholder="e.g. 250"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors rounded-lg font-mono"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setIsBulkWeightModalOpen(false);
                  setBulkWeightInput('');
                }}
                className="border border-zinc-200 text-zinc-650 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingBulk || !bulkWeightInput}
                onClick={handleBulkWeightUpdate}
                className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                {isUpdatingBulk ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
