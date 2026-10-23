'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { Category } from '@/types';
import {
  Plus,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminCategories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formAgeGroup, setFormAgeGroup] = useState<'ladies' | 'kids' | 'unisex'>('ladies');
  const [formParentGroup, setFormParentGroup] = useState('Kurta Sets');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Policy Exclusion Notice Banner dismissal
  const [showSkippedNotice, setShowSkippedNotice] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategoryActive = async (category: Category) => {
    try {
      const currentActive = category.is_active !== undefined ? category.is_active : true;
      const res = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (!res.ok) throw new Error('Failed to toggle category state');
      addToast(`"${category.name}" is now ${!currentActive ? 'Active' : 'Draft'}`, 'success');
      fetchCategories();
    } catch (error) {
      addToast('Failed to update category state', 'error');
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`Soft-delete category "${name}"?\n\nThis deactivates the category while preserving historical product tags.`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to deactivate category');
      }
      addToast(`Category "${name}" soft-deleted successfully`, 'success');
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Failed to deactivate category', 'error');
    }
  };

  // Open modal for Create or Edit
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormName(category.name);
      setFormSlug(category.slug);
      setFormAgeGroup(category.age_group || 'ladies');
      setFormParentGroup(category.parent_group || 'Kurta Sets');
      setFormSortOrder(category.sort_order || category.display_order || 0);
      setFormIsActive(category.is_active !== false);
    } else {
      setEditingCategory(null);
      setFormName('');
      setFormSlug('');
      setFormAgeGroup('ladies');
      setFormParentGroup('Kurta Sets');
      setFormSortOrder(categories.length + 1);
      setFormIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return addToast('Category name is required', 'error');
    if (!formSlug.trim()) return addToast('Category slug is required', 'error');

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        age_group: formAgeGroup,
        parent_group: formParentGroup.trim(),
        sort_order: Number(formSortOrder) || 0,
        is_active: formIsActive,
      };

      const url = editingCategory ? `/api/admin/categories?id=${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');

      addToast(editingCategory ? `Category "${formName}" updated!` : `Category "${formName}" created!`, 'success');
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.parent_group && c.parent_group.toLowerCase().includes(term)) ||
        (c.age_group && c.age_group.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  // Group categories by age_group, then parent_group
  const groupedCategories = useMemo(() => {
    const map: Record<string, Record<string, Category[]>> = {
      ladies: {},
      kids: {},
      unisex: {},
    };

    filteredCategories.forEach((cat) => {
      const ageKey = cat.age_group || 'ladies';
      const parentKey = cat.parent_group || 'General';
      if (!map[ageKey]) map[ageKey] = {};
      if (!map[ageKey][parentKey]) map[ageKey][parentKey] = [];
      map[ageKey][parentKey].push(cat);
    });

    return map;
  }, [filteredCategories]);

  return (
    <div className="space-y-6 animate-fade-in text-zinc-900 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-red" />
            Category Taxonomy & Groups
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Single source of truth for garment categories, age groups, and product form comboboxes.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* One-time Skipped Policy Banner */}
      {showSkippedNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl shadow-sm flex items-start justify-between gap-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider">Brand Policy Notice: </span>
              Skipped: <strong>&quot;Children Saree&quot;</strong> — brand policy excludes sarees. Add manually if this is an approved exception.
            </div>
          </div>
          <button
            onClick={() => setShowSkippedNotice(false)}
            className="text-amber-700 hover:text-amber-950 p-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-zinc-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search category name, parent group, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 transition-colors rounded-lg font-medium"
          />
        </div>
        <div className="text-xs font-mono font-bold text-zinc-500">
          Total: {categories.length} Categories
        </div>
      </div>

      {/* Category Groups View */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-2 bg-white border border-zinc-200 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
          <span>Loading categories database...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {(['ladies', 'kids', 'unisex'] as const).map((ageKey) => {
            const parentGroups = groupedCategories[ageKey];
            if (!parentGroups || Object.keys(parentGroups).length === 0) return null;

            const ageTitle = ageKey === 'ladies' ? 'LADIES' : ageKey === 'kids' ? 'KIDS' : 'UNISEX';

            return (
              <div key={ageKey} className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-sm space-y-6">
                {/* Age Group Header */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-red" />
                    {ageTitle} CATEGORIES ({Object.values(parentGroups).flat().length})
                  </h2>
                </div>

                {/* Parent Group Sections */}
                <div className="space-y-6">
                  {Object.entries(parentGroups).map(([parentName, catItems]) => (
                    <div key={parentName} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 px-3 py-1.5 rounded-md border border-zinc-200/60">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Parent Group: {parentName}</span>
                        <span className="font-mono text-[10px] text-zinc-400 ml-auto">
                          ({catItems.length} categories)
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-zinc-100 rounded-lg">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/50">
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category Name</th>
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Slug</th>
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Products Tagged</th>
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</th>
                              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catItems.map((cat) => {
                              const isActive = cat.is_active !== false;
                              return (
                                <tr key={cat.id} className="border-b border-zinc-100 hover:bg-zinc-50/40 transition-colors">
                                  <td className="p-3 text-xs font-bold text-zinc-900">
                                    {cat.name}
                                  </td>
                                  <td className="p-3 text-xs font-mono text-zinc-500">
                                    /{cat.slug}
                                  </td>
                                  <td className="p-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                                      <Package className="w-3 h-3 text-zinc-400" />
                                      {cat.productCount ?? 0} Products
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <button
                                      onClick={() => toggleCategoryActive(cat)}
                                      className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${
                                        isActive
                                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                                      }`}
                                    >
                                      {isActive ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-zinc-400" />}
                                      {isActive ? 'Active' : 'Draft'}
                                    </button>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => openModal(cat)}
                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-50 rounded-lg bg-white shadow-sm"
                                        title="Edit Category"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeactivate(cat.id, cat.name)}
                                        className="p-1.5 text-zinc-400 hover:text-brand-red border border-zinc-200 hover:bg-red-50 rounded-lg bg-white shadow-sm"
                                        title="Soft Delete / Deactivate"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-600 tracking-wider">
                  Category Name <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anarkali Kurta Suit Set"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 text-sm focus:outline-none focus:border-zinc-900 rounded-lg font-medium"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-600 tracking-wider">
                  Slug URL <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. anarkali-kurta-suit-set"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-900 rounded-lg"
                  required
                />
              </div>

              {/* Age Group */}
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-600 tracking-wider">
                  Age Group <span className="text-brand-red">*</span>
                </label>
                <select
                  value={formAgeGroup}
                  onChange={(e) => setFormAgeGroup(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-zinc-900"
                  required
                >
                  <option value="ladies">Ladies</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              {/* Parent Group */}
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-zinc-600 tracking-wider">
                  Parent Group <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kurta Sets, Frocks, Gowns, Ethnic Sets, Western/Casual"
                  value={formParentGroup}
                  onChange={(e) => setFormParentGroup(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 text-sm focus:outline-none focus:border-zinc-900 rounded-lg font-medium"
                  required
                />
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-600 tracking-wider">Sort Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="catIsActive" className="text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer">
                    Is Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
